import { useState } from 'react';
import { useStore } from '@/hooks/useStore';

export default function FoodPanel() {
  const showPanel = useStore((s) => s.showPanel);
  const setShowPanel = useStore((s) => s.setShowPanel);
  const foods = useStore((s) => s.foods);
  const dataSource = useStore((s) => s.dataSource);
  const addFood = useStore((s) => s.addFood);
  const removeFood = useStore((s) => s.removeFood);
  const resetFoods = useStore((s) => s.resetFoods);
  const refreshLocation = useStore((s) => s.refreshLocation);
  const locationStatus = useStore((s) => s.locationStatus);

  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addFood(newName.trim());
      setNewName('');
    }
  };

  const sourceLabel =
    dataSource === 'nearby'
      ? '周边实时数据'
      : dataSource === 'custom'
      ? '自定义列表'
      : '默认列表';

  return (
    <>
      {/* Overlay */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setShowPanel(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#1c1917] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ${
          showPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-bold text-lg">食物管理</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-white/50 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Source info */}
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-white/40 text-xs">
              当前数据源：
              <span className="text-amber-400 ml-1">{sourceLabel}</span>
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              共 {foods.length} 个选项
            </p>
          </div>

          {/* Food list */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <span className="text-2xl">{food.emoji}</span>
                <span className="flex-1 text-white/80 text-sm truncate">
                  {food.name}
                </span>
                {food.source !== 'nearby' && (
                  <button
                    onClick={() => removeFood(food.id)}
                    className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-sm"
                    title="删除"
                  >
                    🗑️
                  </button>
                )}
                {food.source === 'nearby' && (
                  <span className="text-white/20 text-xs">周边</span>
                )}
              </div>
            ))}

            {foods.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">
                还没有添加食物哦~
              </p>
            )}
          </div>

          {/* Add & actions */}
          <div className="px-5 py-4 border-t border-white/10 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="输入食物名称..."
                maxLength={12}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                  placeholder:text-white/20 outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium
                  hover:bg-amber-400 transition-colors shrink-0"
              >
                添加
              </button>
            </div>

            <div className="flex gap-2">
              {(dataSource === 'custom' || dataSource === 'default') && (
                <button
                  onClick={resetFoods}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm
                    hover:bg-white/10 transition-colors"
                >
                  恢复默认
                </button>
              )}
              {locationStatus === 'success' && (
                <button
                  onClick={refreshLocation}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm
                    hover:bg-white/10 transition-colors"
                >
                  刷新周边
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed right-6 bottom-6 z-30 w-14 h-14 rounded-2xl
          bg-white/10 backdrop-blur-xl border border-white/10
          text-white text-2xl flex items-center justify-center
          hover:bg-white/20 hover:scale-105 active:scale-95
          transition-all duration-200 shadow-lg"
      >
        ⚙️
      </button>
    </>
  );
}