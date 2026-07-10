import type { AuditEntry } from '../data/mockData';
import './AuditTable.css';

interface AuditTableProps {
  data: AuditEntry[];
  compact?: boolean;
}

function getStatusBadgeClass(code: number): string {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 400 && code < 500) return 'warning';
  return 'error';
}

export default function AuditTable({ data, compact = false }: AuditTableProps) {
  return (
    <div className="audit-table-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="audit-table-header">
        <h2 className="audit-table-title">Son Audit Logları</h2>
        <span className="audit-table-count">{data.length} kayıt</span>
      </div>

      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>IP Adresi</th>
              <th>Endpoint</th>
              {!compact && <th>Kullanıcı</th>}
              <th>Durum</th>
              <th>Süre</th>
              <th>Zaman</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id}>
                <td className="audit-ip">{entry.ip}</td>
                <td className="audit-path">
                  <span className="audit-method">{entry.method}</span> {entry.path}
                </td>
                {!compact && <td className="text-muted">{entry.user}</td>}
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(entry.statusCode)}`}>
                    {entry.statusCode}
                  </span>
                </td>
                <td className="audit-duration">{entry.durationMs}ms</td>
                <td className="text-muted">{entry.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
