import { fetchRecipesByCategory } from '@/services/recipeService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // EKLENDİ
import ScreenHeader from '../components/ScreenHeader';

const ICON_PATTERN = require('../../assets/icons/pattern.png');

export default function RecipesScreen() {
    const { catId } = useLocalSearchParams();
    const router = useRouter();

    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [translatedTitle, setTranslatedTitle] = useState("");

    // EKLENDİ: Güvenli alanları al
    const insets = useSafeAreaInsets();

    // --- ARAMA STATE'LERİ ---
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const searchAnim = useRef(new Animated.Value(0)).current;

    // 1. INPUT DEĞERİ
    const [searchText, setSearchText] = useState("");

    // 2. AKTİF FİLTRE
    const [activeFilter, setActiveFilter] = useState("");

    // 3. DİNAMİK ÖNERİLER
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, [catId]);

    const loadData = async () => {
        const titles: { [key: string]: string } = {
            'sahurluk': 'Sahur Sofrası',
            'corbalar': 'Çorbalar',
            'ana_yemek': 'Et Yemekleri',
            'tavuk_yemekleri': 'Tavuk Yemekleri',
            'ara_sicak': 'Ara Sıcaklar',
            'sebze': 'Sebze Yemekleri',
            'salata': 'Salatalar',
            'karbonhidrat': 'Karbonhidratlar',
            'tatlilar': 'Tatlılar'
        };

        setTranslatedTitle(titles[catId as string] || 'Yemekler');
        const data = await fetchRecipesByCategory(catId as string);
        setRecipes(data);

        if (data && data.length > 0) {
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            // `title` alanını kullanıyoruz
            const randomTags = shuffled.slice(0, 6).map((item: any) => item.title);
            setSuggestions(randomTags);
        }

        setLoading(false);
    };

    const handleSearch = () => {
        setActiveFilter(searchText);
        Keyboard.dismiss();
    };

    const handleClear = () => {
        setSearchText("");
    };

    const handleTagPress = (tag: string) => {
        setSearchText(tag);
        setActiveFilter(tag);
        Keyboard.dismiss();
    };

    const toggleSearch = () => {
        if (isSearchVisible) {
            Keyboard.dismiss();
            Animated.timing(searchAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setIsSearchVisible(false);
                setSearchText("");
                setActiveFilter("");
            });
        } else {
            setIsSearchVisible(true);
            Animated.timing(searchAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(activeFilter.toLowerCase())
    );

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.backgroundPatternContainer} pointerEvents="none">
                <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
                <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D4AF37" />
                        <Text style={styles.loadingText}>Yükleniyor...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRecipes}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"

                        // --- HEADER (BAŞLIK + ARAMA + BİLGİ ÇUBUĞU) ---
                        ListHeaderComponent={
                            <View>
                                {/* 1. Üst Başlık */}
                                <ScreenHeader
                                    title={translatedTitle}
                                    onLeftPress={() => router.back()}
                                    rightIcon={
                                        <TouchableOpacity onPress={toggleSearch} style={styles.headerBtn}>
                                            <Ionicons name={isSearchVisible ? "close" : "search"} size={28} color="#D4AF37" />
                                        </TouchableOpacity>
                                    }
                                    centerTitle
                                />

                                {/* 2. Animasyonlu Arama Kutusu */}
                                <Animated.View style={[
                                    styles.searchWrapper,
                                    {
                                        height: searchAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 130]
                                        }),
                                        opacity: searchAnim.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [0, 0, 1]
                                        })
                                    }
                                ]}>
                                    <View style={styles.searchInnerContent}>
                                        <View style={styles.searchContainer}>
                                            <View style={styles.inputWrapper}>
                                                <TextInput
                                                    style={styles.searchInput}
                                                    placeholder="Yemek adı yazın..."
                                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                                    value={searchText}
                                                    onChangeText={setSearchText}
                                                    returnKeyType="search"
                                                    onSubmitEditing={handleSearch}
                                                    autoCorrect={false}
                                                />
                                                {searchText.length > 0 && (
                                                    <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                                                        <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <TouchableOpacity onPress={handleSearch} style={styles.searchBtnRight} activeOpacity={0.7}>
                                                <View style={styles.searchBtnCircle}>
                                                    <Ionicons name="search" size={22} color="#0F2027" />
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.chipsScroll}
                                            contentContainerStyle={styles.chipsContainer}
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            {suggestions.map((tag, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.chipItem}
                                                    onPress={() => handleTagPress(tag)}
                                                >
                                                    <Text style={styles.chipText}>{tag}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </Animated.View>

                                {/* 3. BİLGİ VE DEKORASYON ÇUBUĞU */}
                                <View style={styles.infoBarContainer}>
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#D4AF37" />
                                        <Text style={styles.infoText}>
                                            {activeFilter
                                                ? `"${activeFilter}" için ${filteredRecipes.length} sonuç`
                                                : `Toplam ${recipes.length} lezzet listeleniyor`}
                                        </Text>
                                    </View>
                                    <View style={styles.separator} />
                                </View>

                            </View>
                        }

                        // Liste Boşsa
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="food-off" size={50} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.emptyText}>
                                    {activeFilter ? `"${activeFilter}" bulunamadı.` : "Aramak için yazın veya öneri seçin."}
                                </Text>
                            </View>
                        }

                        // DİNAMİK ALT BOŞLUK (Footer olarak eklendi)
                        // Menünün altında kalmaması için: Tab Bar Yüksekliği (~85px) + Güvenli Alan
                        ListFooterComponent={
                            <View style={{ height: 85 + insets.bottom }} />
                        }

                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.cardContainer}
                                activeOpacity={0.9}
                                onPress={() => router.push({
                                    pathname: '/recipe-detail',
                                    params: { recipeId: item.id }  // idMeal yerine id
                                })}
                            >
                                {/* Resim alanı opsiyonel, varsa göster */}
                                {item.image ? (
                                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                                ) : (
                                    <View style={[styles.cardImage, { backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                                        <MaterialCommunityIcons name="food-variant" size={40} color="rgba(255,255,255,0.2)" />
                                    </View>
                                )}

                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                                    style={styles.cardGradient}
                                >
                                    <View>
                                        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.cardSubtitle}>Tarifi İncele</Text>
                                            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

    // HEADER
    headerBtn: { padding: 5 },

    // ARAMA ALANI
    searchWrapper: { overflow: 'hidden' },
    searchInnerContent: { paddingBottom: 20 },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        marginTop: 5,
        height: 50,
        justifyContent: 'space-between',
        marginBottom: 15
    },

    // INPUT KUTUSU
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 25,
        height: '100%',
        paddingHorizontal: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        height: '100%'
    },
    clearBtn: { padding: 5 },

    // SAĞDAKİ BUTON
    searchBtnRight: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
    searchBtnCircle: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#D4AF37',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 5
    },

    // CHIPS
    chipsScroll: { paddingLeft: 15 },
    chipsContainer: { paddingRight: 30, alignItems: 'center' },
    chipItem: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    chipText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },

    // --- BİLGİ VE DEKORASYON ÇUBUĞU ---
    infoBarContainer: {
        marginTop: 5,
        marginBottom: 20, // Liste ile arasını açar
        paddingHorizontal: 20
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    infoText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginLeft: 8,
        fontStyle: 'italic',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(212, 175, 55, 0.3)', // Altın çizgi
        width: '40%' // Çizginin uzunluğu
    },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: 10 },

    emptyContainer: { padding: 40, alignItems: 'center', marginTop: 20 },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', marginTop: 10 },

    listContent: { padding: 20, paddingBottom: 0, paddingTop: 0 }, // paddingBottom footer ile hallediliyor

    cardContainer: {
        height: 180,
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        backgroundColor: '#000',
    },
    cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    cardGradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
        justifyContent: 'flex-end', padding: 15
    },
    cardTitle: {
        color: '#fff', fontSize: 18, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 5, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5
    },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    cardSubtitle: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold' }
});