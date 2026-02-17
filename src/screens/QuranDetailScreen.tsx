import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Ayah, quranService } from '../services/quranService';

// ... (imports remain the same)

// Inside QuranDetailScreen component:


// --- HELPER: ARAPÇA RAKAMLAR ---
const renderArabicNumber = (n: number) => {
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    return n.toString().replace(/\d/g, d => arabicDigits[parseInt(d)]);
};

export default function QuranDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const surahId = Number(params.surahId);
    const surahName = params.surahName as string;
    const initialMode = (params.initialMode as 'list' | 'page') || 'list';

    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);

    // YENİ: Görünüm Modu (Parametreden gelen değere göre başla)
    const [viewMode, setViewMode] = useState<'list' | 'page'>(initialMode);

    // YENİ: Sayfa takibi
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const flatListRef = useRef<FlatList>(null);
    const pageListRef = useRef<FlatList>(null); // Sayfa modu için

    // Audio referansı
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        loadSurahDetails();
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        soundRef.current = sound;
    }, [sound]);

    const loadSurahDetails = async () => {
        try {
            const data = await quranService.getSurahDetails(surahId);
            setAyahs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- SAYFALAMA MANTIĞI ---
    // Ayetleri sayfa numarasına göre grupla
    const pages = React.useMemo(() => {
        if (ayahs.length === 0) return [];
        const groups: { pageNumber: number, ayahs: Ayah[] }[] = [];

        let currentPage = ayahs[0]?.page;
        let currentGroup: Ayah[] = [];

        ayahs.forEach(ayah => {
            if (ayah.page !== currentPage) {
                groups.push({ pageNumber: currentPage, ayahs: currentGroup });
                currentPage = ayah.page;
                currentGroup = [];
            }
            currentGroup.push(ayah);
        });
        if (currentGroup.length > 0) {
            groups.push({ pageNumber: currentPage, ayahs: currentGroup });
        }
        return groups;
    }, [ayahs]);

    // Mushaf modunda sayfa değişimini yakala
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            setCurrentPageIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    // --- AUDIO LOGIC ---
    const stopAudio = async () => {
        if (sound) {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    await sound.unloadAsync();
                }
            } catch (e) { /* already unloaded */ }
            setSound(null);
        }
        setIsPlaying(false);
    };

    const playAyah = async (index: number) => {
        try {
            // Eğer aynı ayete tıklandıysa durdur/devam et
            if (currentAyahIndex === index) {
                if (isPlaying) {
                    try {
                        const status = await sound?.getStatusAsync();
                        if (status?.isLoaded) {
                            await sound?.pauseAsync();
                        }
                    } catch (e) { /* ignore */ }
                    setIsPlaying(false);
                } else if (sound) {
                    try {
                        const status = await sound.getStatusAsync();
                        if (status.isLoaded) {
                            await sound.playAsync();
                            setIsPlaying(true);
                        } else {
                            startNewAudio(index);
                        }
                    } catch (e) {
                        startNewAudio(index);
                    }
                } else {
                    startNewAudio(index);
                }
                return;
            }

            // Farklı ayete geçiş: Önce durdur, UI'ı güncelle, sonra yeni sesi yükle
            if (sound) {
                try {
                    const status = await sound.getStatusAsync();
                    if (status.isLoaded) {
                        await sound.stopAsync();
                        await sound.unloadAsync();
                    }
                } catch (e) { /* already unloaded */ }
                setSound(null);
            }

            // Hızlı UI tepkisi için state'i hemen güncelle
            setCurrentAyahIndex(index);
            setIsPlaying(true);

            await startNewAudio(index);

        } catch (error) {
            console.error('Audio play error:', error);
            setIsPlaying(false);
        }
    };

    const startNewAudio = async (index: number) => {
        const ayah = ayahs[index];
        if (!ayah.audio) return;

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: ayah.audio },
                { shouldPlay: true }
            );

            setSound(newSound);
            setIsPlaying(true); // Garanti olsun

            // --- OTOMATİK SCROLL ---
            if (viewMode === 'list') {
                flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.1 });
            } else {
                // Page Mode: Hangi sayfada olduğunu bul ve o sayfaya git
                const pageIndex = pages.findIndex(p => p.pageNumber === ayah.page);
                if (pageIndex !== -1 && pageIndex !== currentPageIndex) {
                    pageListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
                }
            }

            newSound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    if (index < ayahs.length - 1) {
                        playAyah(index + 1);
                    } else {
                        setIsPlaying(false);
                        setCurrentAyahIndex(null);
                    }
                }
            });
        } catch (error) {
            console.error("Failed to load sound", error);
        }
    };

    const toggleGlobalPlay = () => {
        if (currentAyahIndex !== null) {
            playAyah(currentAyahIndex);
        } else {
            playAyah(0);
        }
    };

    // 1. LİSTE GÖRÜNÜMÜ (MEALLİ)
    const renderListAyah = ({ item, index }: { item: Ayah, index: number }) => {
        const isActive = currentAyahIndex === index;
        return (
            <View style={[styles.ayahContainer, isActive && styles.activeAyahContainer]}>
                <View style={styles.ayahHeader}>
                    <TouchableOpacity onPress={() => playAyah(index)} style={styles.playButtonMini}>
                        <Ionicons name={isActive && isPlaying ? "pause" : "play"} size={16} color="#D4AF37" />
                    </TouchableOpacity>
                    <View style={styles.ayahNumberBadge}>
                        <Text style={styles.ayahNumberText}>{item.numberInSurah}</Text>
                    </View>
                </View>
                <Text style={[styles.arabicText, isActive && styles.activeText]}>{item.text}</Text>
                <Text style={[styles.translationText, isActive && styles.activeTranslation]}>{item.translation}</Text>
            </View>
        );
    };

    // 2. SAYFA GÖRÜNÜMÜ (MUSHAF - YATAY SCROLL)
    const renderMushafPage = ({ item }: { item: { pageNumber: number, ayahs: Ayah[] } }) => {
        return (
            <View style={styles.pageWrapper}>
                <ScrollView
                    contentContainerStyle={styles.mushafScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mushafContainer}>
                        {/* Sayfa Başlığı (Opsiyonel) */}
                        <Text style={styles.pageHeaderNumber}>{renderArabicNumber(item.pageNumber)}</Text>

                        <Text style={styles.mushafTextBase}>
                            {item.ayahs.map((ayah, i) => {
                                // Ayah'ın genel indexini bulmak için (audio için)
                                const globalIndex = ayahs.findIndex(a => a.number === ayah.number);
                                const isActive = currentAyahIndex === globalIndex;

                                return (
                                    <Text
                                        key={ayah.number}
                                        onPress={() => playAyah(globalIndex)}
                                        style={[
                                            styles.mushafAyahText,
                                            isActive && styles.activeMushafText
                                        ]}
                                    >
                                        {ayah.text}
                                        <Text style={styles.endOfAyah}> ۝{renderArabicNumber(ayah.numberInSurah)} </Text>
                                    </Text>
                                );
                            })}
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1, paddingTop: 15 }}
        >
            {/* HEADER */}
            <ScreenHeader
                title={surahName}
                onLeftPress={() => router.back()}
                centerTitle
                rightIcon={
                    <View style={styles.iconToggleContainer}>
                        <TouchableOpacity
                            style={[styles.iconButton, viewMode === 'list' && styles.activeIconButton]}
                            onPress={() => setViewMode('list')}
                        >
                            <MaterialCommunityIcons
                                name="format-list-bulleted"
                                size={20}
                                color={viewMode === 'list' ? '#0F2027' : 'rgba(255,255,255,0.5)'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, viewMode === 'page' && styles.activeIconButton]}
                            onPress={() => setViewMode('page')}
                        >
                            <MaterialCommunityIcons
                                name="book-open-page-variant"
                                size={20}
                                color={viewMode === 'page' ? '#0F2027' : 'rgba(255,255,255,0.5)'}
                            />
                        </TouchableOpacity>
                    </View>
                }
            />

            {loading ? (
                /* ... Loader ... */
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                </View>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <FlatList
                            key="list-mode"
                            ref={flatListRef}
                            data={ayahs}
                            // ...
                            keyExtractor={(item) => item.number.toString()}
                            renderItem={renderListAyah}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <FlatList
                            key="page-mode"
                            ref={pageListRef}
                            data={pages}
                            keyExtractor={(item) => item.pageNumber.toString()}
                            renderItem={renderMushafPage}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onViewableItemsChanged={onViewableItemsChanged}
                            viewabilityConfig={viewabilityConfig}
                            getItemLayout={(data, index) => (
                                { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
                            )}
                            snapToAlignment="center"
                            decelerationRate="fast"
                        />
                    )}
                </>
            )}

            {/* BOTTOM PLAYER BAR */}
            {!loading && (
                <View style={styles.playerBar}>
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerSurahName}>{surahName}</Text>
                        <Text style={styles.playerAyahInfo}>
                            {currentAyahIndex !== null
                                ? `${currentAyahIndex + 1}. Ayet`
                                : (viewMode === 'page' ? `${pages[currentPageIndex]?.pageNumber || 1}. Sayfa` : 'Ayete Dokun')}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.globalPlayButton} onPress={toggleGlobalPlay}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#0F2027" />
                    </TouchableOpacity>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    // HEADER styles removed

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 100 },

    ayahContainer: {
        marginBottom: 25,
        padding: 15,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    activeAyahContainer: {
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },

    ayahHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    playButtonMini: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        justifyContent: 'center', alignItems: 'center'
    },
    ayahNumberBadge: {
        width: 30, height: 30, borderRadius: 15,
        borderWidth: 1, borderColor: '#D4AF37',
        justifyContent: 'center', alignItems: 'center'
    },
    ayahNumberText: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },

    arabicText: {
        color: '#fff',
        fontSize: 26,
        lineHeight: 45,
        textAlign: 'right',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 15
    },
    activeText: { color: '#FFD700' },

    translationText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'left'
    },
    activeTranslation: { color: '#fff' },

    // PLAYER BAR
    playerBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 80,
        backgroundColor: '#1c1c1c',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    playerInfo: { flex: 1 },
    playerSurahName: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
    playerAyahInfo: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
    globalPlayButton: {
        width: 50, height: 50,
        borderRadius: 25,
        backgroundColor: '#D4AF37',
        justifyContent: 'center', alignItems: 'center'
    },

    // MODE BUTTON
    modeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        paddingHorizontal: 12
    },
    modeButtonText: { color: '#D4AF37', fontWeight: 'bold', marginLeft: 5, fontSize: 13 },

    // PAGE / MUSHAF VIEW
    pageWrapper: {
        width: require('react-native').Dimensions.get('window').width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mushafScrollContent: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        paddingBottom: 120
    },
    mushafContainer: {
        backgroundColor: '#FDF1DC', // Daha doğal kağıt rengi
        padding: 24,
        paddingTop: 40,
        borderRadius: 8,
        width: require('react-native').Dimensions.get('window').width - 20, // Kenarlardan boşluk
        minHeight: require('react-native').Dimensions.get('window').height * 0.7,
        borderWidth: 1,
        borderColor: '#E0C097',
        alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 4, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 // Kitap gölgesi
    },
    pageHeaderNumber: {
        fontSize: 16,
        color: '#8B7D6B',
        marginBottom: 20,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    mushafTextBase: {
        textAlign: 'justify', // İki yana yasla
        lineHeight: 52,
        writingDirection: 'rtl',
        width: '100%'
    },
    mushafAyahText: {
        fontSize: 26,
        color: '#2C3E50',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    activeMushafText: {
        color: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.15)'
    },
    endOfAyah: {
        color: '#C0392B', // Ayet sonu işareti (süs)
        fontSize: 22
    },

    // TOGGLE BUTTON STYLES
    iconToggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2
    },
    activeIconButton: {
        backgroundColor: '#D4AF37'
    }
});
