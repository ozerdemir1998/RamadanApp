import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { CACHE_DURATIONS, getFromCache, setCache } from './cacheService';

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
  'sahurluk': ['Kahvaltılık', 'Sahur']
};

// Kategorideki tarifleri çek (1 saat cache)
export const fetchRecipesByCategory = async (categorySlug: string): Promise<Recipe[]> => {
  try {
    const cacheKey = `recipes_${categorySlug}`;
    const cached = await getFromCache<Recipe[]>(cacheKey, CACHE_DURATIONS.ONE_HOUR);
    if (cached) return cached;

    const targetCategories = CATEGORY_MAP[categorySlug];

    if (!targetCategories) {
      console.warn(`Kategori bulunamadı: ${categorySlug}`);
      return [];
    }

    const q = query(
      collection(db, 'recipes'),
      where('category', 'in', targetCategories),
      limit(50)
    );

    const snapshot = await getDocs(q);

    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Recipe));

    await setCache(cacheKey, recipes);
    return recipes;

  } catch (error) {
    console.error("Tarif çekme hatası:", error);
    return [];
  }
};

// Tekil tarif detayı çek (1 saat cache)
export const fetchRecipeDetail = async (recipeId: string): Promise<Recipe | null> => {
  try {
    const cacheKey = `recipe_detail_${recipeId}`;
    const cached = await getFromCache<Recipe>(cacheKey, CACHE_DURATIONS.ONE_HOUR);
    if (cached) return cached;

    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const recipe = {
        id: docSnap.id,
        ...docSnap.data()
      } as Recipe;

      await setCache(cacheKey, recipe);
      return recipe;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Detay çekme hatası:", error);
    return null;
  }
};

