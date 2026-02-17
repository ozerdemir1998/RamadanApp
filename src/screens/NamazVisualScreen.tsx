import CloseButton from '../components/CloseButton';

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

// --- NAMAZ GÖRSELLERİ (ERKEK & KADIN) ---
const NAMAZ_IMAGES = {
  male: {
    tekbir: require('../../assets/namaz/erkek-tekbir.png'),
    kiyam: require('../../assets/namaz/erkek-kiyam.png'),
    ruku: require('../../assets/namaz/erkek-ruku.png'),
    kavme: require('../../assets/namaz/erkek-kavme.png'),
    secde: require('../../assets/namaz/erkek-secde.png'),
    oturus: require('../../assets/namaz/erkek-oturus.png'),
    selam: require('../../assets/namaz/erkek-selam.png'), // Sağ
    selam2: require('../../assets/namaz/erkek-selam2.png'), // Sol
  },
  female: {
    tekbir: require('../../assets/namaz/kadin-tekbir.png'),
    kiyam: require('../../assets/namaz/kadin-kiyam.png'),
    ruku: require('../../assets/namaz/kadin-ruku.png'),
    kavme: require('../../assets/namaz/kadin-kavme.png'),
    secde: require('../../assets/namaz/kadin-secde.png'),
    oturus: require('../../assets/namaz/kadin-oturus.png'),
    selam: require('../../assets/namaz/kadin-selam.png'), // Sağ
    selam2: require('../../assets/namaz/kadin-selam2.png'), // Sol
  }
};

type Gender = 'male' | 'female';

// --- TİP TANIMLARI ---
type NamazStep = {
  title: string;
  arabic?: string;
  desc: { male: string; female: string }; // Cinsiyete özel açıklama
  imageKey: keyof typeof NAMAZ_IMAGES['male'];
};

// --- NAMAZ HAREKETLERİ OLUŞTURUCU ---
const createRakat = (rakatNumber: number): NamazStep[] => {
  return [
    {
      title: `${rakatNumber}. Rekat: Kıyam`,
      desc: {
        male: 'Eller göbek altında bağlanır. Gözler secde yerine bakar. "Euzü Besmele" çekilir, "Fatiha" suresi ve ardından bir "Zamm-ı Sure" okunur.',
        female: 'Eller göğüs üzerinde bağlanır. Gözler secde yerine bakar. "Euzü Besmele" çekilir, "Fatiha" suresi ve ardından bir "Zamm-ı Sure" okunur.'
      },
      arabic: 'Elhamdülillahi rabbil alemin...',
      imageKey: 'kiyam'
    },
    {
      title: 'Rüku',
      desc: {
        male: '"Allahuekber" diyerek eğilinir. Bel dümdüz, bacaklar gergin olur. Ellerle dizler kavranır. 3 kere "Sübhane Rabbiyel Azim" (Büyük olan Rabbim her türlü noksan sıfatlardan uzaktır) denir.',
        female: '"Allahuekber" diyerek eğilinir. Sırt biraz meyilli, dizler hafif bükük durur. Eller dizlerin üzerine konur. 3 kere "Sübhane Rabbiyel Azim" denir.'
      },
      arabic: 'Sübhane Rabbiyel Azim (3 kere)',
      imageKey: 'ruku'
    },
    {
      title: 'Doğrulma (Kavme)',
      desc: {
        male: 'Rükudan kalkarken "Semiallahü limen hamideh" (Allah, kendisine hamd edeni işitir) denir. Tam dik durunca "Rabbena lekel hamd" (Rabbimiz, hamd sanadır) denir.',
        female: 'Rükudan kalkarken "Semiallahü limen hamideh" denir. Tam doğrulunca "Rabbena lekel hamd" denir. Eller yana salınır.'
      },
      imageKey: 'kavme'
    },
    {
      title: '1. Secde',
      desc: {
        male: '"Allahuekber" diyerek secdeye gidilir. Dirsekler yerden kalkık, karın uyluktan uzak tutulur. 3 kere "Sübhane Rabbiyel Ala" (Yüce olan Rabbim her türlü noksan sıfatlardan uzaktır) denir.',
        female: '"Allahuekber" diyerek secdeye gidilir. Kollar yere yapışık, karın uyluğa bitişik, vücut toplu halde olur. 3 kere "Sübhane Rabbiyel Ala" denir.'
      },
      arabic: 'Sübhane Rabbiyel Ala (3 kere)',
      imageKey: 'secde'
    },
    {
      title: 'Oturuş (Celse)',
      desc: {
        male: '"Allahuekber" diyerek oturulur. Sol ayak üzerine oturulur, sağ ayak parmakları kıbleye gelecek şekilde dikilir. Eller dizlerdedir.',
        female: '"Allahuekber" diyerek oturulur. Ayaklar sağ taraftan dışarı çıkarılır ve yere oturulur. Eller dizlerin üzerindedir.'
      },
      imageKey: 'oturus'
    },
    {
      title: '2. Secde',
      desc: {
        male: '"Allahuekber" diyerek tekrar secdeye gidilir. Vücut yine aynı pozisyonda (dirsekler havada) tutulur. 3 kere "Sübhane Rabbiyel Ala" denir.',
        female: '"Allahuekber" diyerek tekrar secdeye gidilir. Vücut yine toplu halde tutulur. 3 kere "Sübhane Rabbiyel Ala" denir.'
      },
      arabic: 'Sübhane Rabbiyel Ala (3 kere)',
      imageKey: 'secde'
    },
  ];
};

// SABAH NAMAZI ADIMLARI (Şablon)
const SABAH_NAMAZI_STEPS_TEMPLATE: NamazStep[] = [
  {
    title: 'Niyet',
    desc: {
      male: 'Kıbleye dönülür, ayaklar dört parmak açılır. "Niyet ettim Allah rızası için Sabah namazının sünnetini/farzını kılmaya" diye niyet edilir.',
      female: 'Kıbleye dönülür, ayaklar bitişik veya yakın tutulur. "Niyet ettim Allah rızası için Sabah namazının sünnetini/farzını kılmaya" diye niyet edilir.'
    },
    imageKey: 'kiyam'
  },
  {
    title: 'İftitah Tekbiri',
    desc: {
      male: 'Eller kulak hizasına kaldırılır, avuçlar kıbleye bakar. "Allahu Ekber" diyerek eller bağlanır.',
      female: 'Eller göğüs hizasına kaldırılır, parmak uçları omuz hizasına gelir. "Allahu Ekber" diyerek eller bağlanır.'
    },
    arabic: 'Allahu Ekber',
    imageKey: 'tekbir'
  },
  {
    title: 'Sübhaneke & Kıraat',
    desc: {
      male: 'Eller göbek altında bağlanır. "Sübhaneke" okunur. Ardından Euzü-Besmele, Fatiha ve bir Zamm-ı Sure okunur.',
      female: 'Eller göğüs üzerinde bağlanır. "Sübhaneke" okunur. Ardından Euzü-Besmele, Fatiha ve bir Zamm-ı Sure okunur.'
    },
    arabic: 'Sübhanekellahümme...',
    imageKey: 'kiyam'
  },
  ...createRakat(1).slice(1),
  ...createRakat(2),
  {
    title: 'Son Oturuş',
    desc: {
      male: 'Sol ayak üzerine oturulur, sağ ayak dikilir. Sırasıyla "Ettahiyyatu, Allahümme Salli, Allahümme Barik ve Rabbena" duaları okunur.',
      female: 'Ayaklar sağa çıkarılarak yere oturulur. Sırasıyla "Ettahiyyatu, Allahümme Salli, Allahümme Barik ve Rabbena" duaları okunur.'
    },
    arabic: 'Ettahiyyatü lillahi...',
    imageKey: 'oturus'
  },
  {
    title: 'Selam (Sağ)',
    desc: {
      male: 'Baş sağa çevrilerek omuzlara bakılır ve "Esselamü aleyküm ve rahmetullah" denir.',
      female: 'Baş sağa çevrilerek "Esselamü aleyküm ve rahmetullah" denir.'
    },
    arabic: 'Esselamü aleyküm ve rahmetullah',
    imageKey: 'selam'
  },
  {
    title: 'Selam (Sol)',
    desc: {
      male: 'Baş sola çevrilerek omuzlara bakılır ve "Esselamü aleyküm ve rahmetullah" denir.',
      female: 'Baş sola çevrilerek "Esselamü aleyküm ve rahmetullah" denir.'
    },
    arabic: 'Esselamü aleyküm ve rahmetullah',
    imageKey: 'selam2'
  },
];

const GENERIC_STEPS = SABAH_NAMAZI_STEPS_TEMPLATE;

const PRAYERS = [
  { id: 1, name: 'Sabah Namazı', arabicName: 'الفجر', rakats: '2 Sünnet, 2 Farz', sequence: SABAH_NAMAZI_STEPS_TEMPLATE },
  { id: 2, name: 'Öğle Namazı', arabicName: 'الظهر', rakats: '4 Sünnet, 4 Farz, 2 Son Sünnet', sequence: GENERIC_STEPS },
  { id: 3, name: 'İkindi Namazı', arabicName: 'العصر', rakats: '4 Sünnet, 4 Farz', sequence: GENERIC_STEPS },
  { id: 4, name: 'Akşam Namazı', arabicName: 'المغرب', rakats: '3 Farz, 2 Sünnet', sequence: GENERIC_STEPS },
  { id: 5, name: 'Yatsı Namazı', arabicName: 'العشاء', rakats: '4 Sünnet, 4 Farz, 3 Vitir', sequence: GENERIC_STEPS },
];

import ScreenHeader from '../components/ScreenHeader';

export default function NamazVisualScreen({ onClose }: { onClose?: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  // Cinsiyet Seçimi (Varsayılan: Erkek)
  const [selectedGender, setSelectedGender] = useState<Gender>('male');

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
    setCurrentSteps(steps); // Şablon adımları set et (imageKey içeriyor)
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

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePress = (evt: any) => {
    const { locationX } = evt.nativeEvent;
    // Ekranın sol %30'una tıklanırsa geri git, yoksa ileri git
    if (locationX < width * 0.3) {
      prevStep();
    } else {
      nextStep();
    }
  };

  // --- ANİMASYON TETİKLEYİCİSİ ---
  useEffect(() => {
    if (showSlideshow) {
      // Sadece modal ilk açıldığında animasyon yap
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showSlideshow]);

  // --- SLIDESHOW RENDER ---
  const renderSlideshow = () => {
    if (!showSlideshow || !currentSteps || currentSteps.length === 0) return null;
    const step = currentSteps[currentStepIndex];
    if (!step) return null;

    // Seçilen cinsiyete göre doğru görseli al
    const currentImage = NAMAZ_IMAGES[selectedGender][step.imageKey];

    return (
      <Modal visible={showSlideshow} animationType="fade" transparent={false} onRequestClose={() => setShowSlideshow(false)}>
        <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
          <StatusBar hidden={true} barStyle="light-content" />

          {/* Navigasyon Alanı (Tüm Ekran) */}
          <View style={{ flex: 1 }} onTouchEnd={handlePress}>
            {/* Safe Area View yerine manual padding kullanıyoruz çünkü Modal içinde SafeAreaView bazen tutarsız olabilir */}
            <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 40 : insets.top }}>

              {/* ÜST BAR (SABİT KONUM) */}
              <View style={[styles.slideHeader, { marginTop: 10 }]}>
                <View style={styles.headerControls}>
                  <Text style={styles.slideCounter}>{currentStepIndex + 1} / {currentSteps.length}</Text>

                  {/* Navigasyon İpucu - Ortaya taşındı */}
                  <Text style={[styles.tapHint, { fontSize: 12, marginTop: 0 }]}>
                    {`${currentStepIndex > 0 ? "< Sol: Geri  |  " : ""} Sağ: İleri >`}
                  </Text>

                  <CloseButton onPress={() => setShowSlideshow(false)} />
                </View>
              </View>

              {/* İÇERİK (SABİT KONUM) */}
              <View style={styles.slideContent}>
                <Text style={styles.slidePrayerName}>{currentPrayerName} ({selectedGender === 'male' ? 'Erkek' : 'Kadın'})</Text>

                {/* ANIMASYON YOK - SABİT CONTAINER */}
                <View style={styles.slideIconContainer}>
                  <View style={styles.imageFrame}>
                    <Image
                      source={currentImage}
                      style={styles.namazImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* METİN ALANI */}
                <View style={styles.textContainer}>
                  <Text style={styles.slideTitle}>{step.title}</Text>

                  {step.arabic && (
                    <Text style={styles.slideArabic}>"{step.arabic}"</Text>
                  )}

                  {/* HATA ÇÖZÜMÜ: Eski tanımlarda string kalmış olabilir veya Hot Reload sorunu olabilir */}
                  <Text style={styles.slideDesc}>
                    {typeof step.desc === 'string'
                      ? step.desc
                      : (step.desc[selectedGender] || '')}
                  </Text>
                </View>
              </View>

              {/* ALT: İPUCU - Kaldırıldı */}

            </View>
          </View>
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

          <View style={{ marginBottom: 20 }}>
            <ScreenHeader
              title="Namaz Hocası"
              leftIcon="close"
              onLeftPress={onClose}
              centerTitle
            />
          </View>

          {/* CİNSİYET SEÇİMİ TOGGLE */}
          <View style={styles.genderToggleContainer}>
            <TouchableOpacity
              style={[styles.genderButton, selectedGender === 'male' && styles.genderButtonActive]}
              onPress={() => setSelectedGender('male')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="face-man" size={24} color={selectedGender === 'male' ? '#0F2027' : '#D4AF37'} />
              <Text style={[styles.genderText, selectedGender === 'male' && styles.genderTextActive]}>Erkek</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.genderButton, selectedGender === 'female' && styles.genderButtonActive]}
              onPress={() => setSelectedGender('female')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="face-woman" size={24} color={selectedGender === 'female' ? '#0F2027' : '#D4AF37'} />
              <Text style={[styles.genderText, selectedGender === 'female' && styles.genderTextActive]}>Kadın</Text>
            </TouchableOpacity>
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
                    <Text style={styles.arabicText}>{prayer.arabicName}</Text>
                    <View style={styles.verticalDivider} />
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
                        <Text style={styles.practiceText}>
                          {selectedGender === 'male' ? 'Erkek' : 'Kadın'} İçin Göster
                        </Text>
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

          {/* NAMAZ BİLGİ KARTI */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color="#D4AF37" />
              <Text style={styles.infoTitle}>Namazın Önemi ve Fazileti</Text>
            </View>

            <Text style={styles.infoText}>
              Namaz (Salat), İslam'ın beş temel şartından ikincisidir ve "dinin direği" olarak kabul edilir.
              Müminin Rabbiyle sohbete durması, O'na olan şükran borcunu ödemesi ve kulluğunu izhar etmesidir.
            </Text>

            <View style={styles.separator} />

            <View style={styles.hadithContainer}>
              <MaterialCommunityIcons name="format-quote-open" size={20} color="rgba(212, 175, 55, 0.5)" style={{ marginRight: 5 }} />
              <Text style={styles.hadithText}>
                "Cennetin anahtarı namazdır, namazın anahtarı da abdesttir."
              </Text>
            </View>
            <Text style={styles.hadithSource}>(Tirmizî, Tahâret, 1)</Text>

            <View style={styles.separator} />

            <Text style={styles.infoText}>
              Namaz, insanı kötülüklerden alıkoyar, manevi arınma sağlar ve kişiye disiplin kazandırır.
              Miraç gecesinde, Peygamber Efendimize (s.a.v) ve ümmetine beş vakit olarak farz kılınmıştır.
            </Text>
          </View>

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

  // GENDER TOGGLE
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  genderButtonActive: {
    backgroundColor: '#D4AF37',
  },
  genderText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16
  },
  genderTextActive: {
    color: '#0F2027',
  },

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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    width: 80, // Sabit genişlik hizalama için
    justifyContent: 'flex-end',
  },
  arabicText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginRight: 10,
    textAlign: 'right'
  },
  verticalDivider: {
    width: 2,
    height: 30, // Yükseklik
    backgroundColor: '#D4AF37',
    opacity: 0.5,
    borderRadius: 1
  },
  prayerName: { color: '#fff', fontSize: 16, fontWeight: '600' },
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
  slideHeader: { padding: 20, paddingTop: 10 }, // Üstten biraz boşluk
  headerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slideCounter: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 'bold' },

  // --- GÜNCEL STYLE ---
  slideContent: {
    flex: 1,
    justifyContent: 'flex-start', // KESİN KONUM İÇİN sabitleme
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // BURASI KRİTİK: Sabah ile aynı hizada olması için sabit boşluk
  },
  slidePrayerName: { color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' },

  slideIconContainer: {
    width: 320,
    height: 380, // Sabit yükseklik
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Metinle arası
  },
  imageFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 20,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  namazImage: {
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
  // glowEffect style removed intentionally

  // Metin kapsayıcısı için sabit alan
  textContainer: {
    height: 280, // Daha detaylı açıklamalar için yükseklik artırıldı
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'flex-start'
  },
  slideTitle: { color: '#D4AF37', fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  slideArabic: { color: '#fff', fontSize: 18, fontStyle: 'italic', marginBottom: 10, textAlign: 'center', opacity: 0.9 },
  slideDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', lineHeight: 24 },

  slideFooter: { padding: 20, alignItems: 'center', marginBottom: 20 },
  tapHint: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },

  // --- BİLGİ KARTI STİLLERİ ---
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
  },
  infoTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
  },
  hadithContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  hadithText: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 24,
  },
  hadithSource: {
    color: '#D4AF37',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
    opacity: 0.8,
  }
});