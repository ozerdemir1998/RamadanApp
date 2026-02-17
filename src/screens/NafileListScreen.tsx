import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { fetchNafileNamazlar, NafileNamaz } from '../services/nafileService';

export default function NafileListScreen() {
    const router = useRouter();
    const [namazlar, setNamazlar] = useState<NafileNamaz[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        const data = await fetchNafileNamazlar();
        setNamazlar(data);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: NafileNamaz }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => router.push({ pathname: '/nafile-detail', params: { id: item.id } })}
        >
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.cardGradient}
            >
                {/* SOL: Arapça İsim */}
                <View style={styles.arabicContainer}>
                    <Text style={styles.arabicText}>{item.arabicName || "..."}</Text>
                </View>

                {/* ORTA: Altın Çizgi */}
                <View style={styles.separator} />

                {/* SAĞ: Namaz Bilgisi */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* HEADER */}
                <ScreenHeader
                    title="Nafile Namazlar"
                    onLeftPress={() => router.back()}
                    centerTitle
                />

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#D4AF37" />
                    </View>
                ) : (
                    <FlatList
                        data={namazlar}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
            <StatusBar barStyle="light-content" />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
    },
    card: {
        marginBottom: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    arabicContainer: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arabicText: {
        fontSize: 18,
        color: '#D4AF37',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'serif',
        textAlign: 'center',
    },
    separator: {
        width: 2,
        height: '80%',
        backgroundColor: '#D4AF37',
        marginHorizontal: 15,
        borderRadius: 1,
        opacity: 0.6
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
});
