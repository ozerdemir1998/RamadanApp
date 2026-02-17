import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { DailyStory, fetchDailyContent } from '../services/contentService';

const { width } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/ramadan.png');

// --- YEMEK KATEGORİLERİ ---
const CATEGORIES = [
  { id: 'sahurluk', title: 'Sahur', icon: 'weather-sunset-up' },
  { id: 'corbalar', title: 'Çorbalar', icon: 'pot-steam' },
  { id: 'ana_yemek', title: 'Et Yemekleri', icon: 'food-steak' },
  { id: 'tavuk_yemekleri', title: 'Tavuk', icon: 'food-drumstick' },
  { id: 'ara_sicak', title: 'Ara Sıcak', icon: 'food-croissant' },
  { id: 'sebze', title: 'Sebze', icon: 'carrot' },
  { id: 'salata', title: 'Salata', icon: 'leaf' },
  { id: 'karbonhidrat', title: 'Karbonhidratlar', icon: 'noodles' },
  { id: 'tatlilar', title: 'Tatlılar', icon: 'cupcake' },
];



export default function LifeScreen() {
  // Force Reload Identifier: 2
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- DATA STATE ---
  const [dailyContent, setDailyContent] = useState<DailyStory[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DATE TRACKING FOR AUTO-REFRESH ---
  const appState = useRef(AppState.currentState);
  const [lastFetchDate, setLastFetchDate] = useState(new Date().toDateString());

  useEffect(() => {
    loadContent(); // İlk açılışta yükle

    // 1. AppState Listener (Uygulama arka plandan dönerse)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const now = new Date();
        if (now.toDateString() !== lastFetchDate) {
          console.log("📅 Yeni gün algılandı (Foreground), içerik yenileniyor...");
          loadContent();
        }
      }
      appState.current = nextAppState;
    });

    // 2. Midnight Timer (Uygulama açıkken gece yarısı olursa)
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeToMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      console.log("🌙 Gece yarısı oldu, içerik yenileniyor...");
      loadContent();
    }, timeToMidnight + 1000); // 1 saniye opsiyonel gecikme

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [lastFetchDate]);

  const loadContent = async () => {
    try {
      const data = await fetchDailyContent();
      setDailyContent(data);
      setLastFetchDate(new Date().toDateString());
    } catch (e) {
      console.error("Content Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Ayet ve Hadis Verisini Bul
  const ayet = dailyContent.find(i => i.type === 'ayet');
  const hadis = dailyContent.find(i => i.type === 'hadis');

  // Medya Oynatıcıya Git
  const openMedia = (type: string) => {
    router.push({ pathname: '/media-player', params: { type } });
  };

  // Yemek Listesine Git
  const openRecipes = (catId: string) => {
    router.push({ pathname: '/recipes', params: { catId } });
  };

  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      style={{ flex: 1 }}
    >
      <View style={styles.backgroundPatternContainer} pointerEvents="none">
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <ScreenHeader title="Ramazan Rehberi" leftIcon="none" />

          {/* --- 1. MANEVİYAT KARTLARI (PREMIUM TASARIM) --- */}
          <View style={styles.sectionContainer}>

            {/* Günün Ayeti */}
            <TouchableOpacity
              style={[styles.spiritualCard, { height: 110 }]}
              activeOpacity={0.9}
              onPress={() => openMedia('ayet')}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.03)']}
                style={styles.spiritualGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={[styles.cardContent, { zIndex: 2 }]}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#D4AF37" />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.cardTitle}>Günün Ayeti</Text>
                    <Text style={styles.cardSubtitle}>
                      {(!ayet?.subTitle || /[\u0600-\u06FF]/.test(ayet.subTitle)) ? "Yükleniyor..." : ayet.subTitle}
                    </Text>
                  </View>
                  <View style={[styles.arrowContainer, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                    <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
                  </View>
                </View>
                {/* Altın Çerçeve Efekti */}
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 16
                }} />
                {/* Arka Plan Süsleme İkonu */}
                <MaterialCommunityIcons name="book-open-variant" size={120} color="rgba(212, 175, 55, 0.05)" style={styles.bgIcon} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Günün Hadisi ve Yemek Duası (Yan Yana) */}
            <View style={styles.rowContainer}>
              {/* Günün Hadisi */}
              <TouchableOpacity
                style={[styles.spiritualCard, styles.halfCard]}
                activeOpacity={0.9}
                onPress={() => openMedia('hadis')}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.03)']}
                  style={styles.spiritualGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={require('../../assets/icons/book.png')}
                    style={{ width: 26, height: 26, tintColor: '#D4AF37', marginBottom: 10, opacity: 0.9 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitleSmall}>Günün Hadisi</Text>
                  <Text style={[styles.cardSubtitleSmall, { color: 'rgba(255,255,255,0.7)' }]}>Hz. Muhammed (S.A.V)</Text>

                  {/* Altın Çerçeve Efekti (Opsiyonel, uyum için eklenebilir ama alan dar) */}
                  <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16
                  }} />

                  <MaterialCommunityIcons name="format-quote-close" size={60} color="rgba(212, 175, 55, 0.05)" style={styles.bgIconRight} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Yemek Duası */}
              <TouchableOpacity
                style={[styles.spiritualCard, styles.halfCard]}
                activeOpacity={0.9}
                onPress={() => openMedia('dua')}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.03)']}
                  style={styles.spiritualGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={require('../../assets/icons/pray.png')}
                    style={{ width: 30, height: 30, tintColor: '#D4AF37', marginBottom: 10, opacity: 0.9 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardTitleSmall}>Yemek Duası</Text>
                  <Text style={[styles.cardSubtitleSmall, { color: 'rgba(255,255,255,0.8)' }]}>İftar & Sahur</Text>

                  {/* Altın Çerçeve Efekti */}
                  <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16
                  }} />

                  <MaterialCommunityIcons name="food-apple" size={60} color="rgba(212, 175, 55, 0.05)" style={styles.bgIconRight} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>

          <View style={{ height: 25 }} />

          {/* --- ÖZEL GÜNLER KARTLARI (KADİR GECESİ & BAYRAM NAMAZI) --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ramazan Bilgileri</Text>
          </View>
          <View style={styles.sectionContainer}>
            {/* Kadir Gecesi Kartı */}
            <TouchableOpacity
              style={styles.spiritualCard}
              activeOpacity={0.9}
              onPress={() => router.push('/special/kadir-gecesi')}
            >
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.05)']}
                style={[styles.spiritualGradient, { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }]}
              >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
                  <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#D4AF37" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: '#FFD700' }]}>Kadir Gecesi</Text>
                  <Text style={[styles.cardSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>Yapılacaklar, Dualar ve Fazileti</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Bayram Namazı Kartı */}
            <TouchableOpacity
              style={styles.spiritualCard}
              activeOpacity={0.9}
              onPress={() => router.push('/special/bayram-namazi')}
            >
              <LinearGradient
                colors={['rgba(32, 58, 67, 0.25)', 'rgba(44, 83, 100, 0.25)']}
                style={[styles.spiritualGradient, { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }]}
              >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <MaterialCommunityIcons name="mosque" size={24} color="#A0E6FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: '#A0E6FF' }]}>Bayram Namazı</Text>
                  <Text style={[styles.cardSubtitle, { color: 'rgba(200, 240, 255, 0.9)' }]}>Kılınışı ve Anlamı</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Namaz Sureleri Kartı */}
            <TouchableOpacity
              style={styles.spiritualCard}
              activeOpacity={0.9}
              onPress={() => router.push('/namaz-sureleri')}
            >
              <LinearGradient
                colors={['rgba(39, 174, 96, 0.2)', 'rgba(22, 160, 133, 0.2)']}
                style={[styles.spiritualGradient, { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }]}
              >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Image
                    source={require('../../assets/icons/quran.png')}
                    style={{ width: 24, height: 24, tintColor: '#2ECC71' }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: '#2ECC71' }]}>Namaz Sureleri</Text>
                  <Text style={[styles.cardSubtitle, { color: 'rgba(150, 255, 180, 0.9)' }]}>Sübhaneke, Fatiha ve Kısa Sureler</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.spiritualCard}
              activeOpacity={0.9}
              onPress={() => router.push('/nafile-list')}
            >
              <LinearGradient
                colors={['rgba(100, 50, 200, 0.2)', 'rgba(60, 30, 120, 0.2)']}
                style={[styles.spiritualGradient, { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }]}
              >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Image
                    source={require('../../assets/icons/prayer.png')}
                    style={{ width: 24, height: 24, tintColor: '#E0B0FF' }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: '#E0B0FF' }]}>Nafile Namazlar</Text>
                  <Text style={[styles.cardSubtitle, { color: 'rgba(240, 210, 255, 0.9)' }]}>Teheccüd, Evvabin, Tesbih...</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />

          {/* --- 2. YEMEK KATEGORİLERİ (KARTLAR / GRID) --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İftar & Sahur Menüleri</Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => openRecipes(cat.id)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                  style={styles.categoryGradient}
                >
                  <View style={styles.catIconBox}>
                    <MaterialCommunityIcons name={cat.icon as any} size={28} color="#D4AF37" />
                  </View>
                  <Text style={styles.catTitle}>{cat.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>



          <View style={{ height: 85 + insets.bottom }} />

        </ScrollView>
      </SafeAreaView>



    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.1, tintColor: '#D4AF37', resizeMode: 'contain' },

  sectionContainer: { marginBottom: 30, paddingHorizontal: 20 },

  // --- SPIRITUAL CARDS ---
  spiritualCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4
  },
  spiritualGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative' // bgIcon için
  },

  // Large Card Content
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  textContent: { flex: 1 },
  cardTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  cardSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  arrowContainer: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 10
  },

  // Background Icon Watermark
  bgIcon: { position: 'absolute', right: -20, bottom: -20, opacity: 0.1 },
  bgIconRight: { position: 'absolute', right: -10, bottom: -10, opacity: 0.1 },

  // Row / Half Cards
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { width: (width - 50) / 2, height: 130, marginBottom: 0 },

  cardTitleSmall: { color: '#FFF', fontSize: 16, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  cardSubtitleSmall: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  // --- KATEGORİ GRID ---
  sectionHeader: { paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  categoryCard: {
    width: (width - 55) / 2, // 2 sütun, ortadaki boşluk (15) ve paddingler (40) hesaplandı
    aspectRatio: 1.1, // Kareye yakın
    marginBottom: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  catIconBox: {
    marginBottom: 10,
    width: 50, height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  catTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },




});