import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Surah, quranService } from '../services/quranService';
import { rf, scale, verticalScale } from '../utils/responsive';

export default function QuranListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');



    useEffect(() => {
        loadSurahs();
    }, []);

    const loadSurahs = async () => {
        try {
            // Paralel olarak API'den sureleri ve Firebase'den Türkçe isimleri çek
            const [apiSurahs, firebaseNames] = await Promise.all([
                quranService.getSurahs(),
                quranService.getSurahNamesMap()
            ]);

            // API verisindeki ingilizce isimleri Türkçe ile değiştir
            const mergedSurahs = apiSurahs.map(surah => ({
                ...surah,
                englishName: firebaseNames[surah.number] || surah.englishName
            }));

            // Firebase'de sıralama garanti olmayabilir, ID'ye göre sırala (API zaten sıralı döner ama garanti olsun)
            mergedSurahs.sort((a, b) => a.number - b.number);

            setSurahs(mergedSurahs);
            setFilteredSurahs(mergedSurahs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text) {
            const filtered = surahs.filter(
                (surah) =>
                    surah.englishName.toLowerCase().includes(text.toLowerCase()) ||
                    surah.name.includes(text) ||
                    surah.number.toString().includes(text)
            );
            setFilteredSurahs(filtered);
        } else {
            setFilteredSurahs(surahs);
        }
    };

    const renderSurahItem = ({ item }: { item: Surah }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/quran-detail', params: { surahId: item.number, surahName: item.englishName } })}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={styles.arabicBox}>
                    <Text style={styles.arabicText} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.verticalSeparator} />
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.englishName}>{item.englishName}</Text>
                    <Text style={styles.versesCount}>{item.numberOfAyahs} Ayet</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1, paddingTop: insets.top }}
        >
            {/* CONTENT */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Sureler Yükleniyor...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredSurahs}
                    keyExtractor={(item) => item.number.toString()}
                    renderItem={renderSurahItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            {/* HEADER & TOGGLE */}
                            <ScreenHeader
                                title="Kuran-ı Kerim"
                                leftIcon="none"
                            />

                            {/* SEARCH BAR */}
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Sure ara..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                />
                            </View>
                        </>
                    }
                />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: { fontSize: rf(20), fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    headerSubtitle: { fontSize: rf(12), color: 'rgba(255,255,255,0.6)', marginTop: verticalScale(2) },

    searchContainer: {
        marginHorizontal: scale(20),
        marginBottom: verticalScale(18),
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(15),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    searchIcon: { marginRight: scale(10) },
    searchInput: { flex: 1, height: verticalScale(42), color: '#fff', fontSize: rf(15) },

    listContent: { paddingBottom: verticalScale(100) },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: verticalScale(10), fontSize: rf(13) },

    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: scale(12),
        marginBottom: verticalScale(8),
        marginHorizontal: scale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12)
    },
    arabicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: scale(70),
        marginRight: scale(12),
    },
    arabicText: {
        color: '#D4AF37',
        fontSize: rf(20),
        fontWeight: 'bold',
        textAlign: 'right',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginRight: scale(10)
    },
    verticalSeparator: {
        width: 2,
        height: verticalScale(28),
        backgroundColor: '#D4AF37',
        opacity: 0.5,
        borderRadius: 1
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    englishName: {
        color: '#fff',
        fontSize: rf(15),
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    versesCount: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: rf(12),
        marginTop: verticalScale(2)
    }
});
