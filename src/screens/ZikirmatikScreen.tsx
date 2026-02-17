import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');
const ICON_PATTERN = require('../../assets/icons/pattern.png');

// --- TİPLER ---
interface Zikir {
  id: string;
  title: string;
  count: number; // Toplam çekilen zikir sayısı
  target?: number; // Opsiyonel hedef
}

// --- VARSAYILAN ZİKİRLER ---
const DEFAULT_ZIKIRS: Zikir[] = [
  { id: '1', title: 'Sübhanallah', count: 0 },
  { id: '2', title: 'Elhamdülillah', count: 0 },
  { id: '3', title: 'Allahuekber', count: 0 },
  { id: '4', title: 'La ilahe illallah', count: 0 },
  { id: '5', title: 'Estağfirullah', count: 0 },
  { id: '6', title: 'Salavat-ı Şerife', count: 0 },
  { id: '7', title: 'Hasbunallah ve ni\'mel vekil', count: 0 },
  { id: '8', title: 'La havle ve la kuvvete illa billah', count: 0 },
];

const STORAGE_KEY = '@zikirmatik_data_v1';
const ACTIVE_ZIKIR_KEY = '@zikirmatik_active_id_v1';

export default function ZikirmatikScreen({ onClose }: { onClose?: () => void }) {
  // GÖRÜNÜM MODU: SAYAÇ varsayılan
  const [viewMode, setViewMode] = useState<'LIST' | 'COUNTER'>('COUNTER');

  // VERİLER
  const [zikirs, setZikirs] = useState<Zikir[]>([]);
  const [activeZikirId, setActiveZikirId] = useState<string | null>(null);

  // SAYAÇ OTURUMU
  const [sessionCount, setSessionCount] = useState(0);

  // --- GESTURE DEFINITION ---
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Sadece aşağı kaydırmayı izle
      if (e.translationY > 100 && onClose) {
        runOnJS(onClose)();
      }
    });

  useEffect(() => {
    loadData();
  }, []);

  // --- VERİ YÖNETİMİ ---
  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      let loadedZikirs = DEFAULT_ZIKIRS;
      if (jsonValue != null) {
        loadedZikirs = JSON.parse(jsonValue);
        setZikirs(loadedZikirs);
      } else {
        setZikirs(DEFAULT_ZIKIRS);
      }

      // Son aktif zikri yükle veya ilkini seç
      const lastActiveId = await AsyncStorage.getItem(ACTIVE_ZIKIR_KEY);
      if (lastActiveId && loadedZikirs.find(z => z.id === lastActiveId)) {
        setActiveZikirId(lastActiveId);
      } else if (loadedZikirs.length > 0) {
        setActiveZikirId(loadedZikirs[0].id);
      }
    } catch (e) {
      console.error("Zikir datası yüklenemedi", e);
      setZikirs(DEFAULT_ZIKIRS);
      if (DEFAULT_ZIKIRS.length > 0) setActiveZikirId(DEFAULT_ZIKIRS[0].id);
    }
  };

  const saveData = async (newData: Zikir[]) => {
    try {
      setZikirs(newData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Zikir datası kaydedilemedi", e);
    }
  };

  // --- İŞLEMLER ---
  const openCounter = async (id: string) => {
    setActiveZikirId(id);
    await AsyncStorage.setItem(ACTIVE_ZIKIR_KEY, id);
    setSessionCount(0);
    setViewMode('COUNTER');
  };

  const handleCount = () => {
    setSessionCount(prev => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Sadece oturumu sıfırla
  const handleResetSession = () => {
    Alert.alert("Oturumu Sıfırla", "Sadece şu anki sayım sıfırlanacak.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sıfırla", onPress: () => {
          setSessionCount(0);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    ]);
  };

  // TOPLAM SAYIYI SIFIRLA (Yeni Özellik)
  const handleResetTotal = () => {
    if (!activeZikirId) return;
    Alert.alert("Toplamı Sıfırla", "Bu zikir için kaydedilmiş TÜM sayılar silinecek. Emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Evet, Sil", style: 'destructive', onPress: async () => {
          const updatedZikirs = zikirs.map(z => {
            if (z.id === activeZikirId) {
              return { ...z, count: 0 };
            }
            return z;
          });
          await saveData(updatedZikirs);
          setSessionCount(0); // Oturumu da sıfırla mantıken
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    ]);
  };

  const handleSaveAndExit = async () => {
    if (activeZikirId) {
      const updatedZikirs = zikirs.map(z => {
        if (z.id === activeZikirId) {
          return { ...z, count: z.count + sessionCount };
        }
        return z;
      });
      await saveData(updatedZikirs);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSessionCount(0); // Kaydettikten sonra oturumu sıfırla ki tekrar ekleme yapmasın
      //Alert.alert("Kaydedildi", "Zikir sayınız güncellendi.");
    }
  };

  // --- RENDER: SAYAÇ MODU ---
  const renderCounter = () => {
    const activeZikir = zikirs.find(z => z.id === activeZikirId);

    return (
      <View style={{ flex: 1, alignItems: 'center', width: '100%' }}>
        {/* YENİ HEADER: Sadece Aşağı Ok */}
        {/* Header - Sol: Kapat */}
        <View style={{ width: '100%', marginBottom: 10, marginTop: 20, paddingHorizontal: 20 }}>
          <ScreenHeader
            title="Zikirmatik"
            leftIcon="close"
            onLeftPress={onClose}
            centerTitle
          />
        </View>

        {/* Büyük Zikirmatik Gövdesi */}
        <View style={styles.bodyContainer}>
          {/* Dijital Ekran */}
          <View style={styles.screenFrame}>
            <View style={styles.screenInner}>
              <Text style={styles.countText}>{sessionCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5, marginTop: 8 }}>
              <Text style={styles.screenLabel}>BU OTURUM</Text>
              <Text style={[styles.screenLabel, { color: '#D4AF37' }]}>TOPLAM: {activeZikir ? activeZikir.count + sessionCount : 0}</Text>
            </View>
          </View>

          {/* Buton */}
          <View style={styles.controls}>
            <View style={styles.buttonRing}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.bigButton}
                onPress={handleCount}
              >
                <LinearGradient
                  colors={['#D4AF37', '#B8860B']}
                  style={styles.buttonGradient}
                >
                  <View style={styles.innerButtonShine} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset & Save Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Sadece Oturumu Sıfırla */}
            <TouchableOpacity style={styles.smallCircleButton} onPress={handleResetSession}>
              <MaterialCommunityIcons name="refresh" size={24} color="#D4AF37" />
            </TouchableOpacity>

            {/* Toplamı Sıfırla (Çöp Kutusu) */}
            <TouchableOpacity style={[styles.smallCircleButton, { borderColor: 'rgba(231, 76, 60, 0.5)' }]} onPress={handleResetTotal}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>

            {/* Kaydet */}
            <TouchableOpacity style={[styles.smallCircleButton, { backgroundColor: 'rgba(212, 175, 55, 0.2)', borderColor: '#D4AF37' }]} onPress={handleSaveAndExit}>
              <MaterialCommunityIcons name="content-save" size={24} color="#D4AF37" />
              <Text style={{ position: 'absolute', bottom: -18, color: '#D4AF37', fontSize: 9, fontWeight: 'bold' }}>KAYDET</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* ZİKİR SEÇİM ÇUBUĞU (YENİ) */}
        <TouchableOpacity
          style={styles.selectionBar}
          onPress={() => setViewMode('LIST')}
          activeOpacity={0.8}
        >
          <View style={styles.selectionBarIcon}>
            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#000" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectionBarLabel}>SEÇİLİ ZİKİR</Text>
            <Text style={styles.selectionBarTitle} numberOfLines={1}>{activeZikir?.title}</Text>
          </View>
          <Ionicons name="chevron-up" size={20} color="#D4AF37" />
        </TouchableOpacity>

        <Text style={styles.hint}>Saymak için butona, kaydetmek için diske basın</Text>
      </View>
    );
  };

  // --- RENDER: LİSTE MODU ---
  const renderList = () => {
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <View style={{ marginTop: 20, marginHorizontal: 20 }}>
          <ScreenHeader
            title="Zikirlerim"
            onLeftPress={() => setViewMode('COUNTER')} // Geri dön counter'a
            leftIcon="back"
            centerTitle
          />
        </View>

        <FlatList
          data={zikirs}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.zikirItem, activeZikirId === item.id && styles.activeZikirItem]} onPress={() => openCounter(item.id)} activeOpacity={0.7}>
              <View style={styles.zikirIconBox}>
                <Text style={styles.zikirInitial}>{item.title.charAt(0)}</Text>
              </View>
              <View style={styles.zikirInfo}>
                <Text style={styles.zikirTitle}>{item.title}</Text>
                <Text style={styles.zikirCount}>Toplam: <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>{item.count}</Text></Text>
              </View>
              {activeZikirId === item.id && (
                <View style={styles.activeIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={styles.container}
      >
        <View style={styles.backgroundPatternContainer} pointerEvents="none">
          <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
          <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
        </View>

        <SafeAreaView style={{ flex: 1, alignItems: 'center', width: '100%' }} edges={['top']}>
          {viewMode === 'LIST' ? renderList() : renderCounter()}
        </SafeAreaView>
      </LinearGradient>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 0 },

  // ARKAPLAN DESENİ
  backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

  // HEADER ICON
  iconButton: { padding: 5 },



  // --- LİSTE STİLLERİ ---
  zikirItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  activeZikirItem: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.05)'
  },
  zikirIconBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
    borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  zikirInitial: { fontSize: 24, fontWeight: 'bold', color: '#D4AF37' },
  zikirInfo: { flex: 1 },
  zikirTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 4 },
  zikirCount: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  playButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  activeIndicator: { marginLeft: 10 },


  // --- SAYAÇ GÖVDE ---
  bodyContainer: {
    width: width * 0.85,
    height: width * 1.25, // Biraz daha uzun
    backgroundColor: 'rgba(255,255,255,0.05)', // Hafif cam efekti
    borderRadius: 50,
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)', // Altın Çerçeve
    justifyContent: 'space-between',
    paddingVertical: 30
  },

  // EKRAN
  screenFrame: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  screenInner: {
    width: '100%',
    height: 110,
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
    fontSize: 70,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.8)', // Neon Glow
    textShadowRadius: 15,
    fontWeight: 'bold'
  },
  screenLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: 'bold'
  },

  // BUTON ALANI
  controls: { alignItems: 'center', justifyContent: 'center', flex: 1 },

  buttonRing: {
    width: 200, height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  bigButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700'
  },
  innerButtonShine: {
    width: 140, height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'transparent'
  },

  // ACTION BUTTONS
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0 // Biraz daha daralt
  },
  // LIST BUTTON (NEW)
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  // SELECTION BAR
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: width * 0.85,
    padding: 12,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  selectionBarIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#D4AF37',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  selectionBarLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 2 },
  selectionBarTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  listButtonText: {
    fontSize: 12, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1
  },

  smallCircleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },

  hint: { marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }
});