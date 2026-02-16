import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface Recipe {
  id: string;
  category: string;
  title: string;
  image: string;
  ingredients: string[];
  instructions: string;
}

// Kategori eşleştirmesi (Slug -> DB'deki Kategori İsmi)
const CATEGORY_MAP: { [key: string]: string[] } = {
  'corbalar': ['Çorbalar'],
  'ana_yemek': ['Et yemekleri'],
  'tavuk_yemekleri': ['Tavuk'],
  'ara_sicak': ['Ara sıcak'],
  'sebze': ['Sebze', 'Zeytinyağlı'],
  'salata': ['Salata'],
  'karbonhidrat': ['Makarna', 'Pilav', 'Hamur İşi', 'Börek'],
  'tatlilar': ['Tatlılar'],
  'sahurluk': ['Kahvaltılık', 'Sahur'] // Veride yoksa boş döner
};

// Kategorideki tarifleri çek
export const fetchRecipesByCategory = async (categorySlug: string): Promise<Recipe[]> => {
  try {
    const targetCategories = CATEGORY_MAP[categorySlug];

    if (!targetCategories) {
      console.warn(`Kategori bulunamadı: ${categorySlug}`);
      return [];
    }

    // 'in' operatörü ile birden fazla kategori çekebiliriz (Sebze + Salata gibi)
    const q = query(
      collection(db, 'recipes'),
      where('category', 'in', targetCategories),
      limit(50)
    );

    const snapshot = await getDocs(q);

    // Sadece DB verisini döndür, API çağrısı yapma
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Recipe));

  } catch (error) {
    console.error("Tarif çekme hatası:", error);
    return [];
  }
};

// Tekil tarif detayı çek
export const fetchRecipeDetail = async (recipeId: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Sadece DB verisini döndür
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Recipe;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Detay çekme hatası:", error);
    return null;
  }
};
