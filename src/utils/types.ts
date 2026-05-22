export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  source: 'default' | 'nearby' | 'custom';
  address?: string;
  distance?: number;
  category?: string;
  location?: {
    lng: number;
    lat: number;
  };
}

export interface UserLocation {
  lng: number;
  lat: number;
  address: string;
}

export interface LocationCache {
  foods: FoodItem[];
  location: UserLocation;
  timestamp: number;
}

export type DataSource = 'nearby' | 'default' | 'custom';
export type LocationStatus = 'loading' | 'success' | 'failed' | 'idle';

export interface AppState {
  foods: FoodItem[];
  isSpinning: boolean;
  lastResult: FoodItem | null;
  dataSource: DataSource;
  userLocation: UserLocation | null;
  locationStatus: LocationStatus;
}