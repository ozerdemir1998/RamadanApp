import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../src/config/firebaseConfig';

const db = getFirestore(app);

// --- TİP TANIMI ---
export interface DailyStory {
  id: string;
  type: 'ayet' | 'hadis' | 'dua'; // Sadece Ayet ve Hadis dinamik, Dua sabit
  title: string;
  content: string; // Turkish text
  contentAR?: string; // Arabic text
  surah?: number; // For Ayet: Sure No
  ayah?: number; // For Ayet: Ayet No
  subTitle?: string; // Ek bilgi (örn: Bakara Suresi, 183. Ayet)
  icon?: string;
  color?: string;
}

// --- ANA FONKSİYON ---
export const fetchDailyContent = async (customDate?: string): Promise<DailyStory[]> => {
  try {
    let docId = customDate;

    if (!docId) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      // Doküman ID: YYYY-MM-DD
      docId = `${year}-${month}-${day}`;
    }

    console.log(`🔥 Firebase'den veri çekiliyor: ${docId}`);

    const docRef = doc(db, 'daily_stories', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Gelen veriyi filtrele: Sadece 'ayet' ve 'hadis' tiplerini al
      const filteredStories = (data.stories as any[]).filter(s => s.type === 'ayet' || s.type === 'hadis');
      return filteredStories as DailyStory[];
    } else {
      console.warn(`⚠️ Bugüne (${docId}) ait veri bulunamadı, yedek dönülüyor.`);
      return getFallbackData();
    }

  } catch (error) {
    console.error("❌ Firebase Veri Çekme Hatası:", error);
    return getFallbackData();
  }
};

// --- YEDEK VERİ (Database boşsa veya internet yoksa) ---
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