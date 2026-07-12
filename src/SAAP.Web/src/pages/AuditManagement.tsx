import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Download,
  RefreshCw,
  ScrollText,
  Search,
  Calendar,
  Filter,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import AuditTable from '../components/AuditTable';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import type { AuditEntry } from '../types';
import { exportAuditLogsToCsv } from '../utils/dataExport';
import './AuditManagement.css';

export default function AuditManagement() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userQuery, setUserQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Audit logları yüklenemedi.';
      setError(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesUser =
        (log.user || '').toLowerCase().includes(userQuery.toLowerCase()) ||
        (log.ip || '').includes(userQuery) ||
        (log.path || '').toLowerCase().includes(userQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === '2xx') {
        matchesStatus = log.statusCode >= 200 && log.statusCode < 300;
      } else if (statusFilter === '4xx') {
        matchesStatus = log.statusCode >= 400 && log.statusCode < 500;
      } else if (statusFilter === '5xx') {
        matchesStatus = log.statusCode >= 500;
      }

      const matchesDate = dateFilter ? log.createdAt.startsWith(dateFilter) : true;

      return matchesUser && matchesStatus && matchesDate;
    });
  }, [logs, userQuery, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const filtered = filteredLogs.length;
    const successCount = logs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length;
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
    const avgDuration =
      total > 0 ? Math.round(logs.reduce((sum, l) => sum + l.durationMs, 0) / total) : 0;

    return [
      { label: 'Toplam kayıt', value: String(total), trend: 0, icon: ScrollText },
      { label: 'Filtrelenmiş', value: String(filtered), trend: 0, icon: Filter },
      { label: 'Başarı oranı', value: `%${successRate}`, trend: 0, icon: CheckCircle2 },
      { label: 'Ort. yanıt süresi', value: `${avgDuration}ms`, trend: 0, icon: Clock },
    ];
  }, [logs, filteredLogs]);

  const hasActiveFilters = userQuery !== '' || statusFilter !== 'all' || dateFilter !== '';

  const handleReset = () => {
    setUserQuery('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      showToast('Dışa aktarılacak kayıt bulunamadı.', 'error');
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportAuditLogsToCsv(filteredLogs, `audit-logs-${date}.csv`);
    showToast(`${filteredLogs.length} kayıt CSV olarak indirildi.`, 'success');
  };

  return (
    <main className="audit-management">
      <div className="audit-hero animate-fade-in">
        <div className="audit-hero-content">
          <span className="audit-eyebrow">
            <Activity size={13} /> Denetim merkezi
          </span>
          <h2>Denetim Yönetimi</h2>
          <p>
            {user?.email ?? 'Hesabınıza'} ait API istek geçmişini filtreleyin ve analiz edin.
          </p>
          <Breadcrumb />
        </div>
        <div className="audit-hero-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={loadLogs}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Yenile
          </button>
          <button className="btn btn-sm" onClick={handleExportCsv} disabled={loading}>
            <Download size={15} />
            Dışa Aktar
          </button>
        </div>
      </div>

      <section className="audit-stats">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            delay={index * 80}
          />
        ))}
      </section>

      {error && (
        <div className="audit-error-banner animate-fade-in">
          <ShieldAlert size={18} />
          <span>{error}</span>
          <button className="audit-error-retry" onClick={loadLogs}>
            Tekrar Dene
          </button>
        </div>
      )}

      <section className="filter-bar animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="filter-group">
          <label htmlFor="user-filter">
            <Search size={11} /> Ara (IP, Path)
          </label>
          <input
            id="user-filter"
            type="text"
            className="input"
            placeholder="örn: 192.168, /auth"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">
            <Filter size={11} /> Durum Kodu
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="2xx">Başarılı (2xx)</option>
            <option value="4xx">İstemci Hatası (4xx)</option>
            <option value="5xx">Sunucu Hatası (5xx)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">
            <Calendar size={11} /> Tarih
          </label>
          <input
            id="date-filter"
            type="date"
            className="input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button className="filter-reset-btn" onClick={handleReset}>
            <RefreshCw size={13} />
            Filtreleri Temizle
          </button>
        )}
      </section>

      <section className="audit-table-section">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AuditTable
            data={filteredLogs}
            emptyMessage={
              error
                ? 'Loglar yüklenemedi. Lütfen bir süre bekleyip tekrar deneyin.'
                : hasActiveFilters
                  ? 'Filtrelere uygun kayıt bulunamadı.'
                  : 'Henüz audit log kaydı bulunmuyor.'
            }
          />
        )}
      </section>
    </main>
  );
}
