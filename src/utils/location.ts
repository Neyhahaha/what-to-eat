import type { LocationStatus } from './types';

export function getCurrentPosition(): Promise<{ lng: number; lat: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        });
      },
      (error) => {
        let message = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '定位权限被拒绝';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '位置信息不可用';
            break;
          case error.TIMEOUT:
            message = '定位请求超时';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

export function getLocationStatusText(status: LocationStatus): string {
  switch (status) {
    case 'loading':
      return '正在定位...';
    case 'success':
      return '已定位';
    case 'failed':
      return '定位失败，使用默认美食';
    case 'idle':
      return '等待定位';
  }
}