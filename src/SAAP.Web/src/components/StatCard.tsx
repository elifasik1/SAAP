import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
  trend: number;
  icon: LucideIcon;
  delay?: number;
}

export default function StatCard({ label, value, trend, icon: Icon, delay = 0 }: StatCardProps) {
  const isUp = trend >= 0;

  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">
          <Icon size={20} />
        </div>
      </div>

      <div className="stat-card-value">{value}</div>

      <span className={`stat-card-trend ${isUp ? 'up' : 'down'}`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? '+' : ''}{trend}%
      </span>
    </div>
  );
}
