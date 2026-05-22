import { useStore } from '@/hooks/useStore';

export default function LocationBar() {
  const locationStatus = useStore((s) => s.locationStatus);
  const userLocation = useStore((s) => s.userLocation);
  const locationError = useStore((s) => s.locationError);
  const dataSource = useStore((s) => s.dataSource);
  const setDataSource = useStore((s) => s.setDataSource);
  const refreshLocation = useStore((s) => s.refreshLocation);
  const nearbyFoods = useStore(
    (s) =>
      s.dataSource === 'nearby' && s.locationStatus === 'success'
        ? s.foods.length
        : 0
  );
  const locationFailed = locationStatus === 'failed';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-lg">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 shadow-lg">
        {/* Location indicator */}
        <div className="relative flex-shrink-0">
          <span className="text-xl">
            {locationStatus === 'loading'
              ? '🔄'
              : locationStatus === 'success'
              ? '📍'
              : '⚠️'}
          </span>
          {locationStatus === 'loading' && (
            <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/30" />
          )}
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          {locationStatus === 'loading' && (
            <p className="text-white/80 text-sm animate-pulse">正在定位中...</p>
          )}
          {locationStatus === 'success' && (
            <p className="text-white/80 text-sm truncate">
              已定位到
              <span className="text-amber-300 font-medium">
                {' '}
                {userLocation?.address || '附近'}{' '}
              </span>
              · 发现 {nearbyFoods} 家美食
            </p>
          )}
          {locationFailed && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-white/60 text-sm">无法定位，使用默认美食</p>
                <button
                  onClick={refreshLocation}
                  className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0"
                >
                  重试
                </button>
              </div>
              {locationError && (
                <p className="text-red-400/60 text-xs truncate">{locationError}</p>
              )}
            </div>
          )}
          {locationStatus === 'idle' && (
            <p className="text-white/60 text-sm">准备就绪</p>
          )}
        </div>

        {/* Data source toggle */}
        {locationStatus === 'success' && (
          <div className="flex-shrink-0 flex bg-white/10 rounded-full p-0.5">
            <button
              onClick={() => setDataSource('nearby')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                dataSource === 'nearby'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              周边
            </button>
            <button
              onClick={() => setDataSource('default')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                dataSource === 'default' || dataSource === 'custom'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              默认
            </button>
          </div>
        )}
      </div>
    </div>
  );
}