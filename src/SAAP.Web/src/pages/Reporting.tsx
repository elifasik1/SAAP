import { useEffect, useMemo, useState } from 'react';
import { Download, FileLineChart, ShieldAlert } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { buildHeatmapFromLogs, buildMonthlyTrendsFromLogs } from '../types';
import { exportAuditLogsToCsv } from '../utils/dataExport';
import './Reporting.css';

const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function Reporting() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [heatmapData, setHeatmapData] = useState<ReturnType<typeof buildHeatmapFromLogs>>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<ReturnType<typeof buildMonthlyTrendsFromLogs>>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof api.getAuditLogs>>>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const logs = await api.getAuditLogs();
        setLogs(logs);
        setHeatmapData(buildHeatmapFromLogs(logs));
        setMonthlyTrends(buildMonthlyTrendsFromLogs(logs));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Rapor verileri yüklenemedi.';
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const structuredHeatmap = useMemo(() => {
    const dataByDay: Record<string, typeof heatmapData> = {};
    daysOfWeek.forEach((day) => {
      dataByDay[day] = heatmapData.filter((d) => d.day === day).sort((a, b) => a.hour - b.hour);
    });
    return dataByDay;
  }, [heatmapData]);

  const getCellColor = (value: number) => {
    const opacity = value / 100;
    return `rgba(244, 114, 182, ${Math.max(opacity, 0.05)})`;
  };

  const handleExportReport = () => {
    if (logs.length === 0) {
      showToast('Dışa aktarılacak kayıt bulunamadı.', 'error');
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportAuditLogsToCsv(logs, `guvenlik-raporu-${date}.csv`);
    showToast(`${logs.length} kayıt rapor olarak indirildi.`, 'success');
  };

  if (loading) {
    return (
      <main className="reporting">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="reporting">
      <div className="reporting-header animate-fade-in">
        <div>
          <h2>Raporlama ve Analitik</h2>
          <p>{user?.email ?? 'Hesabınıza'} ait API isteklerinin güvenlik ve trafik analizi.</p>
          <Breadcrumb />
        </div>
        <div className="download-cta-section">
          <button className="btn" onClick={handleExportReport}>
            <Download size={16} />
            Güvenlik Raporunu İndir
          </button>
        </div>
      </div>

      <section className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} className="text-accent" />
          Saatlik API İstek Yoğunluk Haritası
        </h3>
        <p className="text-muted" style={{ fontSize: '12px', marginBottom: '24px' }}>
          Kendi hesabınıza ait haftalık bazda saatlik istek yoğunluğu. Daha koyu alanlar daha yüksek işlem sıklığını gösterir.
        </p>

        <div className="heatmap-container">
          <div className="heatmap-grid">
            {daysOfWeek.map((day) => (
              <div key={day} className="heatmap-row">
                <span className="heatmap-day-label">{day}</span>
                {structuredHeatmap[day]?.map((cell) => (
                  <div
                    key={`${day}-${cell.hour}`}
                    className="heatmap-cell"
                    style={{ backgroundColor: getCellColor(cell.value) }}
                  >
                    <span className="heatmap-tooltip">
                      {day} {cell.hour.toString().padStart(2, '0')}:00 · Yoğunluk: %{cell.value}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <div className="heatmap-hour-labels">
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="heatmap-hour-label">
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="heatmap-legend">
          <span>Düşük</span>
          <div className="heatmap-legend-scale">
            <div className="legend-box" style={{ backgroundColor: 'rgba(244, 114, 182, 0.1)' }} />
            <div className="legend-box" style={{ backgroundColor: 'rgba(244, 114, 182, 0.3)' }} />
            <div className="legend-box" style={{ backgroundColor: 'rgba(244, 114, 182, 0.6)' }} />
            <div className="legend-box" style={{ backgroundColor: 'rgba(244, 114, 182, 0.9)' }} />
          </div>
          <span>Yüksek</span>
        </div>
      </section>

      <section className="glass-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileLineChart size={18} className="text-accent" />
          Aylık Hata ve Risk Trendi
        </h3>
        <p className="text-muted" style={{ fontSize: '12px', marginBottom: '16px' }}>
          Hesabınıza ait API isteklerinden hesaplanan aylık hata oranı ve olay dağılımı.
        </p>

        <div className="reporting-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F472B6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F472B6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(21, 44, 107, 0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Hata Oranı (%)"
                stroke="#F472B6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
              <Area
                type="monotone"
                dataKey="incidents"
                name="Hatalı İstekler"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorIncidents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
