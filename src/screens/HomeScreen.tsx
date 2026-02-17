// src/screens/HomeScreen.tsx
import { useNextPrayer } from '@/hooks/useNextPrayer';
import { getPrayerTimesByCity, getPrayerTimesByCoordinates, PrayerTimes } from '@/services/api';
import { getEsmaulHusna } from '@/services/esmaService';
import { registerForPushNotificationsAsync, schedulePrayerNotifications } from '@/services/notificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Küçük ekran kontrolü (örn. iPhone SE veya eski Androidler)
const IS_SMALL_DEVICE = SCREEN_HEIGHT < 700;

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
    // "Uygulama ilk açıldığında" dediği için hemen başlatıyoruz, 
    // ama yine de layout hesaplandıktan sonra (elementY > 0) tetiklenmesi sağlıklı.
    if (!hasAnimated && elementY > 0) {
      triggerAnimation();
    }
  }, [elementY]);

  const triggerAnimation = () => {
    setHasAnimated(true);
    Animated.sequence([
      // 1. Çizgi Açılacak (0 -> 1)
      Animated.timing(lineScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      // 2. İçerikler Çıkacak (Paralel)
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

  // Interpolasyonlar
  // Üst kısım: Aşağıdan yukarıya çıkacak (Maskenin altından) 
  const topTranslateY = topSlideAndOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0]
  });

  // Alt kısım: Yukarıdan aşağıya inecek (Maskenin üstünden)
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
      <View style={{ overflow: 'hidden', alignItems: 'center', width: '100%', paddingBottom: 5 }}>
        <Animated.View style={{
          opacity: topSlideAndOpacity,
          transform: [{ translateY: topTranslateY }],
          alignItems: 'center',
          width: '100%'
        }}>
          <Image
            source={iconSource}
            style={{
              width: isQuote ? 70 : 90,
              height: isQuote ? 70 : 90,
              tintColor: '#D4AF37',
              marginBottom: 10
            }}
            resizeMode="contain"
          />
          <Text style={styles.label}>{label}</Text>
        </Animated.View>
      </View>

      {/* ÇİZGİ */}
      <Animated.View style={[styles.horizontalDivider, { transform: [{ scaleX: lineScale }] }]} />

      {/* ALT İÇERİK MASKESİ */}
      <View style={{ overflow: 'hidden', alignItems: 'center', width: '100%', paddingTop: 5 }}>
        <Animated.View style={{
          opacity: bottomSlideAndOpacity,
          transform: [{ translateY: bottomTranslateY }],
          alignItems: 'center',
          width: '100%'
        }}>
          <Text style={[styles.mainText, isQuote && { fontSize: IS_SMALL_DEVICE ? 20 : 24, fontStyle: 'italic', paddingHorizontal: 10 }]}>
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

  // GÜVENLİ ALANLARI AL (EKLENDİ)
  const insets = useSafeAreaInsets();

  useEffect(() => {
    registerForPushNotificationsAsync();
    getUserLocationAndFetchTimes();
    loadRandomEsma();
    setDailyQuote(QUOTE_LIST[Math.floor(Math.random() * QUOTE_LIST.length)]);
  }, []);

  const loadRandomEsma = async () => {
    try {
      const allEsmas = await getEsmaulHusna();
      if (allEsmas && allEsmas.length > 0) {
        const randomEsma = allEsmas[Math.floor(Math.random() * allEsmas.length)];
        setDailyEsma(randomEsma);
      }
    } catch (e) {
      console.log("Error loading random esma", e);
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
    loadRandomEsma();
    setDailyQuote(QUOTE_LIST[Math.floor(Math.random() * QUOTE_LIST.length)]);
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
                size={IS_SMALL_DEVICE ? 56 : 72}
                color="#D4AF37"
                style={{ marginRight: 20, marginTop: 5 }}
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

          <View style={{ height: 50 }} />

          {/* --- ANİMASYONLU GÜNÜN ESMASI --- */}
          <AnimatedInfoRow
            iconSource={ICON_ESMA}
            label="Günün Esması"
            mainText={dailyEsma.name}
            subText={dailyEsma.meaning}
            scrollY={scrollY}
          />

          <View style={{ height: 40 }} />

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

          <View style={{ height: 40 }} />

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
      size={active ? 34 : 28}
      color={active ? "#FFD700" : "rgba(255,255,255,0.3)"}
      style={active ? styles.glowingIcon : {}}
    />
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
  container: { padding: 20, alignItems: 'center' },

  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.07, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  headerContainer: { alignItems: 'center', marginTop: IS_SMALL_DEVICE ? 15 : 30, marginBottom: IS_SMALL_DEVICE ? 30 : 50, position: 'relative' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  headerTitle: { fontSize: IS_SMALL_DEVICE ? 56 : 72, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37', letterSpacing: 1, lineHeight: IS_SMALL_DEVICE ? 60 : 80, textAlign: 'center' },
  headerSubtitle: { color: 'rgba(212, 175, 55, 0.7)', fontSize: 18, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', letterSpacing: 1, marginTop: 5 },

  // SAYAÇ - DAHA KLASİK VE UZUNLAMASINA TİP
  countdownContainer: { alignItems: 'center', marginBottom: 10, marginTop: 10 },
  countdownText: {
    fontSize: IS_SMALL_DEVICE ? 64 : 82,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', // En klasik font
    fontWeight: 'bold',
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    width: '100%',
    transform: [{ scaleY: 1.3 }], // Uzun görünüm
    paddingVertical: 10
  },
  nextPrayerInfo: { color: 'rgba(255,255,255,0.6)', fontSize: 17, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginTop: 5, letterSpacing: 1.5 },

  // ANİMASYONLU KART STİLLERİ (YENİ - MERKEZİ)
  infoCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },

  horizontalDivider: { width: 60, height: 2, backgroundColor: '#D4AF37', opacity: 0.5, marginVertical: 12, borderRadius: 1 },

  label: { color: '#D4AF37', fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 8, opacity: 0.9, textAlign: 'center' },
  mainText: { color: '#fff', fontSize: IS_SMALL_DEVICE ? 26 : 30, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 8, textAlign: 'center', lineHeight: 36 },
  subText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 24, textAlign: 'center' },

  // LİSTE
  prayerListContainer: { width: '100%', marginTop: 25, marginBottom: 25, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: IS_SMALL_DEVICE ? 18 : 22, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  activeText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 24 },
  prayerTime: { color: '#fff', fontSize: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', width: 100 },
  prayerName: { color: 'rgba(255,255,255,0.8)', fontSize: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', flex: 1, textAlign: 'center' },

  // İKON BLUR YUMUŞATILDI
  glowingIcon: {
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20, // Yumuşatıldı
    opacity: 1
  }
});