import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Esma } from '../data/esmaulHusnaData';
import { getEsmaulHusna } from '../services/esmaService';
import { rem, rf, scale, verticalScale } from '../utils/responsive';

const { width } = Dimensions.get('window');

export default function EsmaulHusnaScreen({ onClose }: { onClose?: () => void }) {
    const router = useRouter();
    const [esmaList, setEsmaList] = useState<Esma[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEsma, setSelectedEsma] = useState<Esma | null>(null);
    const detailTranslateY = useSharedValue(Dimensions.get('window').height);

    const openDetail = (item: Esma) => {
        setSelectedEsma(item);
        detailTranslateY.value = withTiming(0, {
            duration: 500,
            easing: Easing.out(Easing.cubic)
        });
    };

    const closeDetail = () => {
        detailTranslateY.value = withTiming(Dimensions.get('window').height, {
            duration: 500,
            easing: Easing.in(Easing.cubic)
        }, (finished) => {
            if (finished) {
                runOnJS(setSelectedEsma)(null);
            }
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getEsmaulHusna();
        setEsmaList(data);
        setLoading(false);
    };

    // --- DETAY GÖRÜNÜMÜ STYLE ---
    const detailAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: detailTranslateY.value }]
        };
    });

    const renderDetailOverlay = () => {
        if (!selectedEsma) return null;

        return (
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { zIndex: 10, backgroundColor: '#0F2027' },
                    detailAnimatedStyle
                ]}
            >
                <LinearGradient
                    colors={['#0F2027', '#203A43', '#2C5364']}
                    style={styles.container}
                >
                    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                        <View style={{ marginTop: 20 }}>
                            <ScreenHeader
                                title={selectedEsma.name}
                                onLeftPress={closeDetail}
                                leftIcon="back"
                                centerTitle
                            />
                        </View>

                        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>

                            {/* BÜYÜK İKON / ARAPÇA */}
                            <View style={styles.detailIconContainer}>
                                <Text style={styles.detailArabicText} numberOfLines={1} adjustsFontSizeToFit>{selectedEsma.arabic}</Text>
                            </View>

                            {/* İSİM */}
                            <Text style={styles.detailName}>{selectedEsma.name}</Text>

                            {/* AYIRAÇ */}
                            <View style={styles.divider} />

                            {/* FAZİLET / ANLAM */}
                            <View style={styles.infoSection}>
                                <Text style={styles.label}>Anlamı & Fazileti</Text>
                                <Text style={styles.detailMeaning}>{selectedEsma.meaning}</Text>
                            </View>

                            {/* ZİKİR SAYISI */}
                            <View style={styles.zikirBox}>
                                <Text style={styles.zikirText}>
                                    Bu güzel isim, <Text style={styles.zikirHighlight}>{selectedEsma.zikir}</Text> kez zikredilmelidir.
                                </Text>
                            </View>

                        </ScrollView>
                    </SafeAreaView>
                </LinearGradient>
            </Animated.View>
        );
    };

    // --- LİSTE GÖRÜNÜMÜ ---
    const renderItem = ({ item }: { item: Esma }) => {
        return (
            <TouchableOpacity
                style={styles.simpleCard}
                onPress={() => openDetail(item)}
                activeOpacity={0.7}
            >
                <View style={styles.simpleCardContent}>
                    <View style={styles.simpleArabicBox}>
                        <Text style={styles.simpleArabic} numberOfLines={1} adjustsFontSizeToFit>{item.arabic}</Text>
                        <View style={styles.verticalSeparator} />
                    </View>
                    <Text style={styles.simpleName}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
                </View>
            </TouchableOpacity>
        );
    };

    const insets = useSafeAreaInsets();

    if (loading) {
        return (
            <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={{ color: '#D4AF37', marginTop: 10 }}>Esmaül Hüsna Yükleniyor...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={{ marginTop: 20, marginHorizontal: 20 }}>
                    <ScreenHeader
                        title="Esmaül Hüsna"
                        onLeftPress={onClose || router.back}
                        leftIcon={onClose ? 'close' : 'back'}
                        centerTitle
                    />
                </View>

                <FlatList
                    data={esmaList}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    numColumns={1} // Tek sütun liste
                />

            </SafeAreaView>

            {/* DETAIL OVERLAY */}
            {/* Render overlay always if selectedEsma exists to allow animation */}
            {selectedEsma && renderDetailOverlay()}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Removed custom header styles
    listContent: { padding: scale(20) },

    // SIMPLE LIST CARD
    simpleCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: scale(12),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    simpleCardContent: {
        flexDirection: 'row', alignItems: 'center', padding: rem(15)
    },
    simpleArabicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: scale(95),
        marginRight: scale(15),
    },
    simpleArabic: {
        color: '#D4AF37',
        fontSize: rf(22),
        fontWeight: 'bold',
        textAlign: 'right',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginRight: scale(10)
    },
    verticalSeparator: {
        width: 2,
        height: verticalScale(30),
        backgroundColor: '#D4AF37',
        opacity: 0.5,
        borderRadius: 1
    },
    simpleName: { color: '#fff', fontSize: rf(18), flex: 1, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    // DETAIL VIEW STYLES
    detailContent: {
        alignItems: 'center', padding: rem(30)
    },
    detailIconContainer: {
        width: scale(180), height: scale(180), borderRadius: scale(90), // Büyütüldü
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)',
        marginBottom: verticalScale(30),
        padding: rem(20) // Padding eklendi
    },
    detailArabicText: {
        fontSize: rf(60), color: '#D4AF37',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    detailName: {
        fontSize: rf(32), fontWeight: 'bold', color: '#fff',
        marginBottom: verticalScale(10), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    divider: {
        width: scale(50), height: 2, backgroundColor: '#D4AF37', marginVertical: verticalScale(20), opacity: 0.5
    },
    infoSection: {
        width: '100%', alignItems: 'center', marginBottom: verticalScale(30)
    },
    label: {
        fontSize: rf(14), color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, marginBottom: verticalScale(10)
    },
    detailMeaning: {
        fontSize: rf(18), color: 'rgba(255,255,255,0.9)',
        textAlign: 'center', lineHeight: rf(28)
    },
    zikirBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: rem(20), borderRadius: scale(16),
        width: '100%', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    zikirText: {
        fontSize: rf(16), color: 'rgba(255,255,255,0.8)', textAlign: 'center'
    },
    zikirHighlight: {
        color: '#D4AF37', fontWeight: 'bold', fontSize: rf(18)
    }
});
