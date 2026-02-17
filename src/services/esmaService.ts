import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { ESMAUL_HUSNA, Esma } from '../data/esmaulHusnaData';

const COLLECTION_NAME = 'esmaul_husna';

export const getEsmaulHusna = async (): Promise<Esma[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        if (querySnapshot.empty) {
            console.log('Esmaul Husna collection is empty. Seeding...');
            await seedEsmaulHusna();
            return ESMAUL_HUSNA; // Return local data while seeding (or after seeding)
        }

        const esmaList: Esma[] = [];
        querySnapshot.forEach((doc) => {
            esmaList.push(doc.data() as Esma);
        });

        console.log(`Successfully fetched ${esmaList.length} Esmas from Firebase!`);

        // Sort by ID to ensure correct order
        return esmaList.sort((a, b) => a.id - b.id);
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
        console.log('Esmaul Husna seeded successfully!');
    } catch (error) {
        console.error("Error seeding Esmaul Husna:", error);
    }
};

// Helper for Home Screen to get a random one (from cached list if possible to save reads, but here we fetch all once potentially)
// For optimization, we might store the list in a context or global store, but for now fetching is fine or passing from parent.
