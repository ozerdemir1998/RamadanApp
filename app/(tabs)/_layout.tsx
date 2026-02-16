import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// İkon ve Altın Çizgi Bileşeni (Sizin Orijinal Kodunuz)
const TabIconWithLine = ({ name, focused, color }: { name: keyof typeof Ionicons.glyphMap, focused: boolean, color: string }) => {
  return (
    <View style={styles.iconContainer}>
      {/* İkon */}
      <Ionicons name={name} size={24} color={color} />

      {/* Sadece aktifse (focused) beliren Altın Çizgi */}
      {focused && <View style={styles.underline} />}
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // --- TAM EKRAN MODU AYARLARI ---
  useEffect(() => {
    async function setFullScreen() {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setBackgroundColorAsync("#00000000");
      }
    }
    setFullScreen();
  }, []);

  return (
    <>
      <StatusBar hidden={true} style="light" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false, // Yazıları Gizle

          // Renkler
          tabBarActiveTintColor: '#D4AF37', // Aktif İkon Rengi (Altın)
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)', // Pasif İkon Rengi (Soluk)

          // Tab Bar Stili (Koyu Tema)
          tabBarStyle: {
            backgroundColor: '#0F2027', // Arka plan: Koyu Petrol Mavisi
            borderTopWidth: 0, // Üstteki gri çizgiyi kaldır

            position: 'absolute', // İçerik üzerinde yüzmesi için
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,

            // --- GÜNCELLENEN KISIM: SABİT YÜKSEKLİK VE BOŞLUK ---
            height: 70, // Dinamik hesaplama yerine sabit ince yükseklik
            paddingBottom: 10, // Alt boşluk sabitlendi (insets kaldırıldı)
            paddingTop: 10, // İkonları ortalamak için üst boşluk
          },
        }}
      >
        {/* 1. Ana Sayfa (home) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithLine name="home" focused={focused} color={color} />
            ),
          }}
        />

        {/* 2. İmsakiye (calendar) */}
        <Tabs.Screen
          name="imsakiye"
          options={{
            title: 'İmsakiye',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithLine name="calendar" focused={focused} color={color} />
            ),
          }}
        />
        {/* 3. Kuran (book) */}
        <Tabs.Screen
          name="quran"
          options={{
            title: 'Kuran',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithLine name="book" focused={focused} color={color} />
            ),
          }}
        />

        {/* 5. Yaşam (leaf) */}
        <Tabs.Screen
          name="life"
          options={{
            title: 'Yaşam',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithLine name="leaf" focused={focused} color={color} />
            ),
          }}
        />

        {/* 6. Bildirimler (notifications) */}
        <Tabs.Screen
          name="alarms"
          options={{
            title: 'Bildirimler',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithLine name="notifications" focused={focused} color={color} />
            ),
          }}
        />

        {/* 6. Diğer (menu) */}
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Diğer',
            tabBarIcon: ({ color, focused }) => (
              <TabIconWithLine name="menu" focused={focused} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 50,
    gap: 6, // İkon ile çizgi arasındaki mesafe
  },
  underline: {
    width: 20,      // Çizgi genişliği
    height: 3,      // Çizgi kalınlığı
    backgroundColor: '#D4AF37', // Altın Rengi
    borderRadius: 2, // Kenarları yumuşat
  },
});