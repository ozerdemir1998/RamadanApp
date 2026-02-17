import { useFavorites } from '@/context/FavoritesContext';
import { fetchRecipesByCategory } from '@/services/recipeService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { rem, rf, scale, verticalScale } from '../utils/responsive';

const ICON_PATTERN = require('../../assets/icons/pattern.png');
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = scale(15);
const CARD_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuwH';

export default function RecipesScreen() {
    const { catId } = useLocalSearchParams();
    const router = useRouter();

    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [translatedTitle, setTranslatedTitle] = useState("");

    const insets = useSafeAreaInsets();
    const { toggleFavorite, isFavorite } = useFavorites();

    // --- ARAMA STATE'LERİ ---
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const searchAnim = useRef(new Animated.Value(0)).current;
    const [searchText, setSearchText] = useState("");
    const [activeFilter, setActiveFilter] = useState("");

    const [suggestions, setSuggestions] = useState<string[]>([]);

    // --- FAVORİ FİLTRESİ ---
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

    const toggleFavoritesFilter = () => {
        setShowFavoritesOnly(!showFavoritesOnly);
    };

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(activeFilter.toLowerCase());
        const matchesFavorite = showFavoritesOnly ? isFavorite(recipe.id) : true;
        return matchesSearch && matchesFavorite;
    });

    const renderRecipeCard = ({ item, index }: { item: any, index: number }) => {
        const isFav = isFavorite(item.id);

        return (
            <TouchableOpacity
                style={[styles.cardContainer, {
                    marginLeft: SPACING,
                    marginBottom: SPACING,
                    marginRight: index % 2 === 1 ? SPACING : 0
                }]}
                activeOpacity={0.9}
                onPress={() => router.push({
                    pathname: '/recipe-detail',
                    params: { recipeId: item.id }
                })}
            >
                <View style={styles.imageWrapper}>
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.cardImage}
                            placeholder={blurhash}
                            contentFit="cover"
                            transition={500}
                        />
                    ) : (
                        <View style={[styles.cardImage, { backgroundColor: '#2C3E50', justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialCommunityIcons name="food-variant" size={40} color="rgba(255,255,255,0.2)" />
                        </View>
                    )}

                    {/* Kalp İkonu */}
                    <TouchableOpacity
                        style={styles.likeBadge}
                        onPress={() => toggleFavorite({
                            id: item.id,
                            title: item.title,
                            image: item.image
                        })}
                    >
                        <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={18}
                            color={isFav ? "#E74C3C" : "#fff"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.timeTag}>
                            <MaterialCommunityIcons name="clock-outline" size={12} color="#D4AF37" />
                            <Text style={styles.timeText}>30 dk</Text>
                        </View>
                        <Ionicons name="chevron-forward-circle" size={20} color="#D4AF37" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.backgroundPatternContainer} pointerEvents="none">
                <Image
                    source={ICON_PATTERN}
                    style={[styles.bgPatternImage, { left: -150 }]}
                    contentFit="contain"
                    tintColor="#D4AF37"
                />
                <Image
                    source={ICON_PATTERN}
                    style={[styles.bgPatternImage, { right: -150 }]}
                    contentFit="contain"
                    tintColor="#D4AF37"
                />
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
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={{ paddingBottom: 100 }}

                        // --- HEADER ---
                        ListHeaderComponent={
                            <View style={{ marginBottom: 10 }}>
                                <ScreenHeader
                                    title={translatedTitle}
                                    onLeftPress={() => router.back()}
                                    rightIcon={
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={toggleFavoritesFilter} style={[styles.headerBtn, { marginRight: 5 }]}>
                                                <Ionicons name={showFavoritesOnly ? "heart" : "heart-outline"} size={28} color={showFavoritesOnly ? "#E74C3C" : "#D4AF37"} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={toggleSearch} style={styles.headerBtn}>
                                                <Ionicons name={isSearchVisible ? "close" : "search"} size={28} color="#D4AF37" />
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    centerTitle
                                />

                                <Animated.View style={[
                                    styles.searchWrapper,
                                    {
                                        height: searchAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 130] // Yükseklik
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

                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="food-off" size={50} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.emptyText}>
                                    {activeFilter ? `"${activeFilter}" bulunamadı.` : "Aramak için yazın veya öneri seçin."}
                                </Text>
                            </View>
                        }

                        renderItem={renderRecipeCard}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: scale(300), height: scale(300), opacity: 0.05 },

    headerBtn: { padding: rem(5) },

    searchWrapper: { overflow: 'hidden' },
    searchInnerContent: { paddingBottom: verticalScale(20) },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: scale(15), marginTop: verticalScale(5), height: verticalScale(50),
        justifyContent: 'space-between', marginBottom: verticalScale(15)
    },
    inputWrapper: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: scale(25), height: '100%', paddingHorizontal: scale(15), marginRight: scale(10),
        borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)'
    },
    searchInput: { flex: 1, color: '#fff', fontSize: rf(16), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', height: '100%' },
    clearBtn: { padding: rem(5) },
    searchBtnRight: { width: scale(50), height: scale(50), justifyContent: 'center', alignItems: 'center' },
    searchBtnCircle: {
        width: scale(44), height: scale(44), borderRadius: scale(22), backgroundColor: '#D4AF37',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 5
    },

    chipsScroll: { paddingLeft: scale(15) },
    chipsContainer: { paddingRight: scale(30), alignItems: 'center' },
    chipItem: {
        paddingHorizontal: scale(15), paddingVertical: verticalScale(8), backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: scale(20), marginRight: scale(10), borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    chipText: { color: 'rgba(255,255,255,0.8)', fontSize: rf(13), fontWeight: '500' },

    infoBarContainer: { marginTop: verticalScale(5), marginBottom: verticalScale(10), paddingHorizontal: scale(20) },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
    infoText: { color: 'rgba(255,255,255,0.6)', fontSize: rf(14), marginLeft: scale(8), fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    separator: { height: 1, backgroundColor: 'rgba(212, 175, 55, 0.3)', width: '40%' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: verticalScale(10) },
    emptyContainer: { padding: rem(40), alignItems: 'center', marginTop: verticalScale(20) },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: rf(16), textAlign: 'center', marginTop: verticalScale(10) },

    // --- GRID LAYOUT ---
    columnWrapper: {
        // FlatList'in columnWrapper'ı otomatik justify yapar ama biz margin ile kontrol ediyoruz
    },
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: '#1E2A32',
        borderRadius: scale(16),
        overflow: 'hidden',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        // Shadow for Android
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    imageWrapper: {
        height: verticalScale(140),
        width: '100%',
        position: 'relative'
    },
    cardImage: {
        width: '100%',
        height: '100%'
    },
    likeBadge: {
        position: 'absolute',
        top: verticalScale(8),
        right: scale(8),
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: rem(6),
        borderRadius: scale(50),
    },
    cardContent: {
        padding: rem(12),
    },
    cardTitle: {
        color: '#fff',
        fontSize: rf(15),
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: verticalScale(8),
        height: verticalScale(40) // Sabit yükseklik, 2 satır için
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4)
    },
    timeText: {
        color: '#ccc',
        fontSize: rf(12)
    }
});