import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Surah, quranService } from '../services/quranService';

export default function QuranListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [viewMode, setViewMode] = useState<'list' | 'page'>('list');

    useEffect(() => {
        loadSurahs();
    }, []);

    const loadSurahs = async () => {
        try {
            const data = await quranService.getSurahs();
            setSurahs(data);
            setFilteredSurahs(data);
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

    const renderItem = ({ item }: { item: Surah }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/quran-detail', params: { surahId: item.number, surahName: item.englishName, initialMode: viewMode } })}
            activeOpacity={0.7}
        >
            <View style={styles.numberContainer}>
                <Text style={styles.numberText}>{item.number}</Text>
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.englishName}>{item.englishName}</Text>
            </View>
            <View style={styles.arabicContainer}>
                <Text style={styles.arabicName}>{item.name}</Text>
                <Text style={styles.ayahCount}>{item.numberOfAyahs} Ayet</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1, paddingTop: insets.top }}
        >
            {/* HEADER & TOGGLE */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Kuran-ı Kerim</Text>
                    <Text style={styles.headerSubtitle}>Oku & Dinle</Text>
                </View>

                {/* GÖRÜNÜM MODU İKONLARI */}
                <View style={styles.iconToggleContainer}>
                    <TouchableOpacity
                        style={[styles.iconButton, viewMode === 'list' && styles.activeIconButton]}
                        onPress={() => setViewMode('list')}
                    >
                        <MaterialCommunityIcons
                            name="format-list-bulleted"
                            size={24}
                            color={viewMode === 'list' ? '#0F2027' : 'rgba(255,255,255,0.5)'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, viewMode === 'page' && styles.activeIconButton]}
                        onPress={() => setViewMode('page')}
                    >
                        <MaterialCommunityIcons
                            name="book-open-page-variant"
                            size={24}
                            color={viewMode === 'page' ? '#0F2027' : 'rgba(255,255,255,0.5)'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

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
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

    iconToggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2
    },
    activeIconButton: {
        backgroundColor: '#D4AF37'
    },

    searchContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 45, color: '#fff', fontSize: 16 },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: 10 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: 10,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    numberContainer: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 10,
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    numberText: { color: '#D4AF37', fontWeight: 'bold' },
    detailsContainer: { flex: 1 },
    englishName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    translationName: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
    arabicContainer: { alignItems: 'flex-end' },
    arabicName: { color: '#D4AF37', fontSize: 18, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    ayahCount: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }
});
