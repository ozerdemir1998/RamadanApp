import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/pattern.png'); 

export default function ZikirmatikScreen() {
  const [count, setCount] = useState(0);

  // Sayacı Artır
  const handleCount = () => {
    setCount(count + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Sayacı Sıfırla
  const handleReset = () => {
    setCount(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

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
         <MaterialCommunityIcons name="fingerprint" size={28} color="#D4AF37" />
         <View style={styles.verticalLine} />
         <Text style={styles.headerTitle}>Zikirmatik</Text>
      </View>

      {/* Büyük Zikirmatik Gövdesi */}
      <View style={styles.bodyContainer}>
        
        {/* Dijital Ekran Çerçevesi */}
        <View style={styles.screenFrame}>
            <View style={styles.screenInner}>
                <Text style={styles.countText}>{count}</Text>
            </View>
            <Text style={styles.screenLabel}>DİJİTAL SAYAÇ</Text>
        </View>

        {/* Ana Buton Alanı */}
        <View style={styles.controls}>
            {/* Altın Halka Efekti */}
            <View style={styles.buttonRing}>
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={styles.bigButton} 
                    onPress={handleCount}
                >
                    <LinearGradient
                        colors={['#D4AF37', '#B8860B']} // Altın Gradyan
                        style={styles.buttonGradient}
                    >
                        {/* İçbükey Efekt İçin Halka */}
                        <View style={styles.innerButtonShine} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>

        {/* Sıfırlama Butonu */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
            <MaterialCommunityIcons name="refresh" size={24} color="#D4AF37" />
        </TouchableOpacity>

      </View>

      <Text style={styles.hint}>Saymak için butona dokunun</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  // ARKAPLAN DESENİ
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  header: { 
      position: 'absolute', top: 60, 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  verticalLine: { width: 1, height: 20, backgroundColor: '#D4AF37', marginHorizontal: 10 },
  headerTitle: { fontSize: 24, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37' },

  // GÖVDE
  bodyContainer: {
    width: width * 0.8,
    height: width * 1.1,
    backgroundColor: 'rgba(255,255,255,0.05)', // Hafif cam efekti
    borderRadius: 50,
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)', // Altın Çerçeve
    justifyContent: 'space-between',
    paddingVertical: 40
  },
  
  // EKRAN
  screenFrame: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 20
  },
  screenInner: {
    width: '100%',
    height: 100,
    backgroundColor: '#000', // Tam Siyah (OLED hissi)
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10
  },
  countText: {
    fontSize: 60,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.8)', // Neon Glow
    textShadowRadius: 15
  },
  screenLabel: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: 10,
      marginTop: 8,
      letterSpacing: 2
  },

  // BUTON ALANI
  controls: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  
  buttonRing: {
      width: 180, height: 180,
      borderRadius: 90,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)'
  },
  bigButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonGradient: {
      flex: 1,
      borderRadius: 75,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFD700'
  },
  innerButtonShine: {
      width: 130, height: 130,
      borderRadius: 65,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)',
      backgroundColor: 'transparent'
  },

  // RESET
  resetButton: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },

  hint: { marginTop: 30, color: 'rgba(255,255,255,0.4)', fontSize: 14 }
});