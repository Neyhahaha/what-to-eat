import { useStore } from '@/hooks/useStore';
import { FUNNY_RESULTS } from '@/utils/foodData';

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function SpinButton() {
  const isSpinning = useStore((s) => s.isSpinning);
  const foods = useStore((s) => s.foods);
  const setSpinning = useStore((s) => s.setSpinning);
  const setLastResult = useStore((s) => s.setLastResult);
  const setShowResult = useStore((s) => s.setShowResult);

  const handleSpin = () => {
    if (isSpinning || foods.length === 0) return;
    setSpinning(true);

    const targetIndex = Math.floor(Math.random() * foods.length);
    const segmentAngle = 360 / foods.length;
    const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;

    const rotator = document.getElementById('wheel-rotator');
    const getCurrentRotation = (): number => {
      if (!rotator) return 0;
      const style = window.getComputedStyle(rotator);
      const matrix = new DOMMatrixReadOnly(style.transform);
      return Math.atan2(matrix.m12, matrix.m11) * (180 / Math.PI);
    };

    const currentRotation = getCurrentRotation();
    const currentNormalized = ((currentRotation % 360) + 360) % 360;
    const targetAbsolute = (360 - segmentCenter) % 360;
    const relativeRotation = ((targetAbsolute - currentNormalized) % 360 + 360) % 360;
    const totalRotation = 360 * Math.floor(5 + Math.random() * 3) + relativeRotation;
    const newRotation = currentRotation + totalRotation;

    if (rotator) {
      rotator.style.transition = 'none';
      rotator.style.transform = `rotate(${currentRotation}deg)`;
      void rotator.offsetHeight;
      rotator.style.transition =
        'transform 4000ms cubic-bezier(0.15, 0.7, 0.3, 0.99)';
      rotator.style.transform = `rotate(${newRotation}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      setLastResult(foods[targetIndex]);
      setShowResult(true);
    }, 4200);
  };

  const result = useStore((s) => s.lastResult);
  const showResult = useStore((s) => s.showResult);
  const setShowResultHide = useStore((s) => s.setShowResult);

  const openNavigation = (lat: number, lng: number) => {
    window.open(
      `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(result?.name || '')}&mode=car&callnative=1`,
      '_blank'
    );
  };

  return (
    <>
      <button
        onClick={handleSpin}
        disabled={isSpinning || foods.length === 0}
        className={`
          relative w-24 h-24 md:w-28 md:h-28 rounded-full
          bg-gradient-to-br from-amber-400 to-orange-500
          text-white font-bold text-lg md:text-xl
          shadow-lg shadow-orange-500/30
          transition-all duration-200
          hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${isSpinning ? 'animate-pulse' : ''}
        `}
      >
        <span className="relative z-10">
          {isSpinning ? '...' : '开转！'}
        </span>
      </button>

      {/* Result Modal */}
      {showResult && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowResultHide(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl animate-[bounceIn_0.5s_ease-out] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl mb-4 animate-bounce">{result.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {result.name}
            </h2>

            {result.source === 'nearby' && (
              <div className="text-sm text-gray-500 mb-2 space-y-0.5">
                {result.category && (
                  <p className="text-amber-600 font-medium">{result.category}</p>
                )}
                {result.distance !== undefined && (
                  <p>距离 {formatDistance(result.distance)}</p>
                )}
                {result.address && (
                  <p className="text-xs truncate">{result.address}</p>
                )}
              </div>
            )}

            <p className="text-gray-400 text-sm mt-3 mb-6">
              {FUNNY_RESULTS[Math.floor(Math.random() * FUNNY_RESULTS.length)]}
            </p>

            <div className="flex gap-3 justify-center">
              {result.source === 'nearby' && result.location && (
                <button
                  onClick={() => openNavigation(result.location!.lat, result.location!.lng)}
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-medium
                    hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
                >
                  去这里
                </button>
              )}
              <button
                onClick={() => setShowResultHide(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-full font-medium
                  hover:bg-gray-200 transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}