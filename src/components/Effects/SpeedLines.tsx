import React, { useMemo } from 'react';

interface SpeedLinesProps {
  color?: string;
  density?: number;
  opacity?: number;
  origin?: 'center' | 'bottom-center' | 'top-center' | 'left-center';
  animated?: boolean;
}

const originMap = {
  'center':        { cx: 50, cy: 50 },
  'bottom-center': { cx: 50, cy: 90 },
  'top-center':    { cx: 50, cy: 10 },
  'left-center':   { cx: 10, cy: 50 },
};

export const SpeedLines: React.FC<SpeedLinesProps> = ({
  color = '#ffffff',
  density = 48,
  opacity = 0.07,
  origin = 'center',
  animated = false,
}) => {
  const { cx, cy } = originMap[origin] || originMap['center'];

  const lines = useMemo(() => {
    return Array.from({ length: density }, (_, i) => {
      const angle = (i / density) * 360;
      const rad = (angle * Math.PI) / 180;
      const nearDist = 5 + (i % 3) * 3;
      const farDist = 90 + (i % 5) * 4;
      const x1 = cx + Math.cos(rad) * nearDist;
      const y1 = cy + Math.sin(rad) * nearDist;
      const x2 = cx + Math.cos(rad) * farDist;
      const y2 = cy + Math.sin(rad) * farDist;
      const w = i % 4 === 0 ? 0.6 : i % 7 === 0 ? 0.9 : 0.3;
      return { x1, y1, x2, y2, w };
    });
  }, [density, cx, cy]);

  return (
    <svg 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      className={`absolute inset-[-20%] w-[140%] h-[140%] pointer-events-none z-0 ${animated ? 'animate-[mgSpin_24s_linear_infinite]' : ''}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {lines.map((line, index) => (
        <line 
          key={index}
          x1={line.x1} 
          y1={line.y1} 
          x2={line.x2} 
          y2={line.y2} 
          stroke={color} 
          strokeWidth={line.w} 
          vectorEffect="non-scaling-stroke" 
        />
      ))}
    </svg>
  );
};
