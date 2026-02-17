import { fetchRecipeDetail } from '@/services/recipeService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // EKLENDİ
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
    const { recipeId } = useLocalSearchParams();
    const router = useRouter();

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // EKLENDİ: Güvenli alanları al
    const insets = useSafeAreaInsets();

    // Çevrilmiş Metinler
    const [trName, setTrName] = useState("");
    const [trInstructions, setTrInstructions] = useState("");

    useEffect(() => {
        loadDetail();
    }, [recipeId]);

    const loadDetail = async () => {
        const data = await fetchRecipeDetail(recipeId as string);
        if (!data) return;

        setRecipe(data);
        // Veriler zaten Türkçe olduğu için çeviriye gerek yok
        setTrName(data.title);
        setTrInstructions(data.instructions);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingCenter}>
                {/* Yüklenirken de header gizli olsun */}
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Tarif Hazırlanıyor...</Text>
            </View>
        );
    }

    if (!recipe) return <Text style={{ padding: 40, color: '#fff' }}>Tarif bulunamadı.</Text>;

    return (
        <View style={styles.container}>
            {/* --- BEYAZ BAŞLIĞI GİZLER --- */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ paddingTop: 15, backgroundColor: '#0F2027' }}>
                <ScreenHeader
                    title={trName || "Tarif Detayı"}
                    onLeftPress={() => router.back()}
                    centerTitle
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* 1. RESİM ALANI (HEADER) - Title removed from here */}
                <View style={styles.imageHeader}>
                    {recipe.image ? (
                        <Image
                            source={{ uri: recipe.image }}
                            style={styles.foodImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.foodImage, { backgroundColor: '#203A43', justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialCommunityIcons name="food" size={80} color="rgba(255,255,255,0.1)" />
                        </View>
                    )}

                    {/* Alt Kısım Karartma */}
                    <LinearGradient
                        colors={['transparent', '#0F2027']}
                        style={styles.bottomGradient}
                    />
                </View>

                {/* 2. İÇERİK (KOYU TEMA) */}
                <LinearGradient colors={['#0F2027', '#203A43']} style={styles.contentBody}>

                    {/* YAPILIŞI */}
                    <View style={styles.sectionBox}>
                        <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons name="chef-hat" size={24} color="#D4AF37" />
                            <Text style={styles.sectionHeader}>Yapılışı</Text>
                        </View>
                        <Text style={styles.detailText}>
                            {recipe.instructions}
                        </Text>
                    </View>

                    {/* MALZEMELER */}
                    <View style={styles.sectionBox}>
                        <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons name="basket" size={24} color="#D4AF37" />
                            <Text style={styles.sectionHeader}>Malzemeler</Text>
                        </View>

                        <View style={styles.ingredientsList}>
                            {recipe.ingredients && recipe.ingredients.map((ing: string, i: number) => (
                                <IngredientRow
                                    key={i}
                                    ingredient={ing}
                                    measure="" // Artık hepsi string içinde
                                />
                            ))}
                        </View>
                    </View>

                    {/* DİNAMİK ALT BOŞLUK (EKLENDİ)
               Menünün altında kalmaması için:
               Tab Bar Yüksekliği (~85px) + Güvenli Alan (insets.bottom)
            */}
                    <View style={{ height: 85 + insets.bottom }} />

                </LinearGradient>

            </ScrollView>
        </View>
    );
}

// Alt Bileşen (Malzeme Satırı)
const IngredientRow = ({ ingredient, measure }: { ingredient: string, measure: string }) => {
    return (
        <View style={styles.ingredientRow}>
            <View style={styles.bulletPoint} />
            <Text style={styles.ingredientText}>
                {ingredient}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F2027' },
    scrollContainer: { paddingBottom: 0 },

    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
    loadingText: { color: '#D4AF37', marginTop: 10 },

    // GÖRSEL ALANI
    imageHeader: { height: 380, width: '100%', position: 'relative' }, // Resim boyutu biraz artırıldı
    foodImage: { width: '100%', height: '100%' },

    topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },

    // Alt Gradient Ayarları (Yazıların görünmesi için)
    bottomGradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 180, // Gradient alanı büyütüldü
        justifyContent: 'flex-end',
        padding: 20,
        paddingBottom: 45 // Yazıları yukarı itmek için (ContentBody üzerine binmesin diye)
    },

    backBtnAbsolute: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    backBtnCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)'
    },

    imageTitle: {
        fontSize: 28, fontWeight: 'bold', color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 10, // Yazı gölgesi artırıldı
        marginBottom: 5
    },
    imageSubTitle: {
        fontSize: 16, color: '#D4AF37', fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 5
    },

    // İÇERİK GÖVDESİ
    contentBody: {
        marginTop: -30, // Resmin üzerine hafif bindirme (Yuvarlak köşeler için)
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        minHeight: 500
    },

    sectionBox: { marginBottom: 30 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.2)', paddingBottom: 10 },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    detailText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 26, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    ingredientsList: { marginTop: 5 },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37', marginRight: 10 },
    ingredientText: { fontSize: 16, color: 'rgba(255,255,255,0.9)', flex: 1 },
});