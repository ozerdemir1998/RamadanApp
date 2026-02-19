import axios from 'axios';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';
import { CACHE_DURATIONS, getFromCache, setCache } from './cacheService';

const db = getFirestore(app);

const BASE_URL = 'https://api.alquran.cloud/v1';

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

export interface Ayah {
    number: number;
    numberInSurah: number;
    text: string; // Arabic
    translation: string; // Turkish
    audio: string; // URL
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean;
}

export const quranService = {
    // Firebase'den Türkçe Sure İsimlerini Çek (7 gün cache)
    async getSurahNamesMap(): Promise<Record<number, string>> {
        try {
            const cacheKey = 'surah_names_map';
            const cached = await getFromCache<Record<number, string>>(cacheKey, CACHE_DURATIONS.ONE_WEEK);
            if (cached) return cached;

            const querySnapshot = await getDocs(collection(db, "surah_names"));
            const namesMap: Record<number, string> = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.id && data.name) {
                    namesMap[data.id] = data.name;
                }
            });

            await setCache(cacheKey, namesMap);
            return namesMap;
        } catch (error) {
            console.error("Error fetching surah names from Firebase:", error);
            return {};
        }
    },

    // Tüm Sureleri Listele (1 gün cache)
    async getSurahs(): Promise<Surah[]> {
        try {
            const cacheKey = 'surah_list';
            const cached = await getFromCache<Surah[]>(cacheKey, CACHE_DURATIONS.ONE_DAY);
            if (cached) return cached;

            const response = await axios.get(`${BASE_URL}/surah`);
            const data = response.data.data;

            await setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching surahs:', error);
            return [];
        }
    },

    // Sure Detayını Getir (Arapça + Türkçe + Ses) - 1 gün cache
    async getSurahDetails(surahNumber: number): Promise<Ayah[]> {
        try {
            const cacheKey = `surah_detail_${surahNumber}`;
            const cached = await getFromCache<Ayah[]>(cacheKey, CACHE_DURATIONS.ONE_DAY);
            if (cached) return cached;

            const response = await axios.get(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,tr.diyanet,ar.alafasy`);
            const data = response.data.data;

            const arabicData = data.find((d: any) => d.edition.identifier === 'quran-uthmani');
            const translationData = data.find((d: any) => d.edition.identifier === 'tr.diyanet');
            const audioData = data.find((d: any) => d.edition.identifier === 'ar.alafasy');

            if (!arabicData || !translationData || !audioData) {
                throw new Error('Eksik veri');
            }

            const ayahs: Ayah[] = arabicData.ayahs.map((ayah: any, index: number) => {
                return {
                    number: ayah.number,
                    numberInSurah: ayah.numberInSurah,
                    text: ayah.text,
                    translation: translationData.ayahs[index].text,
                    audio: audioData.ayahs[index].audio,
                    juz: ayah.juz,
                    manzil: ayah.manzil,
                    page: ayah.page,
                    ruku: ayah.ruku,
                    hizbQuarter: ayah.hizbQuarter,
                    sajda: ayah.sajda,
                };
            });

            await setCache(cacheKey, ayahs);
            return ayahs;

        } catch (error) {
            console.error(`Error fetching details for surah ${surahNumber}:`, error);
            return [];
        }
    }
};
