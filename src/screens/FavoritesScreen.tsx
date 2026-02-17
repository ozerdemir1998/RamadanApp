
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { useFavorites } from '../context/FavoritesContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 15;
const CARD_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;
const ICON_PATTERN = require('../../assets/icons/pattern.png');
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuwH';

export default function FavoritesScreen() {
    const router = useRouter();
    const { favorites, toggleFavorite } = useFavorites();

    const renderRecipeCard = ({ item, index }: { item: any, index: number }) => (
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

                <TouchableOpacity
                    style={styles.likeBadge}
                    onPress={() => toggleFavorite(item)}
                >
                    <Ionicons name="heart" size={18} color="#E74C3C" />
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

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
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
                <ScreenHeader
                    title="Favori Tariflerim"
                    onLeftPress={() => router.back()}
                    centerTitle
                />

                {favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="heart-dislike-outline" size={60} color="rgba(255,255,255,0.2)" />
                        </View>
                        <Text style={styles.emptyTitle}>Listeniz Boş</Text>
                        <Text style={styles.emptyText}>Henüz favori tarif eklemediniz.</Text>
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.exploreBtnText}>Tarifleri Keşfet</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={renderRecipeCard}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05 },

    listContent: { paddingVertical: 20 },

    // EMPTY STATE
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIconContainer: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20
    },
    emptyTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    emptyText: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 16, marginBottom: 30 },
    exploreBtn: {
        backgroundColor: '#D4AF37', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30,
        shadowColor: '#D4AF37', shadowOpacity: 0.3, shadowRadius: 10
    },
    exploreBtnText: { color: '#0F2027', fontWeight: 'bold', fontSize: 16 },

    // CARD STYLES (Copied from RecipesScreen for consistency)
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: '#1E2A32',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    imageWrapper: { height: 140, width: '100%', position: 'relative' },
    cardImage: { width: '100%', height: '100%' },
    likeBadge: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 50,
    },
    cardContent: { padding: 12 },
    cardTitle: {
        color: '#fff', fontSize: 15, fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 8, height: 40
    },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { color: '#ccc', fontSize: 12 }
});
