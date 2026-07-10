import {
  UserPlus,
  ShieldCheck,
  FileText,
  Database,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import './QuickActions.css';

interface Action {
  label: string;
  icon: LucideIcon;
}

const actions: Action[] = [
  { label: 'Yeni Kullanıcı Ekle', icon: UserPlus },
  { label: 'Rol & Yetki Yönetimi', icon: ShieldCheck },
  { label: 'Audit Log İndir', icon: FileText },
  { label: 'Veritabanı Yedekle', icon: Database },
];

export default function QuickActions() {
  return (
    <div className="quick-actions animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <h2 className="quick-actions-title">Hızlı İşlemler</h2>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <button key={action.label} className="quick-action-btn">
            <span className="action-icon">
              <action.icon size={16} />
            </span>
            <span className="action-label">{action.label}</span>
            <ChevronRight size={14} className="action-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
}
