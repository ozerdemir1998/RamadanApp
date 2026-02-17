import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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
        const querySnapshot = await getDocs(collection(db, 'nafile_namazlar'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as NafileNamaz));
    } catch (error) {
        console.error("Nafile namazları çekilirken hata:", error);
        return [];
    }
};

export const fetchNafileDetail = async (id: string): Promise<NafileNamaz | null> => {
    try {
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
