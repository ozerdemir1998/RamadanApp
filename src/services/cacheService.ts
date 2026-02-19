// src/services/cacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@ramadan_cache_';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Verilen key ile cache'den veri çeker.
 * Eğer cache süresi dolmuşsa veya veri yoksa null döner.
 */
export const getFromCache = async <T>(key: string, maxAgeMs: number): Promise<T | null> => {
    try {
        const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;

        const entry: CacheEntry<T> = JSON.parse(raw);
        const now = Date.now();

        if (now - entry.timestamp > maxAgeMs) {
            // Cache süresi dolmuş
            return null;
        }

        return entry.data;
    } catch (error) {
        console.warn(`Cache read error for key "${key}":`, error);
        return null;
    }
};

/**
 * Veriyi cache'e yazar.
 */
export const setCache = async <T>(key: string, data: T): Promise<void> => {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
        console.warn(`Cache write error for key "${key}":`, error);
    }
};

/**
 * Belirli bir key'i cache'den siler.
 */
export const clearCache = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
        console.warn(`Cache clear error for key "${key}":`, error);
    }
};

/**
 * Tüm cache'i temizler.
 */
export const clearAllCache = async (): Promise<void> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
        if (cacheKeys.length > 0) {
            await AsyncStorage.multiRemove(cacheKeys);
        }
    } catch (error) {
        console.warn('Cache clear all error:', error);
    }
};

// Cache süreleri (ms cinsinden)
export const CACHE_DURATIONS = {
    ONE_HOUR: 60 * 60 * 1000,
    SIX_HOURS: 6 * 60 * 60 * 1000,
    TWELVE_HOURS: 12 * 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
};
