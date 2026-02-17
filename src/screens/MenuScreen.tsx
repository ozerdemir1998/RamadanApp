import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { rem, rf, scale, verticalScale } from '../utils/responsive';

// --- EKRANLAR ---
import AbdestVisualScreen from './AbdestVisualScreen';
import EsmaulHusnaScreen from './EsmaulHusnaScreen';
import KazaTakipScreen from './KazaTakipScreen';
import NamazVisualScreen from './NamazVisualScreen';
import QiblaScreen from './QiblaScreen';
import ZikirmatikScreen from './ZikirmatikScreen';



const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/pattern.png');

import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  // Reanimated Değerleri
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const openNearbyMosques = () => {
    const query = "Camiler";
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert("Hata", "Harita uygulaması açılamadı.");
      });
    }
  };

  const openModal = (screenName: string) => {
    setActiveScreen(screenName);
    setModalVisible(true);

    // Animasyonu Başlat (Giriş)
    translateY.value = withTiming(0, {
      duration: 500, // Slower for softness
      easing: Easing.out(Easing.cubic) // Cubic easing for smooth start/stop
    });
    backdropOpacity.value = withTiming(1, { duration: 500 });
  };

  const closeModal = () => {
    // Animasyonu Başlat (Çıkış)
    translateY.value = withTiming(SCREEN_HEIGHT, {
      duration: 500,
      easing: Easing.in(Easing.cubic)
    }, (finished) => {
      if (finished) {
        runOnJS(setModalVisible)(false);
      }
    });
    backdropOpacity.value = withTiming(0, { duration: 300 });
  };

  // Animasyon Stilleri
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value
    };
  });

  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      style={{ flex: 1 }}
    >
      {/* Arkaplan Deseni */}
      <View style={styles.backgroundPatternContainer} pointerEvents="none">
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <ScreenHeader
            title="Menü & Araçlar"
            leftIcon="none"
          />

          {/* 1. İSLAMİ ARAÇLAR GRUBU */}
          <Text style={styles.sectionTitle}>İslami Araçlar</Text>
          <View style={styles.cardContainer}>

            {/* Namaz Hocası (Yeni) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => openModal('NAMAZ_VISUAL')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                <Image
                  source={require('../../assets/icons/prayer.png')}
                  style={{ width: 24, height: 24, tintColor: '#FFD700' }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Namaz Hocası</Text>
                <Text style={styles.menuSubtitle}>Görsel anlatımlı namaz kılınışı</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Abdest Rehberi (YENİ) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => openModal('ABDEST_VISUAL')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 195, 247, 0.1)' }]}>
                <MaterialCommunityIcons name="water" size={24} color="#4FC3F7" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Abdest Rehberi</Text>
                <Text style={styles.menuSubtitle}>Adım adım abdest alınışı</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>


            <View style={styles.separator} />

            {/* Esmaül Hüsna (Yeni) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => openModal('ESMAUL_HUSNA')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                <MaterialCommunityIcons name="star-crescent" size={24} color="#9b59b6" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Esmaül Hüsna</Text>
                <Text style={styles.menuSubtitle}>Allah'ın 99 güzel ismi</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

            {/* Kıble Bulucu (Yeni) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => openModal('QIBLA')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <MaterialCommunityIcons name="compass" size={24} color="#3498db" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Kıble Bulucu</Text>
                <Text style={styles.menuSubtitle}>Kabe yönünü bul</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

            <View style={styles.separator} />


            {/* Yakındaki Camiler */}
            <TouchableOpacity style={styles.menuItem} onPress={openNearbyMosques} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                <Ionicons name="map" size={24} color="#2ecc71" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Yakındaki Camiler</Text>
                <Text style={styles.menuSubtitle}>Haritada en yakın camileri gör</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Zikirmatik */}
            <TouchableOpacity style={styles.menuItem} onPress={() => openModal('ZIKIRMATIK')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <MaterialCommunityIcons name="fingerprint" size={24} color="#3498db" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Zikirmatik</Text>
                <Text style={styles.menuSubtitle}>Dijital tesbih sayacı</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

            <View style={styles.separator} />


            {/* Kaza Takibi */}
            <TouchableOpacity style={styles.menuItem} onPress={() => openModal('KAZA_TAKIP')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <MaterialCommunityIcons name="notebook-edit" size={24} color="#e74c3c" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Kaza Takibi</Text>
                <Text style={styles.menuSubtitle}>Borçlarınızı not alın</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>



          </View>

          {/* 1.5. KİŞİSEL GRUBU */}
          <Text style={styles.sectionTitle}>Kişisel</Text>
          <View style={styles.cardContainer}>
            {/* Favori Tariflerim */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/favorites')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <Ionicons name="heart" size={24} color="#E74C3C" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Favori Tariflerim</Text>
                <Text style={styles.menuSubtitle}>Beğendiğiniz lezzetler</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>
          </View>

          {/* 2. AYARLAR GRUBU */}
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <View style={styles.cardContainer}>

            <View style={styles.separator} />

            {/* Konum Servisi */}
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Bilgi", "Konum şu an otomatik GPS üzerinden alınıyor.")} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(241, 196, 15, 0.1)' }]}>
                <Ionicons name="location" size={24} color="#f1c40f" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Konum Servisi</Text>
                <Text style={styles.menuSubtitle}>Otomatik (GPS)</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

          </View>

          <Text style={styles.versionText}>Versiyon 1.0.0</Text>
          <View style={{ height: 100 }} />

        </ScrollView>

        {/* --- GLOBAL CUSTOM MODAL --- */}
        <Modal
          visible={modalVisible}
          transparent={true} // Arkaplanı şeffaf yap
          animationType="none" // Native animasyonu kapat
          onRequestClose={closeModal}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            {/* Backdrop (Karanlık Arka Plan) */}
            <Animated.View style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: 'rgba(0,0,0,0.5)' },
              animatedBackdropStyle
            ]} />

            {/* İçerik Container (Slide Up) */}
            <Animated.View style={[
              { flex: 1, backgroundColor: '#0F2027', marginTop: Platform.OS === 'ios' ? 40 : 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
              animatedModalStyle
            ]}>

              {/* İçerik Render */}
              {activeScreen === 'NAMAZ_VISUAL' && <NamazVisualScreen onClose={closeModal} />}
              {activeScreen === 'ABDEST_VISUAL' && <AbdestVisualScreen onClose={closeModal} />}
              {activeScreen === 'ESMAUL_HUSNA' && <EsmaulHusnaScreen onClose={closeModal} />}
              {activeScreen === 'QIBLA' && <QiblaScreen onClose={closeModal} />}
              {activeScreen === 'ZIKIRMATIK' && <ZikirmatikScreen onClose={closeModal} />}
              {activeScreen === 'KAZA_TAKIP' && <KazaTakipScreen onClose={closeModal} />}

            </Animated.View>
          </GestureHandlerRootView>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },

  // ARKAPLAN
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: scale(300), height: scale(300), opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  // headerRow etc removed

  sectionTitle: { fontSize: rf(14), fontWeight: 'bold', color: '#D4AF37', marginBottom: verticalScale(10), marginLeft: scale(25), marginTop: verticalScale(20), textTransform: 'uppercase', letterSpacing: 1 },

  // KART YAPISI
  cardContainer: {
    marginHorizontal: scale(20),
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rem(16),
  },
  iconBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  menuTextContent: { flex: 1 },
  menuTitle: { fontSize: rf(16), fontWeight: '600', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  menuSubtitle: { fontSize: rf(12), color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: scale(70) },

  versionText: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: rf(12), marginTop: verticalScale(30) },

  // MODAL CLOSE BUTTON
  closeButton: {
    position: 'absolute', top: 15, right: 15, zIndex: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20
  },
  closeButtonText: { color: '#D4AF37', fontWeight: 'bold' },
});