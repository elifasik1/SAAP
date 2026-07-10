import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrafficDataPoint } from '../data/mockData';
import './TrafficChart.css';

interface TrafficChartProps {
  data: TrafficDataPoint[];
  title?: string;
  subtitle?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div
      style={{
        background: 'rgba(21, 44, 107, 0.95)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '10px 14px',
        backdropFilter: 'blur(8px)',
        fontSize: '12px',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.dataKey === 'requests' ? '#F472B6' : 'rgba(255,255,255,0.4)' }}>
          {entry.dataKey === 'requests' ? 'İstekler' : 'Hatalar'}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function TrafficChart({ data, title = 'API Trafik Analizi', subtitle = 'Son 24 saat — 2 saatlik aralıklar' }: TrafficChartProps) {
  return (
    <div className="traffic-chart animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="traffic-chart-header">
        <div>
          <div className="traffic-chart-title">{title}</div>
          <div className="traffic-chart-subtitle">{subtitle}</div>
        </div>
        <div className="traffic-chart-legend">
          <div className="traffic-chart-legend-item">
            <span className="legend-dot primary" />
            İstekler
          </div>
          <div className="traffic-chart-legend-item">
            <span className="legend-dot secondary" />
            Hatalar
          </div>
        </div>
      </div>

      <div className="traffic-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F472B6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F472B6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientWhite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1.5}
              fill="url(#gradientWhite)"
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#F472B6"
              strokeWidth={2}
              fill="url(#gradientAccent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
