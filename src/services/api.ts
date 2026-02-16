// src/services/api.ts

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Isha: string;
}

const BASE_URL = 'https://api.aladhan.com/v1';

// 1. Şehir İsmine Göre Getir (Yedek olarak kalsın)
export const getPrayerTimesByCity = async (city: string, country: string): Promise<PrayerTimes | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/timingsByCity?city=${city}&country=${country}&method=13`
    );
    const json = await response.json();
    return json.code === 200 ? json.data.timings : null;
  } catch (error) {
    console.error('API Hatası:', error);
    return null;
  }
};

// 2. Koordinata (GPS) Göre Getir (Ana fonksiyonumuz bu olacak)
export const getPrayerTimesByCoordinates = async (latitude: number, longitude: number): Promise<PrayerTimes | null> => {
  try {
    // Bugünkü tarihi alıyoruz (Unix Timestamp olarak)
    const date = Math.floor(Date.now() / 1000); 
    
    const response = await fetch(
      `${BASE_URL}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=13`
    );
    
    const json = await response.json();
    return json.code === 200 ? json.data.timings : null;
  } catch (error) {
    console.error('API Hatası (GPS):', error);
    return null;
  }
};

export const getCalendar = async (latitude: number, longitude: number): Promise<any[]> => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript'te aylar 0'dan başlar, o yüzden +1
    const year = now.getFullYear();

    // Method 13: Diyanet
    const response = await fetch(
      `${BASE_URL}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=13`
    );
    
    const json = await response.json();
    
    if (json.code === 200) {
      return json.data; // Bütün ayın listesi döner
    } else {
      return [];
    }
  } catch (error) {
    console.error('Takvim Hatası:', error);
    return [];
  }
};