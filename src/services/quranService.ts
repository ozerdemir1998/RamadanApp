import axios from 'axios';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

const db = getFirestore(app);

const BASE_URL = 'http://api.alquran.cloud/v1';

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
    // Firebase'den Türkçe Sure İsimlerini Çek
    async getSurahNamesMap(): Promise<Record<number, string>> {
        try {
            const querySnapshot = await getDocs(collection(db, "surah_names"));
            const namesMap: Record<number, string> = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.id && data.name) {
                    namesMap[data.id] = data.name;
                }
            });
            return namesMap;
        } catch (error) {
            console.error("Error fetching surah names from Firebase:", error);
            return {};
        }
    },

    // Tüm Sureleri Listele
    async getSurahs(): Promise<Surah[]> {
        try {
            const response = await axios.get(`${BASE_URL}/surah`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching surahs:', error);
            return [];
        }
    },

    // Sure Detayını Getir (Arapça + Türkçe + Ses)
    async getSurahDetails(surahNumber: number): Promise<Ayah[]> {
        try {
            // 3 farklı edisyonu aynı anda çekiyoruz:
            // 1. quran-uthmani (Arapça Metin)
            // 2. tr.diyanet (Türkçe Meal)
            // 3. ar.alafasy (Ses - Ayet Ayet)
            const response = await axios.get(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,tr.diyanet,ar.alafasy`);
            const data = response.data.data;

            // Data array içinde 3 obje döner. Sıralamayı garanti edelim veya edisyon adına göre bulalım.
            const arabicData = data.find((d: any) => d.edition.identifier === 'quran-uthmani');
            const translationData = data.find((d: any) => d.edition.identifier === 'tr.diyanet');
            const audioData = data.find((d: any) => d.edition.identifier === 'ar.alafasy');

            if (!arabicData || !translationData || !audioData) {
                throw new Error('Eksik veri');
            }

            // Verileri birleştirip tek bir Ayah listesi oluşturalım
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

            return ayahs;

        } catch (error) {
            console.error(`Error fetching details for surah ${surahNumber}:`, error);
            return [];
        }
    }
};
