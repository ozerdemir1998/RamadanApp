import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- EKRANLAR ---
import EsmaulHusnaScreen from './EsmaulHusnaScreen';
import KazaTakipScreen from './KazaTakipScreen';
import NamazVisualScreen from './NamazVisualScreen';
import QiblaScreen from './QiblaScreen';
import ZikirmatikScreen from './ZikirmatikScreen';

const ICON_PATTERN = require('../../assets/icons/pattern.png');

export default function MenuScreen() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

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

  // Modal Kapatıcı
  const closeModal = () => setActiveModal(null);

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
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="view-grid" size={28} color="#D4AF37" />
              <View style={styles.verticalLine} />
              <Text style={styles.headerTitle}>Menü & Araçlar</Text>
            </View>
          </View>

          {/* 1. İSLAMİ ARAÇLAR GRUBU */}
          <Text style={styles.sectionTitle}>İslami Araçlar</Text>
          <View style={styles.cardContainer}>

            {/* Namaz Hocası (Yeni) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('NAMAZ_VISUAL')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                <MaterialCommunityIcons name="human-handsdown" size={24} color="#FFD700" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Namaz Hocası</Text>
                <Text style={styles.menuSubtitle}>Görsel anlatımlı namaz kılınışı</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Esmaül Hüsna (Yeni) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('ESMAUL_HUSNA')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                <MaterialCommunityIcons name="star-crescent" size={24} color="#9b59b6" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Esmaül Hüsna</Text>
                <Text style={styles.menuSubtitle}>Allah'ın 99 güzel ismi</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            {/* Kıble Bulucu (Yeni) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('QIBLA')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <MaterialCommunityIcons name="compass" size={24} color="#3498db" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Kıble Bulucu</Text>
                <Text style={styles.menuSubtitle}>Kabe yönünü bul</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
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
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Zikirmatik */}
            <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('ZIKIRMATIK')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <MaterialCommunityIcons name="fingerprint" size={24} color="#3498db" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Zikirmatik</Text>
                <Text style={styles.menuSubtitle}>Dijital tesbih sayacı</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Kaza Takibi */}
            <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal('KAZA_TAKIP')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <MaterialCommunityIcons name="notebook-edit" size={24} color="#e74c3c" />
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuTitle}>Kaza Takibi</Text>
                <Text style={styles.menuSubtitle}>Borçlarınızı not alın</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
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
              <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

          </View>

          <Text style={styles.versionText}>Versiyon 1.0.0</Text>
          <View style={{ height: 100 }} />

        </ScrollView>

        {/* --- GLOBAL MODAL YAPISI --- */}
        <Modal
          visible={activeModal !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeModal}
        >
          <View style={{ flex: 1, backgroundColor: '#0F2027' }}>
            {/* Kapat Butonu (Tüm modallar için ortak) */}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>

            {/* İçerik Render */}
            {activeModal === 'NAMAZ_VISUAL' && <NamazVisualScreen />}
            {activeModal === 'ESMAUL_HUSNA' && <EsmaulHusnaScreen />}
            {activeModal === 'QIBLA' && <QiblaScreen />}
            {activeModal === 'ZIKIRMATIK' && <ZikirmatikScreen />}
            {activeModal === 'KAZA_TAKIP' && <KazaTakipScreen />}

          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },

  // ARKAPLAN
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  verticalLine: { width: 1, height: 24, backgroundColor: '#D4AF37', marginHorizontal: 12 },
  headerTitle: { fontSize: 24, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37' },

  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10, marginLeft: 25, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 },

  // KART YAPISI
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  menuSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 70 },

  versionText: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 30 },

  // MODAL CLOSE BUTTON
  closeButton: {
    position: 'absolute', top: 15, right: 15, zIndex: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20
  },
  closeButtonText: { color: '#D4AF37', fontWeight: 'bold' },
});