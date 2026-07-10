import { useState, useMemo, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import AuditTable from '../components/AuditTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { auditLogs as mockLogs } from '../data/mockData';
import './AuditManagement.css';

export default function AuditManagement() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [userQuery, setUserQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        setError('');
        const data = await api.getAuditLogs();
        // Convert API response format (created_at or createdAt, user_id, path, etc) to display format
        const formatted = data.map((log: any) => ({
          id: log.id || Math.random().toString(),
          ip: log.ipAddress || '0.0.0.0',
          path: log.path || '/',
          method: log.method || 'GET',
          statusCode: log.statusCode || 200,
          durationMs: log.durationMs || 0,
          user: log.userName || 'Sistem',
          createdAt: log.createdAt ? new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19) : '',
        }));
        setLogs(formatted);
      } catch (err: any) {
        // Fallback to mock logs if backend is offline or unauthorized
        setLogs(mockLogs);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // User Query filter
      const matchesUser =
        (log.user || '').toLowerCase().includes(userQuery.toLowerCase()) ||
        (log.ip || '').includes(userQuery) ||
        (log.path || '').toLowerCase().includes(userQuery.toLowerCase());

      // Status Code filter
      let matchesStatus = true;
      if (statusFilter === '2xx') {
        matchesStatus = log.statusCode >= 200 && log.statusCode < 300;
      } else if (statusFilter === '4xx') {
        matchesStatus = log.statusCode >= 400 && log.statusCode < 500;
      } else if (statusFilter === '5xx') {
        matchesStatus = log.statusCode >= 500;
      }

      // Date filter (simple substring check on YYYY-MM-DD)
      const matchesDate = dateFilter ? log.createdAt.startsWith(dateFilter) : true;

      return matchesUser && matchesStatus && matchesDate;
    });
  }, [logs, userQuery, statusFilter, dateFilter]);

  const handleReset = () => {
    setUserQuery('');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <main className="audit-management">
      <div className="audit-management-header animate-fade-in">
        <div>
          <h2>Denetim Yönetimi</h2>
          <p>Tüm sistem ve API istek geçmişini filtreleyin ve analiz edin.</p>
          <Breadcrumb />
        </div>
        <div className="filter-actions">
          <button className="btn btn-outline" onClick={handleReset} title="Filtreleri Temizle">
            <RefreshCw size={16} />
          </button>
          <button className="btn">
            <Download size={16} />
            Dışa Aktar (CSV)
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: '13px', padding: '12px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <section className="filter-bar animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="filter-group">
          <label htmlFor="user-filter">Ara (Kullanıcı, IP, Path)</label>
          <input
            id="user-filter"
            type="text"
            className="input"
            placeholder="örn: admin, 192.168, /auth"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Durum Kodu</label>
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
          <label htmlFor="date-filter">Tarih</label>
          <input
            id="date-filter"
            type="date"
            className="input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </section>

      <section className="audit-table-section">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AuditTable data={filteredLogs} />
        )}
      </section>
    </main>
  );
}
