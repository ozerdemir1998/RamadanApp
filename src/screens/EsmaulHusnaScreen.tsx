import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Esma } from '../data/esmaulHusnaData';
import { getEsmaulHusna } from '../services/esmaService';

const { width } = Dimensions.get('window');

export default function EsmaulHusnaScreen({ onClose }: { onClose?: () => void }) {
    const router = useRouter();
    const [esmaList, setEsmaList] = useState<Esma[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEsma, setSelectedEsma] = useState<Esma | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getEsmaulHusna();
        setEsmaList(data);
        setLoading(false);
    };

    // --- DETAY GÖRÜNÜMÜ ---
    if (selectedEsma) {
        return (
            <LinearGradient
                colors={['#0F2027', '#203A43', '#2C5364']}
                style={styles.container}
            >
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <View style={{ marginTop: 20 }}>
                        <ScreenHeader
                            title={selectedEsma.name}
                            onLeftPress={() => setSelectedEsma(null)}
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
        );
    }

    // --- LİSTE GÖRÜNÜMÜ ---
    const renderItem = ({ item }: { item: Esma }) => {
        return (
            <TouchableOpacity
                style={styles.simpleCard}
                onPress={() => setSelectedEsma(item)}
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Removed custom header styles
    listContent: { padding: 20 },

    // SIMPLE LIST CARD
    simpleCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    simpleCardContent: {
        flexDirection: 'row', alignItems: 'center', padding: 15
    },
    simpleArabicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 95,
        marginRight: 15,
    },
    simpleArabic: {
        color: '#D4AF37',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'right',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginRight: 10
    },
    verticalSeparator: {
        width: 2,
        height: 30,
        backgroundColor: '#D4AF37',
        opacity: 0.5,
        borderRadius: 1
    },
    simpleName: { color: '#fff', fontSize: 18, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    // DETAIL VIEW STYLES
    detailContent: {
        alignItems: 'center', padding: 30
    },
    detailIconContainer: {
        width: 180, height: 180, borderRadius: 90, // Büyütüldü
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)',
        marginBottom: 30,
        padding: 20 // Padding eklendi
    },
    detailArabicText: {
        fontSize: 60, color: '#D4AF37',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    detailName: {
        fontSize: 32, fontWeight: 'bold', color: '#fff',
        marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    divider: {
        width: 50, height: 2, backgroundColor: '#D4AF37', marginVertical: 20, opacity: 0.5
    },
    infoSection: {
        width: '100%', alignItems: 'center', marginBottom: 30
    },
    label: {
        fontSize: 14, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10
    },
    detailMeaning: {
        fontSize: 18, color: 'rgba(255,255,255,0.9)',
        textAlign: 'center', lineHeight: 28
    },
    zikirBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20, borderRadius: 16,
        width: '100%', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    zikirText: {
        fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center'
    },
    zikirHighlight: {
        color: '#D4AF37', fontWeight: 'bold', fontSize: 18
    }
});
