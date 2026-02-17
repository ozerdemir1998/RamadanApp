import { useFavorites } from '@/context/FavoritesContext';
import { fetchRecipeDetail } from '@/services/recipeService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuwH';

export default function RecipeDetailScreen() {
    const { recipeId } = useLocalSearchParams();
    const router = useRouter();

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const insets = useSafeAreaInsets();

    // Çevrilmiş Metinler
    const [trName, setTrName] = useState("");

    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(recipeId as string);

    useEffect(() => {
        loadDetail();
    }, [recipeId]);

    const loadDetail = async () => {
        const data = await fetchRecipeDetail(recipeId as string);
        if (!data) return;

        setRecipe(data);
        setTrName(data.title);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingCenter}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Tarif Hazırlanıyor...</Text>
            </View>
        );
    }

    if (!recipe) return <Text style={{ padding: 40, color: '#fff' }}>Tarif bulunamadı.</Text>;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ paddingTop: 15, backgroundColor: '#0F2027' }}>
                <ScreenHeader
                    title={trName || "Tarif Detayı"}
                    onLeftPress={() => router.back()}
                    centerTitle
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* 1. RESİM ALANI (HEADER) */}
                <View style={styles.imageHeader}>
                    {recipe.image ? (
                        <Image
                            source={{ uri: recipe.image }}
                            style={styles.foodImage}
                            contentFit="cover"
                            placeholder={blurhash}
                            transition={500}
                        />
                    ) : (
                        <View style={[styles.foodImage, { backgroundColor: '#203A43', justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialCommunityIcons name="food" size={80} color="rgba(255,255,255,0.1)" />
                        </View>
                    )}

                    <LinearGradient
                        colors={['transparent', '#0F2027']}
                        style={styles.bottomGradient}
                    />

                    {/* FAVORİ BUTONU (EKLENDİ) */}
                    <TouchableOpacity
                        style={styles.favButton}
                        onPress={() => toggleFavorite({
                            id: recipe.id,
                            title: recipe.title,
                            image: recipe.image
                        })}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={22}
                            color={isFav ? "#E74C3C" : "#D4AF37"}
                        />
                    </TouchableOpacity>
                </View>

                {/* 2. İÇERİK (KOYU TEMA) */}
                <LinearGradient colors={['#0F2027', '#203A43']} style={styles.contentBody}>

                    {/* MALZEMELER - Pills Logic */}
                    <View style={styles.sectionBox}>
                        <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons name="basket" size={24} color="#D4AF37" />
                            <Text style={styles.sectionHeader}>Malzemeler</Text>
                        </View>

                        <View style={styles.ingredientsPillsContainer}>
                            {recipe.ingredients && recipe.ingredients.map((ing: string, i: number) => (
                                <View key={i} style={styles.ingredientPill}>
                                    <View style={styles.pillDot} />
                                    <Text style={styles.ingredientPillText}>{ing}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* YAPILIŞI - Step Logic */}
                    <View style={styles.sectionBox}>
                        <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons name="chef-hat" size={24} color="#D4AF37" />
                            <Text style={styles.sectionHeader}>Yapılışı</Text>
                        </View>

                        <View style={styles.instructionsContainer}>
                            <Text style={styles.detailText}>
                                {recipe.instructions}
                            </Text>
                        </View>
                    </View>

                    {/* DİNAMİK ALT BOŞLUK */}
                    <View style={{ height: 85 + insets.bottom }} />

                </LinearGradient>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F2027' },
    scrollContainer: { paddingBottom: 0 },

    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
    loadingText: { color: '#D4AF37', marginTop: 10 },

    // GÖRSEL ALANI
    imageHeader: { height: 380, width: '100%', position: 'relative' },
    foodImage: { width: '100%', height: '100%' },

    // Alt Gradient
    bottomGradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 180,
        justifyContent: 'flex-end',
        padding: 20,
        paddingBottom: 45
    },
    favButton: {
        position: 'absolute',
        bottom: -22, // İçeriğin üstünde yüzmesi için
        right: 30,
        width: 35,
        height: 35,
        borderRadius: 22,
        backgroundColor: 'transparent', // Light gray transparent
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)', // Subtler border
        zIndex: 50
    },

    // İÇERİK GÖVDESİ
    contentBody: {
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 25,
        minHeight: 500,
        paddingTop: 35
    },

    sectionBox: { marginBottom: 35 },
    sectionHeaderRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.2)', paddingBottom: 10
    },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    detailText: {
        fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 28,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    instructionsContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },

    // Ingredients Pills
    ingredientsPillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    ingredientPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },
    pillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D4AF37',
        marginRight: 8
    },
    ingredientPillText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    }
});