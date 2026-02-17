
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface FavoriteRecipe {
    id: string;
    title: string;
    image: string;
    // Gelecekte başka alanlar da eklenebilir (kategori, süre vs.)
}

interface FavoritesContextData {
    favorites: FavoriteRecipe[];
    toggleFavorite: (recipe: FavoriteRecipe) => void;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({
    favorites: [],
    toggleFavorite: () => { },
    isFavorite: () => false,
});

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
    const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

    // Uygulama açılınca favorileri yükle
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('@favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (e) {
            console.error("Favoriler yüklenirken hata:", e);
        }
    };

    const saveFavorites = async (newFavorites: FavoriteRecipe[]) => {
        try {
            await AsyncStorage.setItem('@favorites', JSON.stringify(newFavorites));
        } catch (e) {
            console.error("Favoriler kaydedilirken hata:", e);
        }
    };

    const toggleFavorite = (recipe: FavoriteRecipe) => {
        let updatedFavorites;
        if (isFavorite(recipe.id)) {
            // Çıkar
            updatedFavorites = favorites.filter(fav => fav.id !== recipe.id);
        } else {
            // Ekle
            updatedFavorites = [...favorites, recipe];
        }
        setFavorites(updatedFavorites);
        saveFavorites(updatedFavorites);
    };

    const isFavorite = (id: string) => {
        return favorites.some(fav => fav.id === id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
