import { useCallback, useRef, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';

const SEGMENT_COLORS = [
  '#F59E0B', '#EF4444', '#84CC16', '#06B6D4', '#8B5CF6', '#EC4899',
  '#F97316', '#14B8A6', '#6366F1', '#E11D48', '#22C55E', '#3B82F6',
  '#A855F7', '#0EA5E9', '#10B981', '#F43F5E', '#D946EF', '#8B5CF6',
  '#FB923C', '#2DD4BF',
];

export default function Wheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foods = useStore((s) => s.foods);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || foods.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    if (size <= 0) return;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const center = size / 2;
    const radius = size / 2 - 8;
    const segmentAngle = (2 * Math.PI) / foods.length;

    foods.forEach((food, i) => {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      // segment fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();

      // segment border
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);

      const textRadius = radius * 0.65;
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(12, radius / 13)}px "Noto Sans SC", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const label = `${food.emoji} ${food.name.length > 4 ? food.name.slice(0, 4) + '..' : food.name}`;
      ctx.fillText(label, textRadius, 0);

      ctx.restore();
    });

    // center circle
    const centerCircle = radius * 0.18;
    ctx.beginPath();
    ctx.arc(center, center, centerCircle, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(center, center, 0, center, center, centerCircle);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, '#FDE68A');
    grad.addColorStop(1, '#F59E0B');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [foods]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      draw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div className="relative">
      {/* pointer */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <svg width="32" height="40" viewBox="0 0 32 40">
          <defs>
            <filter id="pointer-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7F1D1D" floodOpacity="0.5" />
            </filter>
            <linearGradient id="pointer-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <polygon
            points="16,36 4,0 28,0"
            fill="url(#pointer-grad)"
            filter="url(#pointer-shadow)"
          />
        </svg>
      </div>

      {/* wheel container with rotation */}
      <div
        id="wheel-rotator"
        className="transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0.7,0.3,0.99)]"
        style={{ transform: 'rotate(0deg)' }}
      >
        <canvas
          ref={canvasRef}
          className="w-[350px] h-[350px] max-w-[80vw] max-h-[80vw] md:w-[400px] md:h-[400px]"
        />
      </div>
    </div>
  );
}