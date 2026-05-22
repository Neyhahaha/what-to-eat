import type { FoodItem, LocationCache, DataSource } from './types';

const FOODS_KEY = 'what-to-eat-foods';
const NEARBY_CACHE_KEY = 'what-to-eat-nearby-cache-v2';
const DATA_SOURCE_KEY = 'what-to-eat-data-source';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function loadFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(FOODS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // corrupted data
  }
  return [];
}

export function saveFoods(foods: FoodItem[]): void {
  localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
}

export function loadNearbyCache(): LocationCache | null {
  try {
    const raw = localStorage.getItem(NEARBY_CACHE_KEY);
    if (!raw) return null;
    const cache: LocationCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      localStorage.removeItem(NEARBY_CACHE_KEY);
      return null;
    }
    return cache;
  } catch {
    localStorage.removeItem(NEARBY_CACHE_KEY);
    return null;
  }
}

export function saveNearbyCache(cache: LocationCache): void {
  localStorage.setItem(NEARBY_CACHE_KEY, JSON.stringify(cache));
}

export function loadDataSource(): DataSource {
  try {
    const raw = localStorage.getItem(DATA_SOURCE_KEY);
    if (raw === 'nearby' || raw === 'default' || raw === 'custom') {
      return raw;
    }
  } catch {
    // ignore
  }
  return 'default';
}

export function saveDataSource(source: DataSource): void {
  localStorage.setItem(DATA_SOURCE_KEY, source);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}