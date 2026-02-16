import { PrayerTimes } from '@/services/api';
import { useEffect, useState } from 'react';

export const useNextPrayer = (times: PrayerTimes | null) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [nextPrayerName, setNextPrayerName] = useState('');
  const [isIftar, setIsIftar] = useState(false); // Sıradaki vakit Akşam mı? (Tema değişimi için)

  useEffect(() => {
    if (!times) return;

    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    calculateTimeLeft(); // İlk başta hemen çalıştır

    return () => clearInterval(interval);
  }, [times]);

  const calculateTimeLeft = () => {
    if (!times) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Dakika cinsinden şu an

    // Vakitleri dakika cinsine çeviren yardımcı fonksiyon
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const prayerList = [
      { name: 'İmsak', time: toMinutes(times.Fajr), original: times.Fajr },
      { name: 'Güneş', time: toMinutes(times.Sunrise), original: times.Sunrise },
      { name: 'Öğle', time: toMinutes(times.Dhuhr), original: times.Dhuhr },
      { name: 'İkindi', time: toMinutes(times.Asr), original: times.Asr },
      { name: 'Akşam', time: toMinutes(times.Sunset), original: times.Sunset }, // İftar
      { name: 'Yatsı', time: toMinutes(times.Isha), original: times.Isha },
    ];

    // Sıradaki vakti bul
    let nextPrayer = prayerList.find(p => p.time > currentTime);

    // Eğer Yatsı'dan sonraysa (nextPrayer yoksa), sıradaki vakit yarınki İmsak'tır.
    // (Basitlik için bugünkü İmsak süresini baz alıp 24 saat ekliyoruz)
    let targetTimeMinutes = 0;
    
    if (!nextPrayer) {
      nextPrayer = prayerList[0]; // İmsak
      targetTimeMinutes = nextPrayer.time + (24 * 60); // Yarına sarkıt
    } else {
      targetTimeMinutes = nextPrayer.time;
    }

    // Kalan süreyi hesapla
    const diffMinutes = targetTimeMinutes - currentTime;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const seconds = 59 - now.getSeconds(); // Saniye hassasiyeti için

    // Ekranda görünecek format (02:14:55 gibi)
    const format = (num: number) => num.toString().padStart(2, '0');
    
    setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    setNextPrayerName(nextPrayer.name);
    setIsIftar(nextPrayer.name === 'Akşam'); // Eğer hedef Akşam ise İftar moduna gir
  };

  return { timeLeft, nextPrayerName, isIftar };
};