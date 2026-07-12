import { useEffect, useMemo, useState } from 'react';
import { Users, Activity, Globe, AlertTriangle, Radio, ShieldCheck } from 'lucide-react';
import StatCard from '../components/StatCard';
import TrafficChart from '../components/TrafficChart';
import AuditTable from '../components/AuditTable';
import QuickActions from '../components/QuickActions';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { buildTrafficFromLogs, type AuditEntry } from '../types';
import './Dashboard.css';

const iconMap = { users: Users, activity: Activity, globe: Globe, 'alert-triangle': AlertTriangle };

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try { setLogs(await api.getAuditLogs()); }
      catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Veriler yüklenemedi.', 'error'); }
      finally { setLoading(false); }
    }
    void loadData();
  }, [showToast]);

  const stats = useMemo(() => {
    const totalRequests = logs.length;
    const errorCount = logs.filter((log) => log.statusCode >= 400).length;
    const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(1) : '0';
    const avgDuration = totalRequests > 0 ? Math.round(logs.reduce((sum, log) => sum + log.durationMs, 0) / totalRequests) : 0;
    return [
      { label: 'Toplam istek', value: String(totalRequests), trend: 0, iconName: 'globe' as const },
      { label: 'Başarılı istek', value: String(totalRequests - errorCount), trend: 0, iconName: 'activity' as const },
      { label: 'Ort. yanıt süresi', value: `${avgDuration}ms`, trend: 0, iconName: 'users' as const },
      { label: 'Hata oranı', value: `%${errorRate}`, trend: -0.0, iconName: 'alert-triangle' as const },
    ];
  }, [logs]);

  if (loading) return <main className="dashboard"><LoadingSpinner /></main>;

  return <main className="dashboard">
    <div className="dashboard-welcome animate-fade-in">
      <div>
        <span className="dashboard-eyebrow"><Radio size={13} /> Canlı güvenlik merkezi</span>
        <h2>Hoş geldin, {user?.firstName ?? 'Kullanıcı'}.</h2>
        <p>API trafiğinizin güncel özetini ve güvenlik durumunu tek ekrandan takip edin.</p>
        <Breadcrumb />
      </div>
      <div className="dashboard-health"><div className="dashboard-health-icon"><ShieldCheck size={20} /></div><div><span>Sistem durumu</span><strong>Tüm servisler sağlıklı</strong></div><i /></div>
    </div>
    <section className="dashboard-stats">{stats.map((stat, index) => <StatCard key={stat.label} label={stat.label} value={stat.value} trend={stat.trend} icon={iconMap[stat.iconName]} delay={index * 80} />)}</section>
    <section className="dashboard-chart"><TrafficChart data={buildTrafficFromLogs(logs)} /></section>
    <section className="dashboard-bottom"><AuditTable data={logs.slice(0, 5)} compact /><QuickActions auditLogs={logs} /></section>
  </main>;
}
