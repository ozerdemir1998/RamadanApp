import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CloseButton from '../components/CloseButton';
import ScreenHeader from '../components/ScreenHeader';
import { RAMADAN_DATA, RamadanDay } from '../data/ramadanData';
import { getRamadanPrayerTimes } from '../services/prayerTimeService';
import { rf, scale, SCREEN_DIMENSIONS, verticalScale } from '../utils/responsive';

const { width } = SCREEN_DIMENSIONS;

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
        <ScreenHeader
          title="İmsakiye"
          leftIcon="none"
          noBorder
          rightIcon={
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
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          {/* --- HEADER --- */}
          {/* HEADER MOVED UP */}

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
                      <Ionicons name="chevron-forward" size={14} color="#D4AF37" />
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
                <CloseButton onPress={() => setSelectedDay(null)} />
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
  scrollContainer: { padding: scale(12) },

  // HEADER STYLE
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: { fontSize: rf(24), fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitle: { fontSize: rf(12), color: 'rgba(255,255,255,0.6)', marginTop: verticalScale(2) },

  // TOGGLE BUTONLARI
  iconToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: scale(20),
    padding: scale(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  iconButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(2)
  },
  activeIconButton: {
    backgroundColor: '#D4AF37'
  },

  // LİSTE GÖRÜNÜMÜ
  tableContainer: { width: '100%' },
  tableHeader: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: verticalScale(8),
    borderBottomWidth: 1, borderBottomColor: '#D4AF37', marginBottom: verticalScale(4),
  },
  colText: { color: 'rgba(255,255,255,0.6)', fontSize: rf(10), textAlign: 'center', flex: 1, fontWeight: 'bold' },
  colDate: { flex: 1.2, textAlign: 'left', paddingLeft: scale(4) },

  tableRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: verticalScale(10), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tableRowAlt: { backgroundColor: 'rgba(212, 175, 55, 0.03)' },

  // Kadir Gecesi Stilleri
  kadirRow: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1, borderRadius: scale(8),
    marginVertical: verticalScale(2)
  },
  kadirText: { color: '#FFD700', fontWeight: 'bold' },
  kadirCard: { borderColor: '#D4AF37', borderWidth: 2, backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  kadirCardHeader: { backgroundColor: 'rgba(212, 175, 55, 0.25)' },

  dateCol: { flex: 1.2, paddingLeft: scale(4) },
  dayNum: { color: '#D4AF37', fontSize: rf(13), fontWeight: 'bold' },
  dateText: { color: 'rgba(255,255,255,0.5)', fontSize: rf(9) },

  timeText: { color: '#fff', fontSize: rf(11), flex: 1, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  iftarText: { color: '#D4AF37', fontWeight: 'bold' },
  chevronCol: { width: scale(22), alignItems: 'center', justifyContent: 'center' },

  // GRID GÖRÜNÜMÜ
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    width: (width - scale(36)) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: verticalScale(12),
    overflow: 'hidden'
  },
  cardHeader: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)',
    position: 'relative'
  },
  headerDuaButton: {
    position: 'absolute',
    right: scale(8), top: scale(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: scale(4), borderRadius: scale(15)
  },
  cardDay: { color: '#D4AF37', fontWeight: 'bold', fontSize: rf(14), fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center' },
  cardDate: { color: 'rgba(255,255,255,0.6)', fontSize: rf(10), marginTop: verticalScale(2), textAlign: 'center' },

  cardBody: { padding: scale(8) },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(5) },
  gridLabel: { color: 'rgba(255,255,255,0.6)', fontSize: rf(11) },
  gridDot: { flex: 1, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginHorizontal: scale(4), marginBottom: verticalScale(3) },
  gridTime: { color: '#fff', fontSize: rf(12), fontWeight: '500' },

  // MODAL STYLES
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center', padding: scale(20)
  },
  modalContent: {
    width: '100%', maxHeight: '70%', borderRadius: scale(20), overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)'
  },
  modalGradient: { padding: scale(20), width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
  modalTitle: { fontSize: rf(20), fontWeight: 'bold', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  closeButton: { padding: scale(5) },
  modalScroll: { alignItems: 'center' },

  arabicContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: scale(18), borderRadius: scale(15), width: '100%', alignItems: 'center',
    marginBottom: verticalScale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  arabicText: {
    fontSize: rf(22), color: '#D4AF37', textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  divider: { width: scale(50), height: 2, backgroundColor: '#D4AF37', opacity: 0.5, marginBottom: verticalScale(20) },
  meaningTitle: { color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontSize: rf(11), letterSpacing: 2, marginBottom: verticalScale(10) },
  meaningText: { color: '#fff', fontSize: rf(15), textAlign: 'center', lineHeight: rf(22) }
});