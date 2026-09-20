import React, { useState } from 'react';
import { TimeSeriesPoint } from '../types/analytics';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  metricKey: 'requests' | 'latency' | 'errors' | 'bandwidthKb';
  metricLabel: string;
  unit: string;
  color?: string;
  fillColor?: string;
  height?: number;
}

export const AnalyticsTimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metricKey,
  metricLabel,
  unit,
  color = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.15)',
  height = 180
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-neutral-500">No telemetry data recorded</div>;
  }

  const values = data.map((d) => d[metricKey]);
  const minVal = 0;
  const maxVal = Math.max(...values, 1);
  const paddingX = 35;
  const paddingY = 25;
  const chartWidth = 720;
  const chartHeight = height;

  const getX = (index: number) => {
    return paddingX + (index / (data.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    return chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
  };

  // Build SVG Path
  const points = data.map((d, i) => `${getX(i)},${getY(d[metricKey])}`).join(' ');
  const areaPoints = `${getX(0)},${chartHeight - paddingY} ${points} ${getX(data.length - 1)},${chartHeight - paddingY}`;

  // Grid line values
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  const hoveredPoint = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Tooltip display */}
      <div className="h-6 flex items-center justify-between text-xs mb-1 px-1">
        <div className="text-[11px] font-mono text-neutral-400">
          Metric: <span className="font-semibold text-neutral-200">{metricLabel}</span>
        </div>
        {hoveredPoint ? (
          <div className="text-[11px] font-mono text-white bg-neutral-800/90 px-2 py-0.5 rounded border border-neutral-700 flex items-center gap-2">
            <span className="text-neutral-400">{hoveredPoint.timestamp}:</span>
            <span className="font-bold text-indigo-400">
              {hoveredPoint[metricKey].toLocaleString()} {unit}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-neutral-500">Hover graph points for detailed snapshot</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id={`gradient-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-neutral-800/80 stroke-1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-neutral-500 font-mono"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={`url(#gradient-${metricKey})`}
        />

        {/* Line stroke */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Interactive Points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d[metricKey]);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              className="transition-all"
            >
              {/* Invisible large target for easy hover */}
              <circle cx={cx} cy={cy} r="14" fill="transparent" />

              {/* Visible dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 2.5}
                fill={isHovered ? '#ffffff' : color}
                stroke={isHovered ? color : '#0f172a'}
                strokeWidth={isHovered ? 2.5 : 1}
                className="transition-all duration-150"
              />

              {/* X-axis labels for sparse points */}
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <text
                  x={cx}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-mono"
                >
                  {d.timestamp}
                </text>
              )}
            </g>
          );
        })}

        {/* Vertical crosshair line when hovered */}
        {hoveredIdx !== null && (
          <line
            x1={getX(hoveredIdx)}
            y1={paddingY}
            x2={getX(hoveredIdx)}
            y2={chartHeight - paddingY}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.6"
          />
        )}
      </svg>
    </div>
  );
};
