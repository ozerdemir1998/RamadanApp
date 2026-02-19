import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { BAYRAM_NAMAZI_CONTENT } from '../data/specialOccasionsData';
import { rf, scale, verticalScale } from '../utils/responsive';

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

                    <ScreenHeader
                        title={BAYRAM_NAMAZI_CONTENT.title}
                        onLeftPress={() => router.back()}
                        centerTitle
                    />

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
    bgPatternImage: { position: 'absolute', width: scale(400), height: scale(400), opacity: 0.03, tintColor: '#A0E6FF', resizeMode: 'contain' },

    scrollContent: { paddingHorizontal: scale(20), paddingBottom: verticalScale(20) },

    heroSection: { marginBottom: verticalScale(30), borderRadius: scale(20), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(160, 230, 255, 0.3)' },
    heroGradient: { padding: scale(30), alignItems: 'center' },
    heroTitle: { fontSize: rf(22), fontWeight: 'bold', color: '#A0E6FF', textAlign: 'center', marginBottom: verticalScale(10), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    heroDescription: { fontSize: rf(16), color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: rf(24) },

    sectionHeader: { fontSize: rf(18), color: '#A0E6FF', marginBottom: verticalScale(20), fontWeight: '600', marginLeft: scale(5) },

    timelineContainer: { position: 'relative', paddingLeft: scale(10) },
    timelineLine: { position: 'absolute', left: scale(24), top: verticalScale(20), bottom: verticalScale(50), width: scale(2), backgroundColor: 'rgba(160, 230, 255, 0.3)' },

    stepWrapper: { flexDirection: 'row', marginBottom: verticalScale(20) },
    timelineDotContainer: { marginRight: scale(15), alignItems: 'center' },
    timelineDot: { width: scale(30), height: scale(30), borderRadius: scale(15), backgroundColor: '#A0E6FF', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    stepNumber: { color: '#000', fontWeight: 'bold', fontSize: rf(14) },

    cardContainer: { flex: 1, borderRadius: scale(15), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardGradient: { padding: scale(20) },
    cardTitle: { fontSize: rf(18), fontWeight: 'bold', color: '#A0E6FF', marginBottom: verticalScale(8) },
    divider: { height: 1, backgroundColor: 'rgba(160, 230, 255, 0.3)', marginBottom: verticalScale(10) },
    cardText: { fontSize: rf(15), color: 'rgba(255,255,255,0.8)', lineHeight: rf(22) },
});
