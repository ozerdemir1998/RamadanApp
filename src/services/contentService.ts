import { doc, getDoc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { app } from '../../src/config/firebaseConfig';
import { CACHE_DURATIONS, getFromCache, setCache } from './cacheService';

const db = getFirestore(app);

// --- TİP TANIMI ---
export interface DailyStory {
  id: string;
  type: 'ayet' | 'hadis' | 'dua';
  title: string;
  content: string;
  contentAR?: string;
  surah?: number;
  ayah?: number;
  subTitle?: string;
  icon?: string;
  color?: string;
}

// --- ANA FONKSİYON (Günlük cache) ---
export const fetchDailyContent = async (customDate?: string): Promise<DailyStory[]> => {
  try {
    let docId = customDate;

    if (!docId) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      docId = `${year}-${month}-${day}`;
    }

    // Günlük cache kontrolü
    const cacheKey = `daily_content_${docId}`;
    const cached = await getFromCache<DailyStory[]>(cacheKey, CACHE_DURATIONS.ONE_DAY);
    if (cached) return cached;

    const docRef = doc(db, 'daily_stories', docId);

    let docSnap;
    try {
      docSnap = await getDocFromServer(docRef);
    } catch (e) {
      docSnap = await getDoc(docRef);
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      const filteredStories = (data.stories as any[]).filter(s => s.type === 'ayet' || s.type === 'hadis');
      const result = filteredStories as DailyStory[];
      await setCache(cacheKey, result);
      return result;
    } else {
      return getFallbackData();
    }

  } catch (error) {
    console.error("❌ Firebase Veri Çekme Hatası:", error);
    return getFallbackData();
  }
};

// --- YEDEK VERİ ---
const getFallbackData = (): DailyStory[] => {
  return [
    {
      id: 'fallback-ayet',
      title: 'Günün Ayeti (Yedek)',
      content: '"Şüphesiz güçlükle beraber bir kolaylık vardır."',
      contentAR: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      subTitle: 'İnşirah Suresi, 5. Ayet',
      surah: 94,
      ayah: 5,
      type: 'ayet',
      color: '#2E8B57',
      icon: 'book'
    },
    {
      id: 'fallback-hadis',
      title: 'Günün Hadisi (Yedek)',
      content: '"Ameller niyetlere göredir. Herkes için niyet ettiği şey vardır."',
      contentAR: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
      subTitle: 'Buhari, Bed\'ü\'l-Vahy, 1',
      type: 'hadis',
      color: '#1E88E5',
      icon: 'chatbubbles'
    }
  ];
};