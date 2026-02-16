import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BAYRAM_NAMAZI_CONTENT } from '../data/specialOccasionsData';

const { width } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/ramadan.png');

export default function BayramNamaziScreen() {
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
                            <Ionicons name="arrow-back" size={24} color="#A0E6FF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{BAYRAM_NAMAZI_CONTENT.title}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* HERO SECTION */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={['rgba(32, 58, 67, 0.8)', 'rgba(44, 83, 100, 0.8)']}
                            style={styles.heroGradient}
                        >
                            <MaterialCommunityIcons name="mosque" size={60} color="#A0E6FF" style={{ marginBottom: 15 }} />
                            <Text style={styles.heroTitle}>{BAYRAM_NAMAZI_CONTENT.subTitle}</Text>
                            <Text style={styles.heroDescription}>{BAYRAM_NAMAZI_CONTENT.description}</Text>
                        </LinearGradient>
                    </View>

                    {/* STEPS LIST */}
                    <Text style={styles.sectionHeader}>Nasıl Kılınır?</Text>

                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLine} />

                        {BAYRAM_NAMAZI_CONTENT.steps.map((item, index) => (
                            <View key={index} style={styles.stepWrapper}>
                                <View style={styles.timelineDotContainer}>
                                    <View style={styles.timelineDot}>
                                        <Text style={styles.stepNumber}>{item.step}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardContainer}>
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                        style={styles.cardGradient}
                                    >
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                        <View style={styles.divider} />
                                        <Text style={styles.cardText}>{item.text}</Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 + insets.bottom }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: 400, height: 400, opacity: 0.03, tintColor: '#A0E6FF', resizeMode: 'contain' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: -20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    heroSection: { marginBottom: 30, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(160, 230, 255, 0.3)' },
    heroGradient: { padding: 30, alignItems: 'center' },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#A0E6FF', textAlign: 'center', marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    heroDescription: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 24 },

    sectionHeader: { fontSize: 18, color: '#A0E6FF', marginBottom: 20, fontWeight: '600', marginLeft: 5 },

    timelineContainer: { position: 'relative', paddingLeft: 10 },
    timelineLine: { position: 'absolute', left: 24, top: 20, bottom: 50, width: 2, backgroundColor: 'rgba(160, 230, 255, 0.3)' },

    stepWrapper: { flexDirection: 'row', marginBottom: 20 },
    timelineDotContainer: { marginRight: 15, alignItems: 'center' },
    timelineDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#A0E6FF', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    stepNumber: { color: '#000', fontWeight: 'bold', fontSize: 14 },

    cardContainer: { flex: 1, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardGradient: { padding: 20 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#A0E6FF', marginBottom: 8 },
    divider: { height: 1, backgroundColor: 'rgba(160, 230, 255, 0.3)', marginBottom: 10 },
    cardText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
});
