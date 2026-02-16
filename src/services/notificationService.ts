// src/services/notificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTimes } from './api';

// 1. BİLDİRİM HANDLER
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 2. İZİN İSTEME VE KANAL AYARLARI
export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Bildirim izni verilmedi!');
    return false;
  }

  // Android için ÖZEL KANAL ayarı (Ezan Sesi ile)
  if (Platform.OS === 'android') {
    // Önceki kanalı sil (Gerekirse, kanal ayarlarını güncellemek için)
    await Notifications.deleteNotificationChannelAsync('ezan-channel');

    await Notifications.setNotificationChannelAsync('ezan-channel', {
      name: 'Ezan Vakti',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'ezan.wav', // app.json'da tanımlanan dosya adı
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Rahatsız Etmeyin modunu del (İzin verilirse)
    });
  }
  
  return true;
}

// 3. AYAR TİPLERİ VE DEĞİŞKENLER
export const STORAGE_KEY = '@prayer_alarms';

export type AlarmSettings = {
  [key: string]: {
    enabled: boolean;
    offset: number; 
  };
};

export const defaultSettings: AlarmSettings = {
  Imsak: { enabled: false, offset: 0 },
  Gunes: { enabled: false, offset: 0 },
  Ogle: { enabled: false, offset: 0 },
  Ikindi: { enabled: false, offset: 0 },
  Aksam: { enabled: false, offset: 0 },
  Yatsa: { enabled: false, offset: 0 },
};

const API_MAPPING: { [key: string]: keyof PrayerTimes } = {
    Imsak: 'Fajr',
    Gunes: 'Sunrise',
    Ogle: 'Dhuhr',
    Ikindi: 'Asr',
    Aksam: 'Sunset',
    Yatsa: 'Isha'
};

// 4. BİLDİRİMLERİ ZAMANLA (ANA FONKSİYON)
export async function schedulePrayerNotifications(times: PrayerTimes) {
  // Önceki planlanmış tüm bildirimleri temizle
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Ayarları çek
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const settings: AlarmSettings = saved ? JSON.parse(saved) : defaultSettings;

  const vakitIsimleri = Object.keys(API_MAPPING);
  const now = new Date();

  for (const vakit of vakitIsimleri) {
    const setting = settings[vakit];
    const apiKey = API_MAPPING[vakit];
    const timeString = times[apiKey]; 

    if (setting && setting.enabled && timeString) {
      const cleanTime = timeString.split(' ')[0];
      const [hourStr, minStr] = cleanTime.split(':');
      
      let triggerDate = new Date();
      triggerDate.setHours(parseInt(hourStr), parseInt(minStr), 0, 0);

      // Ofseti düş (örn: 15 dk önce)
      triggerDate.setMinutes(triggerDate.getMinutes() - setting.offset);

      // Eğer vakit geçmişse, yarına planla
      if (triggerDate <= now) {
          triggerDate.setDate(triggerDate.getDate() + 1);
      }

      // Mesajı hazırla
      let bodyText = `${vakit} ezanı okunuyor.`;
      if (setting.offset > 0) {
        bodyText = `${vakit} vaktine ${setting.offset} dakika kaldı.`;
      } else {
        bodyText = `${vakit} vakti girdi. Allah kabul etsin.`;
      }

      // TETİKLEYİCİ (Daily Trigger - Her gün aynı saatte)
      // DÜZELTME: 'type' özelliği eklendi ve CalendarTriggerInput olarak tip tanımlandı.
      const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true, 
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Vakit Hatırlatması",
          body: bodyText,
          sound: 'ezan.wav', // iOS için ses dosyası
          data: { url: '/namaz' },
        },
        trigger,
      });
    }
  }
  console.log("✅ Bildirimler ezan sesiyle planlandı.");
}