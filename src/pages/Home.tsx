import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import Wheel from '@/components/Wheel';
import SpinButton from '@/components/SpinButton';
import LocationBar from '@/components/LocationBar';
import FoodPanel from '@/components/FoodPanel';

export default function Home() {
  const initLocation = useStore((s) => s.initLocation);
  const foods = useStore((s) => s.foods);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#292524] via-[#1c1917] to-[#0c0a09]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />

      {/* Location bar */}
      <LocationBar />

      {/* Title */}
      <div className="relative z-10 mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 tracking-wider">
          今天吃什么
        </h1>
        <p className="text-white/30 text-sm mt-2 tracking-widest">
          让命运决定你的美食之旅
        </p>
      </div>

      {/* Wheel */}
      <div className="relative z-10 mb-8">
        <Wheel />
      </div>

      {/* Empty state */}
      {foods.length === 0 && (
        <p className="relative z-10 text-white/40 text-sm mb-8">
          请先在管理面板中添加食物选项
        </p>
      )}

      {/* Spin button */}
      <div className="relative z-10">
        <SpinButton />
      </div>

      {/* Food panel */}
      <FoodPanel />
    </div>
  );
}