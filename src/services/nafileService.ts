import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { CACHE_DURATIONS, getFromCache, setCache } from './cacheService';

export interface NafileNamaz {
    id: string;
    name: string;
    arabicName: string;
    shortDesc: string;
    time: string;
    virtue: string;
    howToPray: string;
}

export const fetchNafileNamazlar = async (): Promise<NafileNamaz[]> => {
    try {
        const cacheKey = 'nafile_namazlar';
        const cached = await getFromCache<NafileNamaz[]>(cacheKey, CACHE_DURATIONS.ONE_DAY);
        if (cached) return cached;

        const querySnapshot = await getDocs(collection(db, 'nafile_namazlar'));
        const result = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as NafileNamaz));

        await setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Nafile namazları çekilirken hata:", error);
        return [];
    }
};

export const fetchNafileDetail = async (id: string): Promise<NafileNamaz | null> => {
    try {
        // Önce cache'deki listeden bulmayı dene
        const cacheKey = 'nafile_namazlar';
        const cached = await getFromCache<NafileNamaz[]>(cacheKey, CACHE_DURATIONS.ONE_DAY);
        if (cached) {
            const found = cached.find(n => n.id === id);
            if (found) return found;
        }

        const docRef = doc(db, 'nafile_namazlar', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as NafileNamaz;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Nafile namaz detayı çekilirken hata:", error);
        return null;
    }
};

