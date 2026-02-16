import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RAMADAN_DATA, RamadanDay } from '../data/ramadanData';
import { getRamadanPrayerTimes } from '../services/prayerTimeService';

const { width } = Dimensions.get('window');

// Grid İçin Yardımcı Satır Bileşeni
const GridTimeRow = ({ label, time, highlight, isKadir }: { label: string, time: string, highlight?: boolean, isKadir?: boolean }) => (
  <View style={styles.gridRow}>
    <Text style={[styles.gridLabel, (highlight || isKadir) && { color: '#D4AF37', fontWeight: 'bold' }]}>{label}</Text>
    <View style={styles.gridDot} />
    <Text style={[styles.gridTime, (highlight || isKadir) && { color: '#D4AF37', fontWeight: 'bold' }]}>{time}</Text>
  </View>
);

export default function ImsakiyeScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDay, setSelectedDay] = useState<RamadanDay | null>(null);
  const [data, setData] = useState<RamadanDay[]>(RAMADAN_DATA);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiData = await getRamadanPrayerTimes();
      if (apiData && apiData.length > 0) {
        setData(apiData);
      }
    } catch (e) {
      console.log("Failed to load live data, using fallback", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Vakitler Yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          {/* --- HEADER --- */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Ramazan İmsakiyesi</Text>
              <Text style={styles.headerSubtitle}>Vakitler ve Dualar</Text>
            </View>

            <View style={styles.iconToggleContainer}>
              <TouchableOpacity
                style={[styles.iconButton, viewMode === 'list' && styles.activeIconButton]}
                onPress={() => setViewMode('list')}
              >
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={24}
                  color={viewMode === 'list' ? '#0F2027' : 'rgba(255,255,255,0.5)'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, viewMode === 'grid' && styles.activeIconButton]}
                onPress={() => setViewMode('grid')}
              >
                <MaterialCommunityIcons
                  name="view-grid"
                  size={24}
                  color={viewMode === 'grid' ? '#0F2027' : 'rgba(255,255,255,0.5)'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 20 }} />

          {/* --- İÇERİK --- */}
          {viewMode === 'list' ? (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colText, styles.colDate, { color: '#D4AF37' }]}>Gün</Text>
                <Text style={styles.colText}>İmsak</Text>
                <Text style={styles.colText}>Güneş</Text>
                <Text style={styles.colText}>Öğle</Text>
                <Text style={styles.colText}>İkindi</Text>
                <Text style={styles.colText}>Akşam</Text>
                <Text style={styles.colText}>Yatsı</Text>
                <View style={styles.chevronCol} />
              </View>

              {data.map((item, index) => {
                const isKadir = item.isKadirGecesi;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 && styles.tableRowAlt,
                      isKadir && styles.kadirRow
                    ]}
                    onPress={() => setSelectedDay(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.dayNum, isKadir && styles.kadirText]}>{item.day}</Text>
                        {isKadir && <Ionicons name="moon" size={8} color="#D4AF37" style={{ marginLeft: 4 }} />}
                      </View>
                      <Text style={[styles.dateText, isKadir && { color: 'rgba(255,215,0,0.7)' }]}>{item.gregorian}</Text>
                    </View>
                    <Text style={[styles.timeText, isKadir && styles.kadirText]}>{item.times.imsak}</Text>
                    <Text style={[styles.timeText, isKadir && styles.kadirText]}>{item.times.gunes}</Text>
                    <Text style={[styles.timeText, isKadir && styles.kadirText]}>{item.times.ogle}</Text>
                    <Text style={[styles.timeText, isKadir && styles.kadirText]}>{item.times.ikindi}</Text>
                    <Text style={[styles.timeText, styles.iftarText, isKadir && styles.kadirText]}>{item.times.aksam}</Text>
                    <Text style={[styles.timeText, isKadir && styles.kadirText]}>{item.times.yatsi}</Text>
                    <View style={styles.chevronCol}>
                      <Ionicons name="chevron-forward" size={14} color={isKadir ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {data.map((item, index) => {
                const isKadir = item.isKadirGecesi;
                return (
                  <View key={index} style={[styles.gridCard, isKadir && styles.kadirCard]}>
                    <View style={[styles.cardHeader, isKadir && styles.kadirCardHeader]}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={[styles.cardDay, isKadir && styles.kadirText]}>{item.day}. Gün</Text>
                          {isKadir && <Ionicons name="moon" size={12} color="#D4AF37" style={{ marginLeft: 5 }} />}
                        </View>
                        <Text style={[styles.cardDate, isKadir && { color: 'rgba(255,215,0,0.8)' }]}>{item.gregorian}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.headerDuaButton, isKadir && { backgroundColor: 'rgba(255,215,0,0.2)' }]}
                        onPress={() => setSelectedDay(item)}
                      >
                        <MaterialCommunityIcons name="hand-heart" size={20} color="#D4AF37" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardBody}>
                      <GridTimeRow label="İmsak" time={item.times.imsak} isKadir={isKadir} />
                      <GridTimeRow label="Güneş" time={item.times.gunes} isKadir={isKadir} />
                      <GridTimeRow label="Öğle" time={item.times.ogle} isKadir={isKadir} />
                      <GridTimeRow label="İkindi" time={item.times.ikindi} isKadir={isKadir} />
                      <GridTimeRow label="Akşam" time={item.times.aksam} highlight isKadir={isKadir} />
                      <GridTimeRow label="Yatsı" time={item.times.yatsi} isKadir={isKadir} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 85 + insets.bottom }} />
        </ScrollView>
      </SafeAreaView>

      {/* DUA DETAY MODALI */}
      <Modal
        visible={!!selectedDay}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#203A43', '#2C5364']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedDay?.day}. Gün Duası</Text>
                  {selectedDay?.isKadirGecesi && (
                    <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold' }}>✨ Kadir Gecesi ✨</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setSelectedDay(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={[styles.arabicContainer, selectedDay?.isKadirGecesi && { borderColor: '#D4AF37', borderWidth: 1 }]}>
                  <Text style={styles.arabicText}>{selectedDay?.dua.arabic}</Text>
                </View>

                <View style={styles.divider} />

                {selectedDay?.zikir && (
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Text style={styles.meaningTitle}>Günün Zikri</Text>
                    <Text style={[styles.meaningText, { color: '#D4AF37', fontWeight: 'bold' }]}>{selectedDay.zikir}</Text>
                    <View style={[styles.divider, { marginTop: 20, width: 30, opacity: 0.3 }]} />
                  </View>
                )}

                <Text style={styles.meaningTitle}>Anlamı</Text>
                <Text style={styles.meaningText}>{selectedDay?.dua.meaning}</Text>

                <View style={{ height: 20 }} />
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 15 },

  // HEADER STYLE
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // TOGGLE BUTONLARI
  iconToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2
  },
  activeIconButton: {
    backgroundColor: '#D4AF37'
  },

  // LİSTE GÖRÜNÜMÜ
  tableContainer: { width: '100%' },
  tableHeader: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#D4AF37', marginBottom: 5,
  },
  colText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', flex: 1, fontWeight: 'bold' },
  colDate: { flex: 1.2, textAlign: 'left', paddingLeft: 5 },

  tableRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tableRowAlt: { backgroundColor: 'rgba(212, 175, 55, 0.03)' },

  // Kadir Gecesi Stilleri
  kadirRow: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1, borderRadius: 8,
    marginVertical: 2
  },
  kadirText: { color: '#FFD700', fontWeight: 'bold' },
  kadirCard: { borderColor: '#D4AF37', borderWidth: 2, backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  kadirCardHeader: { backgroundColor: 'rgba(212, 175, 55, 0.25)' },

  dateCol: { flex: 1.2, paddingLeft: 5 },
  dayNum: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  dateText: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },

  timeText: { color: '#fff', fontSize: 13, flex: 1, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  iftarText: { color: '#D4AF37', fontWeight: 'bold' },
  chevronCol: { width: 25, alignItems: 'center', justifyContent: 'center' }, // Sabit genişlik for chevron

  // GRID GÖRÜNÜMÜ
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    width: (width - 40) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 15,
    overflow: 'hidden'
  },
  cardHeader: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)',
    position: 'relative'
  },
  headerDuaButton: {
    position: 'absolute',
    right: 10, top: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 5, borderRadius: 15
  },
  cardDay: { color: '#D4AF37', fontWeight: 'bold', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center' },
  cardDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2, textAlign: 'center' },

  cardBody: { padding: 10 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  gridLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  gridDot: { flex: 1, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginHorizontal: 5, marginBottom: 4 },
  gridTime: { color: '#fff', fontSize: 13, fontWeight: '500' },

  // MODAL STYLES
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    width: '100%', maxHeight: '70%', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)'
  },
  modalGradient: { padding: 20, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  closeButton: { padding: 5 },
  modalScroll: { alignItems: 'center' },

  arabicContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20, borderRadius: 15, width: '100%', alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  arabicText: {
    fontSize: 24, color: '#D4AF37', textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  divider: { width: 50, height: 2, backgroundColor: '#D4AF37', opacity: 0.5, marginBottom: 20 },
  meaningTitle: { color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  meaningText: { color: '#fff', fontSize: 16, textAlign: 'center', lineHeight: 24 }
});