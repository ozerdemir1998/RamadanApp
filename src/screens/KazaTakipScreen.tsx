import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rf, scale, SCREEN_DIMENSIONS, verticalScale } from '../utils/responsive';

const ICON_PATTERN = require('../../assets/icons/pattern.png');

import ScreenHeader from '../components/ScreenHeader';

export default function KazaTakipScreen({ onClose }: { onClose?: () => void }) {
  const [kazaSayisi, setKazaSayisi] = useState(0);

  // --- MANTIK KISMI (AYNEN KORUNDU) ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedCount = await AsyncStorage.getItem('kaza_sayisi');
      if (savedCount !== null) {
        setKazaSayisi(parseInt(savedCount));
      }
    } catch (e) {
      console.error("Veri okunamadı");
    }
  };

  const saveData = async (count: number) => {
    try {
      await AsyncStorage.setItem('kaza_sayisi', count.toString());
    } catch (e) {
      console.error("Veri kaydedilemedi");
    }
  };

  const updateCount = (change: number) => {
    const newCount = kazaSayisi + change;
    if (newCount < 0) return; // Negatif olmasın
    setKazaSayisi(newCount);
    saveData(newCount);
  };

  // --- TASARIM KISMI (YENİLENDİ) ---
  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      style={styles.container}
    >
      {/* Arkaplan Deseni */}
      <View style={styles.backgroundPatternContainer} pointerEvents="none">
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
        <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
      </View>

      <SafeAreaView style={{ flex: 1, alignItems: 'center', width: '100%' }} edges={['top']}>
        {/* Header */}
        <View style={{ width: '100%', marginBottom: 40, marginTop: 20, paddingHorizontal: 20 }}>
          <ScreenHeader
            title="Kaza Takibi"
            onLeftPress={onClose}
            leftIcon="close"
            centerTitle
          />
        </View>

        {/* Ana İçerik */}
        <View style={styles.contentContainer}>

          <Text style={styles.infoText}>
            Tutamadığınız oruçları kaydedin ve ödedikçe düşün.
          </Text>

          {/* Sayaç Dairesi */}
          <View style={styles.counterCircleOuter}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.15)', 'rgba(0,0,0,0.8)']}
              style={styles.counterCircleInner}
            >
              <Text style={styles.countText}>{kazaSayisi}</Text>
              <Text style={styles.dayLabel}>GÜN BORÇ</Text>
            </LinearGradient>
          </View>

          {/* Kontrol Butonları */}
          <View style={styles.controlsRow}>

            {/* Azalt Butonu (Borç Ödedim) */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => updateCount(-1)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.btnGradient}
              >
                <Ionicons name="remove" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.btnLabel}>Ödedim</Text>
            </TouchableOpacity>

            {/* Arttır Butonu (Borç Ekle) */}
            <TouchableOpacity
              style={[styles.controlBtn, styles.addBtn]}
              onPress={() => updateCount(1)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#D4AF37', '#B8860B']}
                style={styles.btnGradient}
              >
                <Ionicons name="add" size={32} color="#0F2027" />
              </LinearGradient>
              <Text style={[styles.btnLabel, { color: '#D4AF37' }]}>Ekle</Text>
            </TouchableOpacity>

          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 0 },

  // ARKAPLAN
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: scale(300), height: scale(300), opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // İÇERİK
  contentContainer: { alignItems: 'center', width: '100%' },
  infoText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: verticalScale(30),
    width: '70%',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },

  // SAYAÇ DAİRESİ
  counterCircleOuter: {
    width: SCREEN_DIMENSIONS.width * 0.65,
    height: SCREEN_DIMENSIONS.width * 0.65,
    borderRadius: (SCREEN_DIMENSIONS.width * 0.65) / 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: scale(10),
    marginBottom: verticalScale(50),
    shadowColor: '#D4AF37',
    shadowOpacity: 0.2,
    shadowRadius: scale(20),
  },
  counterCircleInner: {
    flex: 1,
    borderRadius: (SCREEN_DIMENSIONS.width * 0.65) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37'
  },
  countText: {
    fontSize: rf(80),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowRadius: scale(10)
  },
  dayLabel: {
    color: '#D4AF37',
    fontSize: rf(16),
    letterSpacing: 3,
    marginTop: verticalScale(5),
    fontWeight: 'bold'
  },

  // BUTONLAR
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(40),
    width: '100%'
  },
  controlBtn: { alignItems: 'center' },
  btnGradient: {
    width: scale(70), height: scale(70),
    borderRadius: scale(35),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: verticalScale(10),
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: scale(5), elevation: 5
  },
  addBtn: {},
  btnLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: rf(14),
    fontWeight: '600'
  }
});