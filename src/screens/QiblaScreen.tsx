import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';

const { width, height } = Dimensions.get('window');
// Pusula boyutunu ekranın hem enine hem boyuna göre sınırla
const COMPASS_SIZE = Math.min(width * 0.8, height * 0.45);

// --- İKON ---
const ICON_PATTERN = require('../../assets/icons/compass.png');

export default function QiblaScreen({ onClose }: { onClose?: () => void }) {
  // Reanimated Shared Values
  const headingSV = useSharedValue(0);
  const qiblaBearingSV = useSharedValue(0);

  // State (Sadece UI metinleri için)
  const [displayHeading, setDisplayHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [locationName, setLocationName] = useState("Konum alınıyor...");
  const [loading, setLoading] = useState(true);
  const [isAligned, setIsAligned] = useState(false);

  // Refs for listener
  const qiblaBearingRef = useRef(0);
  const lastHeadingRef = useRef(0);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    initQibla();

    // Manyetometre Ayarları
    Magnetometer.setUpdateInterval(20); // 50Hz (Daha akıcı)

    const subscription = Magnetometer.addListener((data) => {
      let { x, y } = data;
      // Manyetik kuzey
      let angle = Math.atan2(y, x);
      angle = angle * (180 / Math.PI);
      angle = angle - 90;
      angle = (angle + 360) % 360;

      // Low Pass Filter (Yumuşatma) - Reanimated ile
      headingSV.value = withTiming(angle, {
        duration: 100, // 100ms gecikme ile yumuşat
        easing: Easing.linear
      });

      // Metin güncellemesini throttle edelim
      if (Math.abs(angle - lastHeadingRef.current) > 1) {
        lastHeadingRef.current = angle;
        setDisplayHeading(Math.round(angle));

        // Calculate alignment
        const bearing = qiblaBearingRef.current;
        const diff = (bearing - angle + 360) % 360;
        const aligned = diff < 5 || diff > 355;
        setIsAligned(aligned);
      }
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []); // Empty dependency array fixed the infinite loop!

  const initQibla = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Hatası', 'Kıbleyi bulmak için konum izni gereklidir.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const KAABA_LAT = 21.422487;
      const KAABA_LON = 39.826206;

      const bearing = calculateBearing(latitude, longitude, KAABA_LAT, KAABA_LON);
      qiblaBearingSV.value = bearing;
      setQiblaBearing(bearing);
      qiblaBearingRef.current = bearing;

      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address && address.length > 0) {
        setLocationName(address[0].city || address[0].region || "Konum");
      }
      setLoading(false);
    } catch (e) {
      console.log("Error in Qibla init:", e);
      setLoading(false);
    }
  };

  const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    const startLatRad = (startLat * Math.PI) / 180;
    const startLngRad = (startLng * Math.PI) / 180;
    const destLatRad = (destLat * Math.PI) / 180;
    const destLngRad = (destLng * Math.PI) / 180;

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) - Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // --- ANİMASYON STİLLERİ ---
  const animatedCompassStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${-headingSV.value}deg` }]
    };
  });

  const animatedArrowStyle = useAnimatedStyle(() => {
    let diff = qiblaBearingSV.value - headingSV.value;
    diff = (diff + 360) % 360;
    return {
      transform: [{ rotate: `${diff}deg` }]
    };
  });

  // Yönlendirme Metni
  const diff = (qiblaBearing - displayHeading + 360) % 360;
  let directionHint = "Kıble Yönündesiniz";
  if (!isAligned) {
    if (diff > 0 && diff <= 180) {
      directionHint = "Sağa Dönün ➡️";
    } else {
      directionHint = "⬅️ Sola Dönün";
    }
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

      <View style={{ flex: 1, paddingTop: 25 }}>

        {/* 1. Header Container (Height Fix) */}
        <View style={{ zIndex: 10 }}>
          <ScreenHeader
            title="Kıble"
            subtitle={locationName}
            onLeftPress={onClose}
            leftIcon="close"
            centerTitle={true}
            noBorder
          />
        </View>

        {/* 2. Main Content Area (Flex to take remaining space) */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={{ color: '#D4AF37', marginTop: 10 }}>Konum Hesaplanıyor...</Text>
            </View>
          ) : (
            <>
              {/* PUSULA */}
              <View style={styles.compassContainer}>
                <View style={[styles.compassBorder, isAligned && styles.alignedBorder]}>
                  <Animated.View style={[styles.cardinalsLayer, animatedCompassStyle]}>
                    <Text style={[styles.directionText, { top: 15, alignSelf: 'center', color: '#D4AF37' }]}>N</Text>
                    <Text style={[styles.directionText, { bottom: 15, alignSelf: 'center' }]}>S</Text>
                    <Text style={[styles.directionText, { left: 15, top: '50%', marginTop: -10 }]}>W</Text>
                    <Text style={[styles.directionText, { right: 15, top: '50%', marginTop: -10 }]}>E</Text>
                  </Animated.View>

                  <Animated.View style={[styles.rotatingLayer, animatedArrowStyle]}>
                    <View style={styles.arrowWrapper}>
                      <MaterialCommunityIcons
                        name="arrow-up-bold"
                        size={50}
                        color={isAligned ? "#00FF00" : "#D4AF37"}
                        style={isAligned ? styles.glowingArrow : {}}
                      />
                    </View>
                  </Animated.View>

                  <View style={styles.centerPiece}>
                    <FontAwesome5 name="kaaba" size={60} color={isAligned ? "#D4AF37" : "rgba(212, 175, 55, 0.4)"} />
                  </View>
                </View>
              </View>

              {/* FOOTER - İçerik alanının altında, boşluk bırakarak */}
              <View style={styles.footer}>
                <Text style={styles.degreeText}>{displayHeading}°</Text>
                <Text style={[styles.infoText, isAligned && { color: '#00FF00', fontWeight: 'bold' }]}>
                  {directionHint}
                </Text>
                <Text style={styles.subInfoText}>Kıble Açısı: {Math.round(qiblaBearing)}°</Text>
              </View>
            </>
          )}

        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // Added for loading state inside SafeAreaView

  // ARKAPLAN
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // PUSULA
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  compassBorder: {
    width: '100%',
    height: '100%',
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 4,
    borderColor: '#D4AF37',
    backgroundColor: '#0F2027',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  alignedBorder: {
    borderColor: '#00FF00',
    borderWidth: 6,
    shadowColor: "#00FF00",
    shadowRadius: 20,
    shadowOpacity: 0.5
  },

  // YÖN HARFLERİ KATMANI
  cardinalsLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  directionText: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // OK KATMANI
  rotatingLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  arrowWrapper: {
    marginTop: 15,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  glowingArrow: {
    textShadowColor: '#00FF00',
    textShadowRadius: 20,
  },

  // MERKEZ
  centerPiece: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)'
  },

  // FOOTER
  footer: { alignItems: 'center', marginTop: 30, paddingBottom: 20 },
  degreeText: { fontSize: 56, color: '#fff', fontWeight: '300', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  subInfoText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5 },
  infoText: { color: '#D4AF37', fontSize: 20, marginTop: 5, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '600' }
});