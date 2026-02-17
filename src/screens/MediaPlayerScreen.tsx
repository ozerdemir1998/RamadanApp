import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { DailyStory, fetchDailyContent } from '../services/contentService'; // EKLENDİ

const ICON_PATTERN = require('../../assets/icons/ramadan.png');

// --- YEREL SES DOSYALARI ---
const LOCAL_AUDIO = {
  dua_tr: require('../../assets/audio/yemek_duasi_tr.mp3'),
  dua_ar: require('../../assets/audio/yemek_duasi_ar.mp3'),
};

// --- AYARLAR ---
const RECITER_ID = 7; // Mishary Rashid Alafasy

export default function MediaPlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const contentType = (params.type as 'ayet' | 'hadis' | 'dua') || 'ayet';

  // --- PLAYER STATE ---
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<'TR' | 'AR'>('TR');

  // --- YÜKLEME DURUMLARI ---
  const [loading, setLoading] = useState(true); // Genel sayfa yüklemesi
  const [textLoading, setTextLoading] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [audioBuffering, setAudioBuffering] = useState(false);

  // --- OYNATMA SÜRELERİ ---
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- VERİLER ---
  const [data, setData] = useState<DailyStory | null>(null);
  const [audioSource, setAudioSource] = useState<any>(null);

  const [textContent, setTextContent] = useState({
    tr: "",
    ar: ""
  });

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    loadData();
  }, []);

  // Verileri Yükle
  const loadData = async () => {
    setLoading(true);
    try {
      if (contentType === 'dua') {
        // DUA İÇİN SABİT VERİ
        const duaData: DailyStory = {
          id: 'dua',
          type: 'dua',
          title: 'Yemek Duası',
          subTitle: 'İftar Sofrası İçin',
          content: '"Bizi yediren, içiren ve müslümanlardan kılan Allah’a hamdolsun. Allah’ım! Yemek sâhibini, yiyenleri, sofrraya emeği geçenleri, bütün mü’min erkek ve kadınları mağfiret et ve onlara rahmet eyle! Allah’ım! Kalblerimizi muhabbetinin ve zikrinin nurlârıyla nurlandır, ey celâl ve ikrâm sâhibi Allah’ım! Allah’ım! Din husûsunda, dünyada ve âhirrette sıhhat, selâmet ve âfiyet üzere güzel bir hayât yaşamayı lutfeyle! Şüphesiz Sen her şeye kâdirsin. Allah’ım! Sen’den nîmetin tamâmını (İsllâm üzere ölüp cennete girmeyi), âfiyetin devvâmını ve hüsn-i hâtime ile (güzel bir hâl üzerre) vefât etmeyi isteriz. Allah’ım! Nebiyy-i Ekrem -sallallahu aleyhhi ve sellem- ve Fâtiha-i Şerîfe hürmetine nîmmetlerini artır, noksanlaştırma!"',
          contentAR: 'وَالْمُؤْمِنَاتِ. اَللّٰهُمَّ نَوِّرْ قُلُوبَنَا بِاَنْوَارِ مَحَبَّتِكَ وَذِكْرِكَ يَا ذَا الْجَلَالِ وَالْاِكْرَامِ. اَللّٰهُمَّ اَحْيِنَا حَيَاةً طَيِّبَةً بِالصِّحَّةِ وَالسَّلَامَةِ وَالْعَافِيَةِ فِى الدّٖينِ وَالدُّنْيَا وَالْاٰخِرَةِ اِنَّكَ عَلٰى كُلِّ شَىْءٍ قَدٖيرٌ. اَللّٰهُمَّ اِنَّا نَسْأَلُكَ تَمَامَ النِّعْمَةِ وَدَوَامَ الْعَافِيَةِ وَحُسْنَ الْخَاتِمَةِ. اَللّٰهُمَّ زِدْ وَلَا تَنْقُصْ بِحُرْمَةِ النَّبِیِّ صَلَّی اللّٰهُ عَلَيْهِ وَسَلَّمَ وَبِحُرْمَةِ الْفَاتِحَةِ',
        };
        setData(duaData);
        setTextContent({ tr: duaData.content, ar: duaData.contentAR || "" });
        setAudioSource(LOCAL_AUDIO.dua_tr);
        setAudioReady(true);
        setTextLoading(false);

      } else {
        // --- CUSTOM VERSE CHECK (YENİ) ---
        if (params.surah && params.ayah) {
          const customData: DailyStory = {
            id: `custom-${params.surah}-${params.ayah}`,
            type: 'ayet',
            title: (params.title as string) || 'Özel Ayet',
            subTitle: (params.subTitle as string) || `${params.surah}. Sure, ${params.ayah}. Ayet`,
            content: (params.content as string) || '...',
            contentAR: (params.contentAR as string) || '',
            surah: Number(params.surah),
            ayah: Number(params.ayah)
          };

          setData(customData);
          setTextContent({ tr: customData.content, ar: customData.contentAR || "" });
          // Fetch audio for this specific verse
          initializeAyetData(Number(params.surah), Number(params.ayah), customData.contentAR);
          return;
        }

        // AYET VE HADİS İÇİN FIREBASE (Mevcut Mantık)
        const stories = await fetchDailyContent();
        const currentStory = stories.find(s => s.type === contentType);

        if (currentStory) {
          setData(currentStory);
          setTextContent({ tr: currentStory.content, ar: currentStory.contentAR || "" });

          if (currentStory.type === 'ayet' && currentStory.surah && currentStory.ayah) {
            // Ayet ise API'den ses ve gerekirse Arapça metin çek
            initializeAyetData(currentStory.surah, currentStory.ayah, currentStory.contentAR);
          } else {
            // Hadis ise ses yok
            setTextLoading(false);
          }
        } else {
          // Hata Durumu (Fallback zaten serviste var ama yine de boş gelirse)
          alert("İçerik yüklenemedi.");
        }
      }
    } catch (e) {
      console.error("Yükleme Hatası:", e);
    } finally {
      setLoading(false);
    }
  };


  // --- TEMİZLİK (CLEANUP) ---
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync().then(() => {
          sound.unloadAsync();
        });
      }
    };
  }, []);

  // Dil değiştiğinde çalışır
  useEffect(() => {
    // Dil değişince sesi sıfırla (eğer varsa)
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const resetPlayer = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    setSound(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setAudioBuffering(false);
  };

  // --- AYET İÇİN API VERİ YÜKLEME ---
  const initializeAyetData = async (surah: number, ayah: number, existingAR?: string) => {
    const ayahKey = `${surah}:${ayah}`;

    // Eğer Firebase'de Arapça metin yoksa API'den çek
    if (!existingAR) {
      try {
        const textRes = await fetch(`https://api.quran.com/api/v4/verses/by_key/${ayahKey}?fields=text_uthmani`);
        const textJson = await textRes.json();
        if (textJson.verse) {
          const arText = textJson.verse.text_uthmani;
          setTextContent(prev => ({ ...prev, ar: arText }));
        }
      } catch (e) {
        console.error("Metin Hatası:", e);
      }
    }
    setTextLoading(false);

    // Ses (Sadece Ayet için)
    try {
      const audioRes = await fetch(`https://api.quran.com/api/v4/recitations/${RECITER_ID}/by_ayah/${ayahKey}`);
      const audioJson = await audioRes.json();
      if (audioJson.audio_files && audioJson.audio_files[0]) {
        const file = audioJson.audio_files[0];
        setAudioSource(`https://audio.qurancdn.com/${file.url}`);
        setAudioReady(true);
      }
    } catch (e) {
      console.error("Ses Hatası:", e);
    }
  };

  // --- SES OYNATMA ---
  const playSound = async () => {
    if (!audioSource) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        setAudioBuffering(true);

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const sourceObj = typeof audioSource === 'string' ? { uri: audioSource } : audioSource;

        const { sound: newSound } = await Audio.Sound.createAsync(
          sourceObj,
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        setSound(newSound);
        setIsPlaying(true);
        setAudioBuffering(false);
      }
    } catch (error) {
      console.error("Play Error:", error);
      setAudioBuffering(false);
      alert("Ses oynatılamadı.");
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        if (sound) sound.setPositionAsync(0);
      }
    }
  };

  const onSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const formatTime = (millis: number) => {
    if (!millis) return "00:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes < 10 ? '0' : ''}${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  // --- DİL DEĞİŞİMİ ---
  const changeLanguage = async (lang: 'TR' | 'AR') => {
    if (lang === language) return;

    await resetPlayer();
    setLanguage(lang);

    if (contentType === 'dua') {
      setAudioSource(lang === 'TR' ? LOCAL_AUDIO.dua_tr : LOCAL_AUDIO.dua_ar);
    }
  };

  const getIconName = () => {
    if (contentType === 'dua') return 'hand-heart';
    if (contentType === 'hadis') return 'comment-text-multiple';
    return 'book-open-page-variant';
  };

  // --- OYNATICIYI GÖSTERME MANTIĞI ---
  const shouldShowPlayer = () => {
    if (contentType === 'hadis') return false;

    if (contentType === 'ayet') {
      // Türkçe ayet için Player YOK (Seslendirme yok), Sadece Arapça
      return language === 'AR';
    }

    if (contentType === 'dua') {
      // Dua için her iki dilde de var
      return true;
    }

    return false;
  };

  const handleBackPress = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.backgroundPatternContainer} pointerEvents="none">
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -120 }]} />
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -120 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* HEADER */}
        <ScreenHeader
          title={data?.title || "Detay"}
          onLeftPress={handleBackPress}
          centerTitle
        />

        <ScrollView contentContainerStyle={styles.content}>

          <View style={styles.titleSection}>
            <MaterialCommunityIcons name={getIconName()} size={50} color="#D4AF37" style={{ marginBottom: 10 }} />
            <Text style={styles.subTitle}>{data?.subTitle || ""}</Text>
          </View>

          {/* DİL SEÇİMİ */}
          <View style={styles.langSwitchContainer}>
            <TouchableOpacity style={[styles.langBtn, language === 'TR' && styles.activeLang]} onPress={() => changeLanguage('TR')}>
              <Text style={[styles.langText, language === 'TR' && styles.activeLangText]}>Türkçe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, language === 'AR' && styles.activeLang]} onPress={() => changeLanguage('AR')}>
              <Text style={[styles.langText, language === 'AR' && styles.activeLangText]}>Arapça</Text>
            </TouchableOpacity>
          </View>

          {/* --- METİN KARTI --- */}
          <View style={styles.card}>
            {textLoading ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator color="#D4AF37" size="large" />
                <Text style={{ color: '#aaa', marginTop: 10, textAlign: 'center' }}>Yükleniyor...</Text>
              </View>
            ) : (
              <View>
                {/* AYET İSE ARAPÇA HER ZAMAN GÖZÜKSÜN (OPSİYONEL) VEYA DİL SEÇİMİNE GÖRE */}
                {/* Kullanıcı isteği: "Görüntü olarak daha kullanışlı" -> Arapça üstte, Türkçe altta olabilir mi?
                        Mevcut yapı dil değiştirme üzerine, bunu koruyalım ama Player bağımsız olsun.
                    */}
                <Text style={[
                  language === 'TR' ? styles.textContent : styles.arabicText,
                  { opacity: isPlaying ? 0.8 : 1 } // Çalarken hafif transparan
                ]}>
                  {language === 'TR' ? textContent.tr : textContent.ar}
                </Text>
              </View>
            )}
          </View>

          {/* --- PLAYER KONTROLLERİ --- */}
          {shouldShowPlayer() && (
            <View style={styles.playerContainer}>
              {/* SLIDER */}
              <View style={styles.sliderWrapper}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                  style={{ flex: 1, marginHorizontal: 10 }}
                  minimumValue={0}
                  maximumValue={duration > 0 ? duration : 100}
                  value={position}
                  onSlidingComplete={onSeek}
                  minimumTrackTintColor="#D4AF37"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#D4AF37"
                  disabled={!audioReady}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* PLAY BUTONU & KONTROLLER */}
              <View style={styles.controlsRow}>
                {/* Geri Sar Button */}
                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={() => onSeek(Math.max(0, position - 10000))}
                  disabled={!audioReady}
                >
                  <MaterialCommunityIcons name="rewind-10" size={32} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>

                {/* Play/Pause Button */}
                <TouchableOpacity
                  style={[
                    styles.playButton,
                    isPlaying && styles.pauseButton,
                    !audioReady && styles.disabledButton
                  ]}
                  onPress={playSound}
                  disabled={!audioReady || audioBuffering}
                >
                  {(!audioReady || audioBuffering) ? (
                    <ActivityIndicator color="#0F2027" size="large" />
                  ) : (
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={40}
                      color="#0F2027"
                      style={{ marginLeft: isPlaying ? 0 : 4 }}
                    />
                  )}
                </TouchableOpacity>

                {/* İleri Sar Button */}
                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={() => onSeek(Math.min(duration, position + 10000))}
                  disabled={!audioReady}
                >
                  <MaterialCommunityIcons name="fast-forward-10" size={32} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SES YOK MESAJI */}
          {!shouldShowPlayer() && (
            <View style={styles.noAudioContainer}>
              <MaterialCommunityIcons name="volume-off" size={24} color="rgba(255,255,255,0.3)" />
            </View>
          )}

          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 250, height: 250, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER styles removed

  content: { padding: 20, alignItems: 'center' },
  titleSection: { alignItems: 'center', marginBottom: 25 },
  subTitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', letterSpacing: 1, textAlign: 'center' },

  langSwitchContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, padding: 4, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  langBtn: { paddingVertical: 10, paddingHorizontal: 35, borderRadius: 20 },
  activeLang: { backgroundColor: '#D4AF37' },
  langText: { fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  activeLangText: { color: '#0F2027', fontWeight: 'bold' },

  card: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  // Türkçe Metin Stili
  textContent: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  // Arapça Metin Stili
  arabicText: {
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 50,
    fontWeight: 'bold',
    color: '#fff'
  },

  playerContainer: { width: '100%', marginTop: 30 },
  sliderWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, width: '100%' },
  timeText: { color: '#D4AF37', fontSize: 12, width: 40, textAlign: 'center' },

  playButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#D4AF37',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#D4AF37', shadowOpacity: 0.5, shadowRadius: 15, elevation: 10
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30, // Buttonlar arası boşluk
    marginTop: 10
  },
  seekButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  pauseButton: { backgroundColor: '#FFD700', opacity: 0.9 },
  disabledButton: { backgroundColor: 'rgba(255,255,255,0.1)', shadowOpacity: 0 },
  playHint: { marginTop: 15, color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  noAudioContainer: { alignItems: 'center', marginTop: 10, opacity: 0.6 },
  noAudioText: { color: '#aaa', fontSize: 12, marginTop: 5 }
});