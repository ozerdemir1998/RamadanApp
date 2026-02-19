import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { ESMAUL_HUSNA, Esma } from '../data/esmaulHusnaData';
import { CACHE_DURATIONS, getFromCache, setCache } from './cacheService';

const COLLECTION_NAME = 'esmaul_husna';

export const getEsmaulHusna = async (): Promise<Esma[]> => {
    try {
        // Önce cache kontrol
        const cacheKey = 'esmaul_husna';
        const cached = await getFromCache<Esma[]>(cacheKey, CACHE_DURATIONS.ONE_DAY);
        if (cached) return cached;

        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        if (querySnapshot.empty) {

            await seedEsmaulHusna();
            return ESMAUL_HUSNA;
        }

        const esmaList: Esma[] = [];
        querySnapshot.forEach((doc) => {
            esmaList.push(doc.data() as Esma);
        });

        // Sort by ID to ensure correct order
        const sorted = esmaList.sort((a, b) => a.id - b.id);
        await setCache(cacheKey, sorted);
        return sorted;
    } catch (error) {
        console.error("Error fetching Esmaul Husna:", error);
        return ESMAUL_HUSNA; // Fallback to local data
    }
};

export const seedEsmaulHusna = async () => {
    try {
        const batch = writeBatch(db);

        ESMAUL_HUSNA.forEach((esma) => {
            const docRef = doc(db, COLLECTION_NAME, esma.id.toString());
            batch.set(docRef, esma);
        });

        await batch.commit();

    } catch (error) {
        console.error("Error seeding Esmaul Husna:", error);
    }
};

