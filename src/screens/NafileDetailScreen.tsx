import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { fetchNafileDetail, NafileNamaz } from '../services/nafileService';

export default function NafileDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [namaz, setNamaz] = useState<NafileNamaz | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        const data = await fetchNafileDetail(id as string);
        setNamaz(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    if (!namaz) {
        return (
            <View style={styles.centerContainer}>
                <ScreenHeader
                    title="Hata"
                    onLeftPress={() => router.back()}
                />
                <Text style={styles.errorText}>Namaz bilgisi bulunamadı.</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* HEADER */}
                {/* HEADER */}
                <ScreenHeader
                    title={namaz.name}
                    onLeftPress={() => router.back()}
                    rightIcon={
                        <TouchableOpacity style={styles.shareButton}>
                            <Ionicons name="share-outline" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>

                    {/* VAKİT KARTI */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#D4AF37" />
                            <Text style={styles.cardTitle}>Ne Zaman Kılınır?</Text>
                        </View>
                        <Text style={styles.cardText}>{namaz.time}</Text>
                    </View>

                    {/* KILINIŞ KARTI */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="human-handsup" size={24} color="#D4AF37" />
                            <Text style={styles.cardTitle}>Nasıl Kılınır?</Text>
                        </View>
                        <Text style={styles.cardText}>{namaz.howToPray}</Text>
                    </View>

                    {/* FAZİLET KARTI */}
                    <View style={[styles.card, styles.highlightCard]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="star-crescent" size={24} color="#FFD700" />
                            <Text style={[styles.cardTitle, { color: '#FFD700' }]}>Fazileti ve Anlamı</Text>
                        </View>
                        <Text style={[styles.cardText, { fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }]}>{namaz.virtue}</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
            <StatusBar barStyle="light-content" />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F2027',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F2027',
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    shareButton: {
        padding: 8,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    highlightCard: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginLeft: 10,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    cardText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
    },
});
