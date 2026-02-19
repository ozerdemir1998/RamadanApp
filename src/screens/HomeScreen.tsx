// src/screens/HomeScreen.tsx
import { useNextPrayer } from '@/hooks/useNextPrayer';
import { getPrayerTimesByCity, getPrayerTimesByCoordinates, PrayerTimes } from '@/services/api';
import { getEsmaulHusna } from '@/services/esmaService';
import { registerForPushNotificationsAsync, schedulePrayerNotifications } from '@/services/notificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { rf, scale, verticalScale } from '../utils/responsive';

// --- İKONLARI PROJEDEN ÇEKME ---
const ICON_PATTERN = require('../../assets/icons/pattern.png');
const ICON_ESMA = require('../../assets/icons/esma.png');
const ICON_QUOTE = require('../../assets/icons/quote.png');


// --- STATİK VERİLER ---
const ESMA_LIST = [
  { name: "El-Rahmân", meaning: "Dünyada bütün mahlûkata merhamet eden." },
  { name: "El-Melik", meaning: "Mülkün, kâinatın gerçek sahibi." },
  { name: "El-Kuddûs", meaning: "Her türlü noksanlıktan uzak." },
  { name: "El-Selâm", meaning: "Esenlik veren, selamete çıkaran." },
  { name: "El-Mü'min", meaning: "Güven veren, koruyan." }
];

const QUOTE_LIST = [
  { text: "Kusur görenindir.", author: "Hz. Mevlana" },
  { text: "Yaratılanı hoş gör, Yaratan'dan ötürü.", author: "Yunus Emre" },
  { text: "Edep, aklın tercümanıdır.", author: "Hz. Ali (r.a.)" },
  { text: "İncinsen de incitme.", author: "Hacı Bektaş-ı Veli" }
];

// --- ANİMASYONLU SATIR BİLEŞENİ ---
const AnimatedInfoRow = ({
  iconSource,
  label,
  mainText,
  subText,
  isQuote = false,
  scrollY
}: {
  iconSource: any,
  label: string,
  mainText: string,
  subText: string,
  isQuote?: boolean,
  scrollY: number
}) => {
  const [elementY, setElementY] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animasyon Değerleri
  const lineScale = useRef(new Animated.Value(0)).current;
  const topSlideAndOpacity = useRef(new Animated.Value(0)).current;
  const bottomSlideAndOpacity = useRef(new Animated.Value(0)).current;

  // Görünürlük Kontrolü
  useEffect(() => {
    if (!hasAnimated && elementY > 0) {
      triggerAnimation();
    }
  }, [elementY]);

  const triggerAnimation = () => {
    setHasAnimated(true);
    Animated.sequence([
      Animated.timing(lineScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.parallel([
        Animated.timing(topSlideAndOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(0.8))
        }),
        Animated.timing(bottomSlideAndOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(0.8))
        })
      ])
    ]).start();
  };

  const topTranslateY = topSlideAndOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0]
  });

  const bottomTranslateY = bottomSlideAndOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0]
  });

  return (
    <View
      style={styles.infoCard}
      onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        setElementY(layout.y);
      }}
    >
      {/* ÜST İÇERİK MASKESİ */}
      <View style={{ overflow: 'hidden', alignItems: 'center', width: '100%', paddingBottom: verticalScale(5) }}>
        <Animated.View style={{
          opacity: topSlideAndOpacity,
          transform: [{ translateY: topTranslateY }],
          alignItems: 'center',
          width: '100%'
        }}>
          <Image
            source={iconSource}
            style={{
              width: isQuote ? scale(50) : scale(60),
              height: isQuote ? scale(50) : scale(60),
              tintColor: '#D4AF37',
              marginBottom: verticalScale(8)
            }}
            resizeMode="contain"
          />
          <Text style={styles.label}>{label}</Text>
        </Animated.View>
      </View>

      {/* ÇİZGİ */}
      <Animated.View style={[styles.horizontalDivider, { transform: [{ scaleX: lineScale }] }]} />

      {/* ALT İÇERİK MASKESİ */}
      <View style={{ overflow: 'hidden', alignItems: 'center', width: '100%', paddingTop: verticalScale(5) }}>
        <Animated.View style={{
          opacity: bottomSlideAndOpacity,
          transform: [{ translateY: bottomTranslateY }],
          alignItems: 'center',
          width: '100%'
        }}>
          <Text style={[styles.mainText, isQuote && { fontSize: rf(20), fontStyle: 'italic', paddingHorizontal: scale(10) }]}>
            {isQuote ? `"${mainText}"` : mainText}
          </Text>

          <Text style={styles.subText}>{isQuote ? `— ${subText}` : subText}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('Konum Bulunuyor...');
  const [refreshing, setRefreshing] = useState(false);

  // Scroll Takibi State'i
  const [scrollY, setScrollY] = useState(0);

  const [dailyEsma, setDailyEsma] = useState(ESMA_LIST[0]);
  const [dailyQuote, setDailyQuote] = useState(QUOTE_LIST[0]);

  const { timeLeft, nextPrayerName, isIftar } = useNextPrayer(times);
  const todayDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // GÜVENLİ ALANLARI AL
  const insets = useSafeAreaInsets();

  useEffect(() => {
    registerForPushNotificationsAsync();
    getUserLocationAndFetchTimes();
    loadDailyEsma();
    loadDailyQuote();
  }, []);

  // Günün tarihini anahtar olarak kullan
  const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const loadDailyEsma = async () => {
    try {
      const todayKey = getTodayKey();
      const cacheKey = `@daily_esma_${todayKey}`;

      // Önce cache'e bak
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setDailyEsma(JSON.parse(cached));
        return;
      }

      // Cache yoksa Firebase'den çek ve günlük seçim yap
      const allEsmas = await getEsmaulHusna();
      if (allEsmas && allEsmas.length > 0) {
        // Tarihe göre deterministik seçim
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const selectedEsma = allEsmas[dayOfYear % allEsmas.length];
        setDailyEsma(selectedEsma);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(selectedEsma));
      }
    } catch (e) {
      console.log("Error loading daily esma", e);
    }
  };

  const loadDailyQuote = async () => {
    try {
      const todayKey = getTodayKey();
      const cacheKey = `@daily_quote_${todayKey}`;

      // Önce cache'e bak
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setDailyQuote(JSON.parse(cached));
        return;
      }

      // Tarihe göre deterministik seçim
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const selectedQuote = QUOTE_LIST[dayOfYear % QUOTE_LIST.length];
      setDailyQuote(selectedQuote);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(selectedQuote));
    } catch (e) {
      console.log("Error loading daily quote", e);
    }
  };

  const getUserLocationAndFetchTimes = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        fetchFallbackData();
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const data = await getPrayerTimesByCoordinates(latitude, longitude);

      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address && address.length > 0) {
        setLocationName(address[0].subregion || address[0].city || 'Konumunuz');
      }
      setTimes(data);
      setLoading(false);
      if (data) await schedulePrayerNotifications(data);
    } catch (error) {
      fetchFallbackData();
    }
  };

  const fetchFallbackData = async () => {
    setLocationName('İstanbul');
    const data = await getPrayerTimesByCity('Istanbul', 'Turkey');
    setTimes(data);
    setLoading(false);
    if (data) await schedulePrayerNotifications(data);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getUserLocationAndFetchTimes().then(() => setRefreshing(false));
  }, []);

  const handleScroll = (event: any) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const getPrayerIcon = (vakit: string) => {
    switch (vakit) {
      case 'İmsak': return 'weather-sunset-up';
      case 'Güneş': return 'weather-sunny';
      case 'Öğle': return 'weather-sunny';
      case 'İkindi': return 'weather-partly-cloudy';
      case 'Akşam': return 'weather-sunset-down';
      case 'Yatsı': return 'weather-night';
      default: return 'mosque';
    }
  };

  const currentPrayerTitle = (!times) ? "Hoşgeldiniz" :
    (nextPrayerName === 'İmsak' ? 'Yatsı' :
      nextPrayerName === 'Güneş' ? 'İmsak' :
        nextPrayerName === 'Öğle' ? 'Güneş' :
          nextPrayerName === 'İkindi' ? 'Öğle' :
            nextPrayerName === 'Akşam' ? 'İkindi' :
              nextPrayerName === 'Yatsı' ? 'Akşam' : nextPrayerName);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

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
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name={getPrayerIcon(currentPrayerTitle) as any}
                size={rf(40)}
                color="#D4AF37"
                style={{ marginRight: scale(12), marginTop: verticalScale(3) }}
              />
              <Text style={styles.headerTitle}>{currentPrayerTitle}</Text>
            </View>
            <Text style={styles.headerSubtitle}>{locationName}, {todayDate}</Text>
          </View>

          {/* SAYAÇ */}
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{timeLeft}</Text>
            <Text style={styles.nextPrayerInfo}>
              {isIftar ? 'İftara Kalan Süre' : `${nextPrayerName} Vaktine Kalan`}
            </Text>
          </View>

          <View style={{ height: verticalScale(30) }} />

          {/* --- ANİMASYONLU GÜNÜN ESMASI --- */}
          <AnimatedInfoRow
            iconSource={ICON_ESMA}
            label="Günün Esması"
            mainText={dailyEsma.name}
            subText={dailyEsma.meaning}
            scrollY={scrollY}
          />

          <View style={{ height: verticalScale(25) }} />

          {/* VAKİT LİSTESİ */}
          {times && (
            <View style={styles.prayerListContainer}>
              <PrayerItem time={times.Fajr} name="İmsak" active={nextPrayerName === 'Güneş'} icon="weather-sunset-up" />
              <PrayerItem time={times.Sunrise} name="Güneş" active={nextPrayerName === 'Öğle'} icon="weather-sunny" />
              <PrayerItem time={times.Dhuhr} name="Öğle" active={nextPrayerName === 'İkindi'} icon="weather-sunny" />
              <PrayerItem time={times.Asr} name="İkindi" active={nextPrayerName === 'Akşam'} icon="weather-partly-cloudy" />
              <PrayerItem time={times.Sunset} name="Akşam" active={nextPrayerName === 'Yatsı'} icon="weather-sunset-down" />
              <PrayerItem time={times.Isha} name="Yatsı" active={nextPrayerName === 'İmsak'} icon="weather-night" />
            </View>
          )}

          <View style={{ height: verticalScale(25) }} />

          {/* --- ANİMASYONLU GÜNÜN SÖZÜ --- */}
          <AnimatedInfoRow
            iconSource={ICON_QUOTE}
            label="Günün Sözü"
            mainText={dailyQuote.text}
            subText={dailyQuote.author}
            isQuote={true}
            scrollY={scrollY}
          />

          {/* DİNAMİK ALT BOŞLUK */}
          <View style={{ height: 85 + insets.bottom }} />

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- PRAYER ITEM ---
const PrayerItem = ({ time, name, active, icon }: { time: string, name: string, active: boolean, icon: string }) => (
  <View style={styles.prayerRow}>
    <Text style={[styles.prayerTime, active && styles.activeText]}>{time}</Text>
    <Text style={[styles.prayerName, active && styles.activeText]}>{name}</Text>
    <MaterialCommunityIcons
      name={icon as any}
      size={active ? rf(24) : rf(20)}
      color={active ? "#FFD700" : "rgba(255,255,255,0.3)"}
      style={active ? styles.glowingIcon : {}}
    />
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
  container: { padding: scale(20), alignItems: 'center' },

  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: scale(300), height: scale(300), opacity: 0.07, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  headerContainer: { alignItems: 'center', marginTop: verticalScale(10), marginBottom: verticalScale(15), position: 'relative' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: verticalScale(6) },
  headerTitle: { fontSize: rf(42), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37', letterSpacing: 1, textAlign: 'center' },
  headerSubtitle: { color: 'rgba(212, 175, 55, 0.7)', fontSize: rf(14), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', letterSpacing: 1, marginTop: verticalScale(3) },

  // SAYAÇ - Normal font, scaleY kaldırıldı
  countdownContainer: { alignItems: 'center', marginBottom: verticalScale(5), marginTop: verticalScale(5) },
  countdownText: {
    fontSize: rf(48),
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: scale(4),
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    // scaleY kaldırıldı - normal font
  },
  nextPrayerInfo: { color: 'rgba(255,255,255,0.6)', fontSize: rf(14), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginTop: verticalScale(5), letterSpacing: 1.5 },

  // ANİMASYONLU KART STİLLERİ
  infoCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20)
  },

  horizontalDivider: { width: scale(60), height: 2, backgroundColor: '#D4AF37', opacity: 0.5, marginVertical: verticalScale(10), borderRadius: 1 },

  label: { color: '#D4AF37', fontSize: rf(13), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: verticalScale(6), opacity: 0.9, textAlign: 'center' },
  mainText: { color: '#fff', fontSize: rf(24), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: verticalScale(6), textAlign: 'center', lineHeight: rf(32) },
  subText: { color: 'rgba(255,255,255,0.7)', fontSize: rf(14), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: rf(22), textAlign: 'center' },

  // LİSTE
  prayerListContainer: { width: '100%', marginTop: verticalScale(15), marginBottom: verticalScale(15), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: verticalScale(14), paddingHorizontal: scale(20), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  activeText: { color: '#D4AF37', fontWeight: 'bold', fontSize: rf(18) },
  prayerTime: { color: '#fff', fontSize: rf(16), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', width: scale(80) },
  prayerName: { color: 'rgba(255,255,255,0.8)', fontSize: rf(16), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', flex: 1, textAlign: 'center' },

  // İKON BLUR
  glowingIcon: {
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    opacity: 1
  }
});