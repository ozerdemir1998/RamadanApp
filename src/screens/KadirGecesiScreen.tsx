import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KADIR_GECESI_CONTENT } from '../data/specialOccasionsData';

const { width } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/ramadan.png');

export default function KadirGecesiScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            <View style={styles.backgroundPatternContainer} pointerEvents="none">
                <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -100, top: 50 }]} />
                <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -100, bottom: 50, transform: [{ rotate: '180deg' }] }]} />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{KADIR_GECESI_CONTENT.title}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* HERO SECTION */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)']}
                            style={styles.heroGradient}
                        >
                            <MaterialCommunityIcons name="moon-waning-crescent" size={60} color="#D4AF37" style={{ marginBottom: 15 }} />
                            <Text style={styles.heroTitle}>{KADIR_GECESI_CONTENT.subTitle}</Text>
                            <Text style={styles.heroDescription}>{KADIR_GECESI_CONTENT.description}</Text>
                        </LinearGradient>
                    </View>

                    {/* WORSHIPS LIST */}
                    <Text style={styles.sectionHeader}>Bu Gece Yapılacak İbadetler</Text>

                    {KADIR_GECESI_CONTENT.worships.map((item, index) => (
                        <View key={index} style={styles.cardContainer}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                style={styles.cardGradient}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons
                                            name={getIconName(index)}
                                            size={24}
                                            color="#D4AF37"
                                        />
                                    </View>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.cardText}>{item.text}</Text>
                            </LinearGradient>
                        </View>
                    ))}

                    <View style={{ height: 40 + insets.bottom }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const getIconName = (index: number) => {
    switch (index) {
        case 0: return 'book-open-page-variant'; // Kur'an
        case 1: return 'mosque'; // Namaz
        case 2: return 'hand-extended'; // Dua
        case 3: return 'star-four-points'; // Zikir
        default: return 'star-four-points';
    }
};

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: 400, height: 400, opacity: 0.03, tintColor: '#D4AF37', resizeMode: 'contain' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: -20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    heroSection: { marginBottom: 30, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    heroGradient: { padding: 30, alignItems: 'center' },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    heroDescription: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 24 },

    sectionHeader: { fontSize: 18, color: '#D4AF37', marginBottom: 15, fontWeight: '600', marginLeft: 5 },

    cardContainer: { marginBottom: 15, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardGradient: { padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
    cardText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
});
