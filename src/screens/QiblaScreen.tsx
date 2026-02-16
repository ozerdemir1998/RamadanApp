import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.85;

// --- İKON ---
const ICON_PATTERN = require('../../assets/icons/compass.png'); 

export default function QiblaScreen() {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Konum alınıyor...");
  
  // EKLENDİ: Güvenli alan
  const insets = useSafeAreaInsets();

  // Performans için useRef kullanımı (State güncellemelerini yavaşlatmak için)
  const lastUpdate = useRef(0);

  useEffect(() => {
    initQibla();
    
    // Manyetometre dinleyicisi
    const subscription = Magnetometer.addListener((data) => {
      // Throttle: Sadece 50ms'de bir güncelle (Performans için)
      const now = Date.now();
      if (now - lastUpdate.current > 50) {
        lastUpdate.current = now;
        
        let { x, y } = data;
        // Manyetik kuzey açısını hesapla
        let angle = Math.atan2(y, x); 
        angle = angle * (180 / Math.PI); // Dereceye çevir
        angle = angle - 90; // Pusula düzeltmesi
        angle = (angle + 360) % 360; // Pozitif yap
        
        setHeading(angle);
      }
    });

    // Sensör hızını ayarla (Çok hızlı olursa donar)
    Magnetometer.setUpdateInterval(50); 

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  const initQibla = async () => {
    // 1. İzinleri İste
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Hatası', 'Kıbleyi bulmak için konum izni gereklidir.');
      setLoading(false);
      return;
    }

    // 2. Mevcut Konumu Al ve Kıble Açısını Hesapla
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    // Kabe Koordinatları
    const KAABA_LAT = 21.422487;
    const KAABA_LON = 39.826206;
    
    // Kıble açısını (Bearing) hesapla
    const bearing = calculateBearing(latitude, longitude, KAABA_LAT, KAABA_LON);
    setQiblaBearing(bearing);

    // Şehir ismini al
    let address = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address && address.length > 0) {
      setLocationName(address[0].city || address[0].region || "Konum");
    }
    setLoading(false);
  };

  // İki koordinat arası yön açısı hesaplama
  const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    const startLatRad = (startLat * Math.PI) / 180;
    const startLngRad = (startLng * Math.PI) / 180;
    const destLatRad = (destLat * Math.PI) / 180;
    const destLngRad = (destLng * Math.PI) / 180;

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x =
      Math.cos(startLatRad) * Math.sin(destLatRad) -
      Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
    
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // --- DÖNÜŞ MANTIĞI ---
  // Okun göstermesi gereken yön (Hedef - Mevcut Yön)
  const arrowRotation = (qiblaBearing - heading + 360) % 360;
  
  // Hizalandı mı? (±5 derece hassasiyet)
  const isAligned = arrowRotation < 5 || arrowRotation > 355;

  // Yönlendirme Metni (Sağa/Sola Dön)
  let directionHint = "Kıble Yönündesiniz";
  if (!isAligned) {
      // 0-180 arası ise SAĞA, 180-360 arası ise SOLA dönmesi daha kısa yoldur
      if (arrowRotation > 0 && arrowRotation <= 180) {
          directionHint = "Sağa Dönün ➡️";
      } else {
          directionHint = "⬅️ Sola Dönün";
      }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={{color: '#D4AF37', marginTop: 10}}>Konum Hesaplanıyor...</Text>
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

      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <MaterialCommunityIcons name="compass" size={40} color="#D4AF37" style={{marginRight: 10}} />
                <Text style={styles.headerTitle}>Kıble</Text>
            </View>
            <Text style={styles.locationText}>{locationName}</Text>
        </View>

        {/* --- PUSULA ALANI --- */}
        <View style={styles.compassContainer}>
            
            {/* DIŞ ÇERÇEVE */}
            <View style={[styles.compassBorder, isAligned && styles.alignedBorder]}>
                
                {/* Yön Harfleri (Telefon döndükçe bunlar da dönmeli) */}
                <View style={[styles.cardinalsLayer, { transform: [{ rotate: `${-heading}deg` }] }]}>
                    <Text style={[styles.directionText, { top: 15, alignSelf: 'center', color: '#D4AF37' }]}>N</Text>
                    <Text style={[styles.directionText, { bottom: 15, alignSelf: 'center' }]}>S</Text>
                    <Text style={[styles.directionText, { left: 15, top: '50%', marginTop: -10 }]}>W</Text>
                    <Text style={[styles.directionText, { right: 15, top: '50%', marginTop: -10 }]}>E</Text>
                </View>

                {/* DÖNEN OK KATMANI */}
                <View 
                    style={[
                        styles.rotatingLayer, 
                        { transform: [{ rotate: `${arrowRotation}deg` }] }
                    ]}
                >
                    <View style={styles.arrowWrapper}>
                        <MaterialCommunityIcons 
                            name="arrow-up-bold" 
                            size={50} 
                            color={isAligned ? "#00FF00" : "#D4AF37"} 
                            style={isAligned ? styles.glowingArrow : {}}
                        />
                    </View>
                </View>

                {/* MERKEZ (KABE İKONU) */}
                <View style={styles.centerPiece}>
                    <FontAwesome5 name="kaaba" size={60} color={isAligned ? "#D4AF37" : "rgba(212, 175, 55, 0.4)"} />
                </View>

            </View>
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 85 }]}>
            <Text style={styles.degreeText}>{Math.round(heading)}°</Text> 
            
            <Text style={[styles.infoText, isAligned && { color: '#00FF00', fontWeight: 'bold' }]}>
                {directionHint}
            </Text>
            
            <Text style={styles.subInfoText}>Kıble Açısı: {Math.round(qiblaBearing)}°</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2027' },
  
  // ARKAPLAN
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  header: { alignItems: 'center', marginTop: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 42, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37', letterSpacing: 2 },
  locationText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 5, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

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
  footer: { alignItems: 'center' }, // paddingBottom inline olarak veriliyor
  degreeText: { fontSize: 56, color: '#fff', fontWeight: '300', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  subInfoText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5 },
  infoText: { color: '#D4AF37', fontSize: 20, marginTop: 5, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '600' }
});