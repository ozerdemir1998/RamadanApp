import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/pattern.png'); 

export default function KazaTakipScreen() {
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

      {/* Header */}
      <View style={styles.header}>
         <MaterialCommunityIcons name="notebook-edit" size={28} color="#D4AF37" />
         <View style={styles.verticalLine} />
         <Text style={styles.headerTitle}>Kaza Takibi</Text>
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
                <Text style={[styles.btnLabel, {color: '#D4AF37'}]}>Ekle</Text>
            </TouchableOpacity>

        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ARKAPLAN
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  header: { 
      position: 'absolute', top: 40, 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  verticalLine: { width: 1, height: 20, backgroundColor: '#D4AF37', marginHorizontal: 10 },
  headerTitle: { fontSize: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37' },

  // İÇERİK
  contentContainer: { alignItems: 'center', width: '100%' },
  infoText: { 
      color: 'rgba(255,255,255,0.6)', 
      textAlign: 'center', 
      marginBottom: 30, 
      width: '70%',
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },

  // SAYAÇ DAİRESİ
  counterCircleOuter: {
      width: width * 0.65,
      height: width * 0.65,
      borderRadius: (width * 0.65) / 2,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      padding: 10,
      marginBottom: 50,
      shadowColor: '#D4AF37',
      shadowOpacity: 0.2,
      shadowRadius: 20,
  },
  counterCircleInner: {
      flex: 1,
      borderRadius: (width * 0.65) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#D4AF37'
  },
  countText: {
      fontSize: 80,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      textShadowColor: 'rgba(212, 175, 55, 0.5)',
      textShadowRadius: 10
  },
  dayLabel: {
      color: '#D4AF37',
      fontSize: 16,
      letterSpacing: 3,
      marginTop: 5,
      fontWeight: 'bold'
  },

  // BUTONLAR
  controlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 40,
      width: '100%'
  },
  controlBtn: { alignItems: 'center' },
  btnGradient: {
      width: 70, height: 70,
      borderRadius: 35,
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
      marginBottom: 10,
      shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  addBtn: {
      // Ekle butonu için özel stil gerekirse buraya
  },
  btnLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 14,
      fontWeight: '600'
  }
});