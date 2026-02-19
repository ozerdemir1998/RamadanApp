// src/services/notificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTimes } from './api';

// Expo Go SDK 53+ push notification desteğini kaldırdı.
// Handler ayarını try-catch ile sarmalayarak hata durumunda çökmeyi önlüyoruz.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Bildirim handler ayarlanamadı:', e);
}

// 2. İZİN İSTEME VE KANAL AYARLARI
export async function registerForPushNotificationsAsync() {
  if (!Notifications) return false;
  try {
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
      await Notifications.deleteNotificationChannelAsync('ezan-channel');
      await Notifications.setNotificationChannelAsync('ezan-channel', {
        name: 'Ezan Vakti',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
        sound: 'ezan.wav',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }

    return true;
  } catch (e) {
    console.warn('Bildirim kaydı başarısız:', e);
    return false;
  }
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
  if (!Notifications) return;
  try {
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

        const trigger: Notifications.DailyTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Vakit Hatırlatması",
            body: bodyText,
            sound: 'ezan.wav',
            data: { url: '/namaz' },
          },
          trigger,
        });
      }
    }
    console.log("✅ Bildirimler ezan sesiyle planlandı.");
  } catch (e) {
    console.warn('Bildirim zamanlama başarısız:', e);
  }
}