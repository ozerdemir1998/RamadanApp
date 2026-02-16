import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, LayoutAnimation, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/pattern.png');

// --- NAMAZ GÖRSELLERİ ---
// Lütfen resimleri assets/namaz/ klasörüne bu isimlerle koyduğunuzdan emin olun.
const NAMAZ_IMAGES = {
  tekbir: require('../../assets/namaz/1-tekbir.png'),
  kiyam: require('../../assets/namaz/2-kiyam.png'),
  ruku: require('../../assets/namaz/3-ruku.png'),
  secde: require('../../assets/namaz/4-secde.png'),
  oturus: require('../../assets/namaz/5-oturus.png'),
};

// --- TİP TANIMLARI ---
type NamazStep = {
  title: string;
  arabic?: string;
  desc: string;
  image: any; // İkon yerine resim kaynağı
};

// --- NAMAZ HAREKETLERİ OLUŞTURUCU ---
const createRakat = (rakatNumber: number): NamazStep[] => {
  const steps: NamazStep[] = [
    {
      title: `${rakatNumber}. Rekat: Kıyam`,
      desc: 'Eller bağlı, Fatiha ve Zamm-ı Sure okunur.',
      arabic: 'Elhamdülillahi rabbil alemin...',
      image: NAMAZ_IMAGES.kiyam
    },
    {
      title: 'Rüku',
      desc: 'Bel dümdüz olacak şekilde eğilinir, ellerle dizler tutulur.',
      arabic: 'Sübhane Rabbiyel Azim (3 kere)',
      image: NAMAZ_IMAGES.ruku
    },
    {
      title: 'Doğrulma (Kavme)',
      desc: 'Rükudan tam olarak doğrulup kısa bir süre dik durulur.',
      image: NAMAZ_IMAGES.kiyam // Doğrulurken yine ayakta (kıyam) duruşu
    },
    {
      title: '1. Secde',
      desc: 'Alın ve burun yere değecek şekilde kapanılır.',
      arabic: 'Sübhane Rabbiyel Ala (3 kere)',
      image: NAMAZ_IMAGES.secde
    },
    {
      title: 'Oturuş (Celse)',
      desc: 'İki secde arasında kısa bir süre dizler üzerinde oturulur.',
      image: NAMAZ_IMAGES.oturus
    },
    {
      title: '2. Secde',
      desc: 'Tekrar secdeye gidilir.',
      arabic: 'Sübhane Rabbiyel Ala (3 kere)',
      image: NAMAZ_IMAGES.secde
    },
  ];
  return steps;
};

// SABAH NAMAZI ADIMLARI
const SABAH_NAMAZI_STEPS: NamazStep[] = [
  {
    title: 'Niyet',
    desc: 'Kalben niyet edilir, gözler secde yerine bakar.',
    image: NAMAZ_IMAGES.kiyam // Niyet ederken ayakta durulur
  },
  {
    title: 'İftitah Tekbiri',
    desc: 'Eller kulak hizasına kaldırılır.',
    arabic: 'Allahu Ekber',
    image: NAMAZ_IMAGES.tekbir
  },
  {
    title: 'Sübhaneke & Kıraat',
    desc: 'Eller bağlanır. Sübhaneke ve sureler okunur.',
    arabic: 'Sübhanekellahümme...',
    image: NAMAZ_IMAGES.kiyam
  },
  ...createRakat(1).slice(1), // İlk kıyam adımını atla, yukarıda ekledik
  ...createRakat(2),
  {
    title: 'Son Oturuş',
    desc: 'Dizler üzerine oturulur. Ettahiyyatu, Salli, Barik, Rabbena okunur.',
    arabic: 'Ettahiyyatü lillahi...',
    image: NAMAZ_IMAGES.oturus
  },
  {
    title: 'Selam',
    desc: 'Önce sağa, sonra sola selam verilir.',
    arabic: 'Esselamü aleyküm ve rahmetullah',
    image: NAMAZ_IMAGES.oturus // Selam verirken oturulur
  },
];

const GENERIC_STEPS = SABAH_NAMAZI_STEPS;

const PRAYERS = [
  { id: 1, name: 'Sabah Namazı', rakats: '2 Sünnet, 2 Farz', sequence: SABAH_NAMAZI_STEPS },
  { id: 2, name: 'Öğle Namazı', rakats: '4 Sünnet, 4 Farz, 2 Son Sünnet', sequence: GENERIC_STEPS },
  { id: 3, name: 'İkindi Namazı', rakats: '4 Sünnet, 4 Farz', sequence: GENERIC_STEPS },
  { id: 4, name: 'Akşam Namazı', rakats: '3 Farz, 2 Sünnet', sequence: GENERIC_STEPS },
  { id: 5, name: 'Yatsı Namazı', rakats: '4 Sünnet, 4 Farz, 3 Vitir', sequence: GENERIC_STEPS },
];

export default function NamazVisualScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // EKLENDİ: Güvenli alanları al
  const insets = useSafeAreaInsets();

  // --- SLIDESHOW STATE ---
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<NamazStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentPrayerName, setCurrentPrayerName] = useState('');

  // --- ANİMASYON DEĞERLERİ ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const startPractice = (prayerName: string, steps: NamazStep[]) => {
    setCurrentPrayerName(prayerName);
    setCurrentSteps(steps);
    setCurrentStepIndex(0);
    setShowSlideshow(true);
  };

  const nextStep = () => {
    if (currentStepIndex < currentSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setShowSlideshow(false);
    }
  };

  // --- ANİMASYON TETİKLEYİCİSİ ---
  useEffect(() => {
    if (showSlideshow) {
      // Başlangıç değerleri
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500, // 500ms sürede belirsin
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [currentStepIndex, showSlideshow]);

  // --- SLIDESHOW RENDER ---
  const renderSlideshow = () => {
    if (!showSlideshow || !currentSteps || currentSteps.length === 0) return null;
    const step = currentSteps[currentStepIndex];
    if (!step) return null;

    const progress = ((currentStepIndex + 1) / currentSteps.length) * 100;

    return (
      <Modal visible={showSlideshow} animationType="fade" transparent={false} onRequestClose={() => setShowSlideshow(false)}>
        <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
          <StatusBar hidden />

          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={nextStep}>
            <SafeAreaView style={{ flex: 1 }}>

              {/* ÜST BAR */}
              <View style={styles.slideHeader}>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <View style={styles.headerControls}>
                  <Text style={styles.slideCounter}>{currentStepIndex + 1} / {currentSteps.length}</Text>
                  <TouchableOpacity onPress={() => setShowSlideshow(false)} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ORTA: GÖRSEL (IMAGE KULLANILIYOR) */}
              <View style={styles.slideContent}>
                <Text style={styles.slidePrayerName}>{currentPrayerName}</Text>

                <Animated.View
                  style={[
                    styles.slideIconContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
                >
                  <View style={styles.imageFrame}>
                    {/* --- DEĞİŞİKLİK BURADA: Image Bileşeni --- */}
                    <Image
                      source={step.image}
                      style={styles.namazImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Arkadaki Işık Efekti */}
                  <View style={styles.glowEffect} />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%', paddingHorizontal: 20 }}>
                  <Text style={styles.slideTitle}>{step.title}</Text>

                  {step.arabic && (
                    <Text style={styles.slideArabic}>"{step.arabic}"</Text>
                  )}

                  <Text style={styles.slideDesc}>{step.desc}</Text>
                </Animated.View>
              </View>

              {/* ALT: İPUCU */}
              <View style={styles.slideFooter}>
                <Text style={styles.tapHint}>Sonraki hareket için ekrana dokunun</Text>
              </View>

            </SafeAreaView>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>
    );
  };

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>

      <View style={styles.backgroundPatternContainer} pointerEvents="none">
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <MaterialCommunityIcons name="human" size={60} color="#D4AF37" />
            <Text style={styles.headerTitle}>Namaz Hocası</Text>
            <Text style={styles.headerSub}>Adım adım namaz kılınışı</Text>
          </View>

          {PRAYERS.map((prayer) => {
            const isExpanded = expandedId === prayer.id;

            return (
              <View key={prayer.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(prayer.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconBox}>
                    <Text style={styles.prayerId}>{prayer.id}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.prayerName, isExpanded && styles.activeText]}>{prayer.name}</Text>
                    <Text style={styles.rakats}>{prayer.rakats}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={isExpanded ? "#D4AF37" : "rgba(255,255,255,0.3)"}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedContent}>

                    <TouchableOpacity
                      style={styles.practiceButton}
                      onPress={() => startPractice(prayer.name, prayer.sequence)}
                    >
                      <LinearGradient
                        colors={['#D4AF37', '#F0E68C']}
                        style={styles.practiceGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      >
                        <MaterialCommunityIcons name="play-circle-outline" size={28} color="#0F2027" />
                        <Text style={styles.practiceText}>Uygulamalı Göster</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.summaryTitle}>Namaz Özeti:</Text>
                    {prayer.sequence.slice(0, 5).map((step, idx) => (
                      <View key={idx} style={styles.miniStep}>
                        <View style={styles.dot} />
                        <Text style={styles.miniStepText} numberOfLines={1}>{step.title}</Text>
                      </View>
                    ))}
                    <Text style={styles.moreText}>...ve devamı</Text>

                  </View>
                )}
              </View>
            );
          })}

          {/* DİNAMİK ALT BOŞLUK */}
          <View style={{ height: 85 + insets.bottom }} />

        </ScrollView>
      </SafeAreaView>

      {renderSlideshow()}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },
  container: { padding: 20 },

  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  headerTitle: { fontSize: 28, color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginTop: 10 },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  prayerId: { color: '#D4AF37', fontWeight: 'bold', fontSize: 18 },
  prayerName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  activeText: { color: '#D4AF37' },
  rakats: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  expandedContent: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },

  practiceButton: { marginBottom: 20 },
  practiceGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12,
  },
  practiceText: { color: '#0F2027', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  summaryTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 10, textTransform: 'uppercase' },
  miniStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37', marginRight: 10, opacity: 0.7 },
  miniStepText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  moreText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginLeft: 16, fontStyle: 'italic' },

  // --- SLIDESHOW (MODAL) ---
  slideHeader: { padding: 20 },
  progressBarContainer: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 15 },
  progressBar: { height: '100%', backgroundColor: '#D4AF37', borderRadius: 2 },
  headerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slideCounter: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 'bold' },
  closeBtn: { padding: 5 },

  slideContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  slidePrayerName: { color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 30, letterSpacing: 1, textTransform: 'uppercase' },

  slideIconContainer: {
    width: 320, height: 380, // Biraz daha geniş
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 30,
  },
  imageFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center', // Resmi ortala
    overflow: 'hidden', // Taşmaları engelle
  },
  namazImage: {
    width: '90%',
    height: '90%',
    zIndex: 3,
  },
  glowEffect: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#D4AF37', opacity: 0.15, zIndex: 1
  },

  slideTitle: { color: '#D4AF37', fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  slideArabic: { color: '#fff', fontSize: 18, fontStyle: 'italic', marginBottom: 10, textAlign: 'center', opacity: 0.9 },
  slideDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', lineHeight: 24 },

  slideFooter: { padding: 20, alignItems: 'center', marginBottom: 20 },
  tapHint: { color: 'rgba(255,255,255,0.3)', fontSize: 14 }
});