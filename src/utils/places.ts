import type { FoodItem, UserLocation } from './types';
import { getEmojiForCategory } from './foodData';

const AMAP_KEY: string = 'e4c5bfcd2c1c948cf2abcea67fb86cc2';
const SEARCH_RADIUS = 3000;
const RESULT_LIMIT = 20;
const POI_TYPES = '050100|050200|050300|050400|050500|050600|050700|050800';

const FOOD_TYPE_KEYWORDS = [
  '餐饮', '餐厅', '中餐', '西餐', '火锅', '快餐', '小吃',
  '咖啡', '奶茶', '甜品', '蛋糕', '面包', '糕点', '茶',
  '面馆', '烧烤', '炸鸡', '披萨', '汉堡', '日料', '韩料',
  '麻辣烫', '香锅', '米线', '米粉', '饺子', '粥', '饭',
  '卤味', '熟食', '凉皮', '烤鱼', '海鲜', '自助',
];

let jsonpCounter = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonpRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = `_amap_cb_${++jsonpCounter}`;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('请求超时'));
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      console.error('[高德API] JSONP 请求失败:', url);
      reject(new Error('网络请求失败，请检查网络连接'));
    };
    document.head.appendChild(script);
  });
}

export function isAmapConfigured(): boolean {
  return AMAP_KEY !== 'YOUR_AMAP_KEY' && AMAP_KEY.length > 10;
}

interface AmapPOI {
  id: string;
  name: string;
  type: string;
  address: string;
  location: string;
  distance: string;
}

function isFoodPOI(typeStr: string, name: string): boolean {
  const combined = (typeStr + name).toLowerCase();
  return FOOD_TYPE_KEYWORDS.some((kw) => combined.includes(kw.toLowerCase()));
}

function poiToFoodItem(poi: AmapPOI, index: number): FoodItem {
  const [lng, lat] = poi.location.split(',').map(Number);
  return {
    id: `nearby-${index}`,
    name: poi.name,
    emoji: getEmojiForCategory(poi.type),
    source: 'nearby',
    address: poi.address,
    distance: parseInt(poi.distance, 10) || 0,
    category: poi.type.split(';').pop() || '',
    location: { lng, lat },
  };
}

export async function searchNearbyFood(
  lng: number,
  lat: number
): Promise<FoodItem[]> {
  if (!isAmapConfigured()) {
    throw new Error('请先配置高德地图 API Key');
  }

  const locationStr = `${lng.toFixed(6)},${lat.toFixed(6)}`;
  const url = `https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${locationStr}&radius=${SEARCH_RADIUS}&types=${POI_TYPES}&offset=${RESULT_LIMIT}&page=1&extensions=all&output=JSON`;

  const data = await jsonpRequest(url);

  if (data.status !== '1') {
    console.error('[高德API] POI搜索失败:', data.info || data);
    throw new Error(data.info || '搜索周边美食失败');
  }

  const pois: AmapPOI[] = data.pois || [];
  return pois
    .filter((poi) => isFoodPOI(poi.type, poi.name))
    .map((poi, i) => poiToFoodItem(poi, i));
}

export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<string> {
  if (!isAmapConfigured()) {
    return '未知区域';
  }

  const locationStr = `${lng.toFixed(6)},${lat.toFixed(6)}`;
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${locationStr}&output=JSON`;

  const data = await jsonpRequest(url);

  if (data.status === '1' && data.regeocode?.addressComponent) {
    const comp = data.regeocode.addressComponent;
    return comp.district || comp.township || comp.city || '附近';
  }

  return '附近';
}

async function getPositionByIP(): Promise<{ lng: number; lat: number }> {
  const url = `https://restapi.amap.com/v3/ip?key=${AMAP_KEY}&output=JSON`;
  const data = await jsonpRequest(url);
  if (data.status !== '1' || !data.rectangle) {
    throw new Error('IP定位失败');
  }
  const [minLng, minLat, maxLng, maxLat] = data.rectangle
    .split(';')
    .flatMap((s: string) => s.split(',').map(Number));
  const lng = (minLng + maxLng) / 2;
  const lat = (minLat + maxLat) / 2;
  return { lng, lat };
}

export async function discoverNearbyFoods(): Promise<{
  foods: FoodItem[];
  location: UserLocation;
}> {
  let coords: { lng: number; lat: number } | null = null;

  if (navigator.geolocation) {
    try {
      coords = await new Promise<{ lng: number; lat: number }>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
            (err) => {
              let msg = '定位失败';
              if (err.code === 1) msg = '请允许浏览器获取位置权限';
              else if (err.code === 2) msg = '无法获取位置信息';
              else if (err.code === 3) msg = '定位超时，请重试';
              reject(new Error(msg));
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
          );
        }
      );
    } catch (e) {
      console.warn('[定位] GPS定位失败，尝试IP定位:', e);
    }
  }

  if (!coords && isAmapConfigured()) {
    try {
      coords = await getPositionByIP();
    } catch (e) {
      console.warn('[定位] IP定位也失败:', e);
    }
  }

  if (!coords) {
    throw new Error('无法获取位置信息');
  }

  const [foods, address] = await Promise.all([
    searchNearbyFood(coords.lng, coords.lat),
    reverseGeocode(coords.lng, coords.lat),
  ]);

  return {
    foods: foods.slice(0, RESULT_LIMIT),
    location: { lng: coords.lng, lat: coords.lat, address },
  };
}