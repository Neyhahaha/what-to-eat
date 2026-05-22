import { create } from 'zustand';
import type { FoodItem, DataSource, LocationStatus, UserLocation } from '@/utils/types';
import { DEFAULT_FOODS } from '@/utils/foodData';
import {
  loadFoods,
  saveFoods,
  loadNearbyCache,
  saveNearbyCache,
  loadDataSource,
  saveDataSource,
  generateId,
} from '@/utils/storage';
import { discoverNearbyFoods, isAmapConfigured } from '@/utils/places';

interface Store {
  foods: FoodItem[];
  isSpinning: boolean;
  lastResult: FoodItem | null;
  dataSource: DataSource;
  userLocation: UserLocation | null;
  locationStatus: LocationStatus;
  locationError: string;
  showResult: boolean;
  showPanel: boolean;

  setSpinning: (v: boolean) => void;
  setLastResult: (v: FoodItem | null) => void;
  setShowResult: (v: boolean) => void;
  setShowPanel: (v: boolean) => void;
  setDataSource: (v: DataSource) => void;
  setFoods: (v: FoodItem[]) => void;
  addFood: (name: string) => void;
  removeFood: (id: string) => void;
  resetFoods: () => void;
  initLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  foods: DEFAULT_FOODS,
  isSpinning: false,
  lastResult: null,
  dataSource: loadDataSource(),
  userLocation: null,
  locationStatus: 'idle',
  locationError: '',
  showResult: false,
  showPanel: false,

  setSpinning: (v) => set({ isSpinning: v }),
  setLastResult: (v) => set({ lastResult: v }),
  setShowResult: (v) => set({ showResult: v }),
  setShowPanel: (v) => set({ showPanel: v }),

  setDataSource: (source) => {
    const { dataSource } = get();
    if (source === dataSource) return;

    saveDataSource(source);
    if (source === 'default') {
      const customFoods = loadFoods();
      set({ dataSource: source, foods: customFoods.length > 0 ? customFoods : DEFAULT_FOODS });
    } else if (source === 'nearby') {
      const cache = loadNearbyCache();
      if (cache) {
        set({ dataSource: source, foods: cache.foods, userLocation: cache.location, locationStatus: 'success' });
      }
    } else if (source === 'custom') {
      const custom = loadFoods();
      set({ dataSource: source, foods: custom.length > 0 ? custom : DEFAULT_FOODS });
    }
  },

  setFoods: (foods) => {
    set({ foods });
    if (get().dataSource === 'custom') {
      saveFoods(foods);
    }
  },

  addFood: (name) => {
    const { foods } = get();
    if (!name.trim() || foods.length >= 20) return;
    const newItem: FoodItem = {
      id: generateId(),
      name: name.trim(),
      emoji: '🍽️',
      source: 'custom',
    };
    const updated = [...foods, newItem];
    set({ foods: updated, dataSource: 'custom' });
    saveDataSource('custom');
    saveFoods(updated);
  },

  removeFood: (id) => {
    const { foods } = get();
    if (foods.length <= 2) return;
    const updated = foods.filter((f) => f.id !== id);
    set({ foods: updated, dataSource: 'custom' });
    saveDataSource('custom');
    saveFoods(updated);
  },

  resetFoods: () => {
    set({ foods: DEFAULT_FOODS, dataSource: 'default' });
    saveDataSource('default');
    saveFoods([]);
  },

  initLocation: async () => {
    set({ locationStatus: 'loading', locationError: '' });

    if (isAmapConfigured()) {
      const cache = loadNearbyCache();
      if (cache) {
        set({
          locationStatus: 'success',
          userLocation: cache.location,
          foods: cache.foods,
          locationError: '',
        });
        return;
      }
    }

    try {
      const result = await discoverNearbyFoods();
      saveNearbyCache({
        foods: result.foods,
        location: result.location,
        timestamp: Date.now(),
      });
      set({
        locationStatus: 'success',
        userLocation: result.location,
        foods: result.foods,
        dataSource: 'nearby',
        locationError: '',
      });
      saveDataSource('nearby');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '定位失败';
      console.error('[定位] 周边搜索失败:', msg);
      set({ locationStatus: 'failed', locationError: msg });
      const customFoods = loadFoods();
      if (customFoods.length > 0) {
        set({ foods: customFoods, dataSource: 'custom' });
        saveDataSource('custom');
      } else {
        set({ foods: DEFAULT_FOODS, dataSource: 'default' });
        saveDataSource('default');
      }
    }
  },

  refreshLocation: async () => {
    set({ locationStatus: 'loading', locationError: '' });
    try {
      const result = await discoverNearbyFoods();
      saveNearbyCache({
        foods: result.foods,
        location: result.location,
        timestamp: Date.now(),
      });
      set({
        locationStatus: 'success',
        userLocation: result.location,
        foods: result.foods,
        dataSource: 'nearby',
        locationError: '',
      });
      saveDataSource('nearby');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '刷新失败';
      console.error('[定位] 刷新周边失败:', msg);
      set({ locationStatus: 'failed', locationError: msg });
    }
  },
}));