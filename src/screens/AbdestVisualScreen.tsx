import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CloseButton from '../components/CloseButton';
import ScreenHeader from '../components/ScreenHeader';
import { rf, scale, SCREEN_DIMENSIONS, verticalScale } from '../utils/responsive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = SCREEN_DIMENSIONS;

// --- TİP TANIMLARI ---
type AbdestStep = {
    title: string;
    desc: string;
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
};

type AbdestType = 'VAKIT' | 'GUSUL' | 'TEYEMMUM';

// --- VERİLER ---

const VAKIT_STEPS: AbdestStep[] = [
    { title: '1. Niyet ve Eller', desc: 'Niyet ettim Allah rızası için abdest almaya" diye niyet edilir. Eller bileklerle beraber üç kere yıkanır.', iconName: 'hand-wash', color: '#4FC3F7' },
    { title: '2. Ağız', desc: 'Sağ avuç ile ağza üç kere ayrı ayrı su alınıp her defasında iyice çalkalanır.', iconName: 'water', color: '#29B6F6' },
    { title: '3. Burun', desc: 'Sağ avuç ile burna üç kere ayrı ayrı su çekilir. Sol el ile sümkürülerek temizlenir.', iconName: 'water-plus', color: '#03A9F4' },
    { title: '4. Yüz', desc: 'Alında saçların bittiği yerden kulak yumuşağına ve çene altına kadar yüzün her yeri üç kere yıkanır.', iconName: 'face-man', color: '#039BE5' },
    { title: '5. Sağ Kol', desc: 'Sağ kol dirseklerle beraber üç kere yıkanır.', iconName: 'arm-flex', color: '#0288D1' },
    { title: '6. Sol Kol', desc: 'Sol kol dirseklerle beraber üç kere yıkanır.', iconName: 'arm-flex-outline', color: '#0277BD' },
    {
        title: '7. Baş',
        desc: 'Sağ elin içiyle başın en az dörtte biri mesh edilir.\n\n(Kadınlar için: Başörtüsü üzerinden de mesh edilebilir görüşü vardır ancak aslolan çıplak başa meshtir).',
        iconName: 'head-snowflake',
        color: '#01579B'
    },
    { title: '8. Kulaklar', desc: 'Eller ıslatılarak serçe parmaklarla kulakların içi, baş parmaklarla da kulakların arkası mesh edilir.', iconName: 'ear-hearing', color: '#4FC3F7' },
    { title: '9. Boyun', desc: 'Baş ve serçe parmaklar hariç diğer üç parmağın dışıyla boyun mesh edilir.', iconName: 'account', color: '#29B6F6' },
    { title: '10. Ayaklar', desc: 'Önce sağ, sonra sol ayak bileklerle beraber üç kere yıkanır.', iconName: 'foot-print', color: '#03A9F4' }
];

const GUSUL_STEPS: AbdestStep[] = [
    { title: '1. Niyet', desc: '"Niyet ettim Allah rızası için boy abdesti almaya" diye niyet edilir. Vücuttaki pislikler temizlenir.', iconName: 'hand-heart', color: '#FFD54F' },
    { title: '2. Ağız', desc: 'Ağıza üç kere dolu dolu su verilir ve boğaza kadar çalkalanır (Oruçlu değilken).', iconName: 'water', color: '#FFCA28' },
    { title: '3. Burun', desc: 'Burna üç kere dolu dolu su çekilir ve temizlenir.', iconName: 'water-plus', color: '#FFC107' },
    { title: '4. Beden', desc: 'Tüm vücut, iğne ucu kadar kuru yer kalmayacak şekilde yıkanır. Önce baş, sonra sağ omuz, sonra sol omuzdan su dökülür.', iconName: 'human', color: '#FFA000' }
];

const TEYEMMUM_STEPS: AbdestStep[] = [
    { title: '1. Niyet', desc: 'Temiz toprak veya toprak cinsinden bir şeye niyet edilerek eller vurulur.', iconName: 'image-filter-hdr', color: '#BCAAA4' },
    { title: '2. Yüz', desc: 'Eller silkelenir ve yüzün tamamı mesh edilir.', iconName: 'face-man-profile', color: '#A1887F' },
    { title: '3. Kollar', desc: 'Eller tekrar toprağa vurulur, silkelenir. Önce sağ kol, sonra sol kol dirseklerle beraber mesh edilir.', iconName: 'arm-flex', color: '#8D6E63' }
];

export default function AbdestVisualScreen({ onClose }: { onClose: () => void }) {
    const insets = useSafeAreaInsets();
    const [selectedType, setSelectedType] = useState<AbdestType | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Aktif adımları belirle
    const getCurrentSteps = () => {
        switch (selectedType) {
            case 'GUSUL': return GUSUL_STEPS;
            case 'TEYEMMUM': return TEYEMMUM_STEPS;
            default: return VAKIT_STEPS;
        }
    };

    const steps = getCurrentSteps();
    const activeStep = steps[currentStepIndex];

    const handleSelectType = (type: AbdestType) => {
        setSelectedType(type);
        setCurrentStepIndex(0);
    };

    const handleBackToMenu = () => {
        setSelectedType(null);
        setCurrentStepIndex(0);
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleBackToMenu();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        } else {
            handleBackToMenu();
        }
    };

    const handlePress = (evt: any) => {
        const { locationX } = evt.nativeEvent;
        if (locationX < width * 0.3) {
            prevStep();
        } else {
            nextStep();
        }
    };

    // Helper to get title text
    const getTitle = () => {
        switch (selectedType) {
            case 'GUSUL': return 'Boy Abdesti';
            case 'TEYEMMUM': return 'Teyemmüm';
            default: return 'Namaz Abdesti';
        }
    };

    return (
        <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* ANA EKRAN HEADER */}
                <View style={{ marginTop: 20 }}>
                    <ScreenHeader
                        title="Abdest Rehberi"
                        leftIcon="none"
                        centerTitle
                        rightIcon={<CloseButton onPress={onClose} />}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.menuContainer}>
                    <Text style={styles.menuSubtitle}>Lütfen bir abdest çeşidi seçiniz</Text>

                    <TouchableOpacity style={styles.menuCard} onPress={() => handleSelectType('VAKIT')} activeOpacity={0.8}>
                        <View style={[styles.menuIconBox, { backgroundColor: 'rgba(79, 195, 247, 0.2)' }]}>
                            <MaterialCommunityIcons name="water" size={32} color="#4FC3F7" />
                        </View>
                        <View style={styles.menuCardContent}>
                            <Text style={styles.menuCardTitle}>Namaz Abdesti</Text>
                            <Text style={styles.menuCardDesc}>Günlük ibadetler için alınan normal abdest.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => handleSelectType('GUSUL')} activeOpacity={0.8}>
                        <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255, 202, 40, 0.2)' }]}>
                            <MaterialCommunityIcons name="shower-head" size={32} color="#FFCA28" />
                        </View>
                        <View style={styles.menuCardContent}>
                            <Text style={styles.menuCardTitle}>Boy Abdesti (Gusül)</Text>
                            <Text style={styles.menuCardDesc}>Tüm vücudun yıkandığı hükmi temizlik.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => handleSelectType('TEYEMMUM')} activeOpacity={0.8}>
                        <View style={[styles.menuIconBox, { backgroundColor: 'rgba(188, 170, 164, 0.2)' }]}>
                            <MaterialCommunityIcons name="image-filter-hdr" size={32} color="#BCAAA4" />
                        </View>
                        <View style={styles.menuCardContent}>
                            <Text style={styles.menuCardTitle}>Teyemmüm</Text>
                            <Text style={styles.menuCardDesc}>Su bulunamadığında toprakla yapılan temizlik.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
                    </TouchableOpacity>
                </ScrollView>

                {/* VISUAL GUIDE MODAL - "FADE" TRANSITION */}
                <Modal
                    visible={!!selectedType}
                    animationType="fade"
                    transparent={false}
                    onRequestClose={handleBackToMenu}
                >
                    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
                        <StatusBar hidden={true} barStyle="light-content" />

                        {/* NamazVisualScreen MİMARİSİ UYGULANIYOR */}
                        <View style={{ flex: 1 }} onTouchEnd={handlePress}>
                            {/* Safe Area View yerine manual padding kullanıyoruz çünkü Modal içinde SafeAreaView bazen tutarsız olabilir */}
                            <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 40 : insets.top }}>

                                {/* ÜST BAR (SABİT KONUM) - NamazVisualScreen ile AYNI YAPI */}
                                <View style={[styles.slideHeader, { marginTop: 10 }]}>
                                    <View style={styles.headerControls}>
                                        <TouchableOpacity onPress={handleBackToMenu} style={styles.backButton}>
                                            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
                                            <Text style={styles.backButtonText}>Menü</Text>
                                        </TouchableOpacity>

                                        {/* ORTA KISIM BOŞ (Namaz Visual Screen'de burası adım sayacıydı, abdestte başlık buraya gelebilir ya da boş kalabilir) */}
                                        {/* Abdest başlığı aşağıda (textContainer içinde) olduğu için burayı boş bırakıyoruz - hizalama için */}

                                        <CloseButton onPress={handleBackToMenu} />
                                    </View>
                                </View>

                                {/* İÇERİK */}
                                <View style={styles.contentContainer}>
                                    {selectedType && (
                                        <>
                                            <View style={styles.visualContainer}>
                                                <View style={[styles.iconCircle, { borderColor: activeStep.color }]}>
                                                    <MaterialCommunityIcons name={activeStep.iconName as any} size={100} color={activeStep.color} />
                                                </View>
                                            </View>

                                            <View style={styles.textContainer}>
                                                <Text style={[styles.stepTitle, { color: activeStep.color }]}>{activeStep.title}</Text>
                                                <Text style={styles.stepDesc}>{activeStep.desc}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>

                                {/* ALT FOOTER */}
                                <View style={styles.footerContainer}>
                                    <Text style={styles.stepCounter}>{currentStepIndex + 1} / {steps.length}</Text>
                                    <Text style={styles.tapHintFooter}>
                                        {currentStepIndex === 0 ? "< Menü" : "< Geri"}  |  {currentStepIndex === steps.length - 1 ? "Bitir >" : "İleri >"}
                                    </Text>
                                </View>

                            </View>
                        </View>
                    </LinearGradient>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    slideHeader: { paddingHorizontal: scale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(10) },
    headerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: scale(60),
    },
    backButtonText: {
        color: '#D4AF37',
        fontSize: rf(16),
        marginLeft: scale(5),
    },

    // MENÜ STİLLERİ
    menuContainer: {
        padding: scale(20),
    },
    menuSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        marginBottom: verticalScale(20),
        textAlign: 'center',
        fontSize: rf(14)
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: scale(20),
        borderRadius: scale(16),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    menuIconBox: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    menuCardContent: {
        flex: 1,
    },
    menuCardTitle: {
        color: '#fff',
        fontSize: rf(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(5),
    },
    menuCardDesc: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: rf(12),
    },

    // REHBER STİLLERİ
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scale(30),
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(20),
    },

    visualContainer: {
        marginBottom: verticalScale(40),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(10) },
        shadowOpacity: 0.3,
        shadowRadius: scale(20),
        elevation: 10,
    },
    iconCircle: {
        width: scale(180),
        height: scale(180),
        borderRadius: scale(90),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)'
    },

    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    stepTitle: {
        fontSize: rf(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(15),
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        textAlign: 'center',
    },
    stepDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: rf(16),
        textAlign: 'center',
        lineHeight: rf(24),
        minHeight: verticalScale(120),
    },

    // FOOTER STİLLERİ
    footerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: verticalScale(20),
        width: '100%',
    },
    stepCounter: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: rf(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(5),
    },
    tapHintFooter: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: rf(12),
    }
});
