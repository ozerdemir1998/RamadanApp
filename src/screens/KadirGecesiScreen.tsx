import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { KADIR_GECESI_CONTENT } from '../data/specialOccasionsData';
import { rf, scale, verticalScale } from '../utils/responsive';

const ICON_PATTERN = require('../../assets/icons/ramadan.png');

export default function KadirGecesiScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const openSurah = (surahId: number, surahName: string) => {
        router.push({
            pathname: '/quran-detail',
            params: { surahId, surahName }
        });
    };

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
                        title={KADIR_GECESI_CONTENT.title}
                        onLeftPress={() => router.back()}
                        centerTitle
                    />

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

                    <Text style={styles.sectionHeader}>Bu Gece Yapılacak İbadetler</Text>

                    {/* 1. KUR'AN OKUMAK */}
                    <View style={styles.cardContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#D4AF37" />
                                </View>
                                <Text style={styles.cardTitle}>{KADIR_GECESI_CONTENT.worships[0].title}</Text>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.cardText}>{KADIR_GECESI_CONTENT.worships[0].text}</Text>

                            {/* ACTION BUTTONS */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => openSurah(97, 'Kadir Suresi')}
                                >
                                    <View style={styles.actionIcon}>
                                        <MaterialCommunityIcons name="play" size={20} color="#0F2027" />
                                    </View>
                                    <Text style={styles.actionText}>Kadir Suresi</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => openSurah(44, 'Duhan Suresi')}
                                >
                                    <View style={styles.actionIcon}>
                                        <MaterialCommunityIcons name="play" size={20} color="#0F2027" />
                                    </View>
                                    <Text style={styles.actionText}>Duhan Suresi</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* 2. NAMAZ */}
                    <View style={styles.cardContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="mosque" size={24} color="#D4AF37" />
                                </View>
                                <Text style={styles.cardTitle}>{KADIR_GECESI_CONTENT.worships[1].title}</Text>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.cardText}>{KADIR_GECESI_CONTENT.worships[1].text}</Text>

                            {/* ACTION BUTTON */}
                            <TouchableOpacity
                                style={[styles.fullWidthButton, { marginTop: 15 }]}
                                onPress={() => router.push('/nafile-list')}
                            >
                                <LinearGradient
                                    colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.08)']}
                                    style={styles.fullWidthGradient}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.fullWidthBtnText}>Nafile Namazları Gör</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(212, 175, 55, 0.8)" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* 3. DUA */}
                    <View style={styles.cardContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="hand-extended" size={24} color="#D4AF37" />
                                </View>
                                <Text style={styles.cardTitle}>{KADIR_GECESI_CONTENT.worships[2].title}</Text>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.cardText}>{KADIR_GECESI_CONTENT.worships[2].text}</Text>
                        </LinearGradient>
                    </View>

                    {/* 4. ZİKİR */}
                    <View style={styles.cardContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="star-four-points" size={24} color="#D4AF37" />
                                </View>
                                <Text style={styles.cardTitle}>{KADIR_GECESI_CONTENT.worships[3].title}</Text>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.cardText}>{KADIR_GECESI_CONTENT.worships[3].text}</Text>

                            {/* ACTION BUTTON */}
                            <TouchableOpacity
                                style={[styles.fullWidthButton, { marginTop: 15 }]}
                                onPress={() => router.push('/zikirmatik')}
                            >
                                <LinearGradient
                                    colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.08)']}
                                    style={styles.fullWidthGradient}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.fullWidthBtnText}>Zikirmatik'i Aç</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(212, 175, 55, 0.8)" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    <View style={{ height: 40 + insets.bottom }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: scale(400), height: scale(400), opacity: 0.03, tintColor: '#D4AF37', resizeMode: 'contain' },

    scrollContent: { paddingHorizontal: scale(20), paddingBottom: verticalScale(20) },

    heroSection: { marginBottom: verticalScale(30), borderRadius: scale(20), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    heroGradient: { padding: scale(30), alignItems: 'center' },
    heroTitle: { fontSize: rf(22), fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginBottom: verticalScale(10), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    heroDescription: { fontSize: rf(16), color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: rf(24) },

    sectionHeader: { fontSize: rf(18), color: '#D4AF37', marginBottom: verticalScale(15), fontWeight: '600', marginLeft: scale(5) },

    cardContainer: { marginBottom: verticalScale(15), borderRadius: scale(15), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardGradient: { padding: scale(20) },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
    iconBox: { width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: scale(15) },
    cardTitle: { fontSize: rf(18), fontWeight: 'bold', color: '#FFF' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: verticalScale(10) },
    cardText: { fontSize: rf(15), color: 'rgba(255,255,255,0.8)', lineHeight: rf(22) },

    // NEW UTILS
    actionRow: { flexDirection: 'row', marginTop: verticalScale(15), gap: scale(10) },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(10),
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)'
    },
    actionIcon: {
        width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: 'rgba(212, 175, 55, 0.6)',
        justifyContent: 'center', alignItems: 'center', marginRight: scale(8)
    },
    actionText: { color: 'rgba(212, 175, 55, 0.9)', fontWeight: 'bold', fontSize: rf(13) },

    fullWidthButton: { width: '100%', borderRadius: scale(12), overflow: 'hidden' },
    fullWidthGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(12), paddingHorizontal: scale(20), backgroundColor: 'rgba(212, 175, 55, 0.12)' },
    fullWidthBtnText: { color: 'rgba(212, 175, 55, 0.9)', fontWeight: 'bold', fontSize: rf(15) }
});
