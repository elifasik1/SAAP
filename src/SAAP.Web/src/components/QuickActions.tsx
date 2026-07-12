import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  ShieldCheck,
  FileText,
  Database,
  ChevronRight,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { exportAuditLogsToCsv, downloadJsonBackup } from '../utils/dataExport';
import type { AuditEntry } from '../types';
import './QuickActions.css';

interface QuickActionsProps {
  auditLogs: AuditEntry[];
}

interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const actions: ActionItem[] = [
  { id: 'register', label: 'Yeni Kullanıcı Ekle', icon: UserPlus },
  { id: 'security', label: 'Rol & Yetki Yönetimi', icon: ShieldCheck },
  { id: 'audit-csv', label: 'Audit Log İndir', icon: FileText },
  { id: 'backup', label: 'Veritabanı Yedekle', icon: Database },
];

export default function QuickActions({ auditLogs }: QuickActionsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const getLogs = async (): Promise<AuditEntry[]> => {
    if (auditLogs.length > 0) return auditLogs;
    return api.getAuditLogs();
  };

  const handleAction = async (id: string) => {
    if (busyId) return;

    switch (id) {
      case 'register':
        window.open('/register', '_blank', 'noopener,noreferrer');
        showToast('Kayıt sayfası yeni sekmede açıldı. Yeni kullanıcı buradan hesap oluşturabilir.', 'success');
        break;

      case 'security':
        navigate('/settings#security');
        break;

      case 'audit-csv': {
        setBusyId(id);
        try {
          const logs = await getLogs();
          if (logs.length === 0) {
            showToast('İndirilecek audit log bulunamadı.', 'error');
            return;
          }
          const date = new Date().toISOString().slice(0, 10);
          exportAuditLogsToCsv(logs, `audit-logs-${date}.csv`);
          showToast(`${logs.length} audit log CSV olarak indirildi.`, 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Audit logları indirilemedi.';
          showToast(message, 'error');
        } finally {
          setBusyId(null);
        }
        break;
      }

      case 'backup': {
        setBusyId(id);
        try {
          const logs = await getLogs();
          const date = new Date().toISOString().slice(0, 10);
          downloadJsonBackup(
            {
              exportedAt: new Date().toISOString(),
              user: user
                ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
                : null,
              auditLogs: logs,
              totalLogs: logs.length,
            },
            `saap-yedek-${date}.json`
          );
          showToast(`Hesap verileriniz JSON olarak yedeklendi (${logs.length} log).`, 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Yedekleme başarısız.';
          showToast(message, 'error');
        } finally {
          setBusyId(null);
        }
        break;
      }
    }
  };

  return (
    <div className="quick-actions animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <h2 className="quick-actions-title">Hızlı İşlemler</h2>
      <div className="quick-actions-grid">
        {actions.map((action) => {
          const isBusy = busyId === action.id;
          return (
            <button
              key={action.id}
              type="button"
              className="quick-action-btn"
              onClick={() => handleAction(action.id)}
              disabled={!!busyId}
            >
              <span className="action-icon">
                {isBusy ? <Loader2 size={16} className="spin" /> : <action.icon size={16} />}
              </span>
              <span className="action-label">{action.label}</span>
              <ChevronRight size={14} className="action-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
