import { Users, Activity, Globe, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import TrafficChart from '../components/TrafficChart';
import AuditTable from '../components/AuditTable';
import QuickActions from '../components/QuickActions';
import Breadcrumb from '../components/Breadcrumb';
import { dashboardStats, trafficData, auditLogs } from '../data/mockData';
import './Dashboard.css';

const iconMap = {
  'users': Users,
  'activity': Activity,
  'globe': Globe,
  'alert-triangle': AlertTriangle,
};

export default function Dashboard() {
  return (
    <main className="dashboard">
      <div className="dashboard-welcome animate-fade-in">
        <h2>Hoş Geldin, Elif 👋</h2>
        <p>SAAP platformunun güncel durumuna göz at.</p>
        <Breadcrumb />
      </div>

      <section className="dashboard-stats">
        {dashboardStats.map((stat, i) => {
          const IconComponent = iconMap[stat.iconName];
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={IconComponent}
              delay={i * 80}
            />
          );
        })}
      </section>

      <section className="dashboard-chart">
        <TrafficChart data={trafficData} />
      </section>

      <section className="dashboard-bottom">
        <AuditTable data={auditLogs.slice(0, 5)} compact={true} />
        <QuickActions />
      </section>
    </main>
  );
}

