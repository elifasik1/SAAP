import { useState, useRef, useEffect } from 'react';
import { ShieldAlert, FileText, Settings, Info } from 'lucide-react';
import './NotificationDropdown.css';

interface NotificationItem {
  id: string;
  type: 'error' | 'report' | 'system' | 'info';
  message: string;
  time: string;
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  { id: '1', type: 'report', message: 'Yeni Denetim Raporu Hazır', time: '5 dk önce', unread: true },
  { id: '2', type: 'error', message: 'Kritik Hata: 500 (API Gateway)', time: '15 dk önce', unread: true },
  { id: '3', type: 'system', message: 'Güvenlik ayarları güncellendi', time: '1 saat önce', unread: false },
  { id: '4', type: 'info', message: 'Yeni kullanıcı kaydı: elif.a@saap.io', time: '2 saat önce', unread: true },
];

interface NotificationDropdownProps {
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Send unread count change to parent on load & updates
  const unreadCount = notifications.filter(n => n.unread).length;
  useEffect(() => {
    onUnreadCountChange(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // Click outside detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'error': return <ShieldAlert size={14} className="text-danger" />;
      case 'report': return <FileText size={14} />;
      case 'system': return <Settings size={14} />;
      default: return <Info size={14} className="text-success" />;
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown-header">
        <span className="notification-dropdown-title">Bildirimler</span>
        {unreadCount > 0 && (
          <button className="notification-clear-btn" onClick={markAllAsRead}>
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">Yeni bildirim bulunmuyor.</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${n.unread ? 'unread' : ''}`}
              onClick={() => toggleRead(n.id)}
            >
              <div className="notification-icon-wrapper">
                {getIcon(n.type)}
              </div>
              <div className="notification-content">
                <span className="notification-message">{n.message}</span>
                <span className="notification-time">{n.time}</span>
              </div>
              {n.unread && <span className="notification-dot" />}
            </div>
          ))
        )}
      </div>

      <div className="notification-dropdown-footer">
        <a href="#view-all" className="notification-view-all" onClick={(e) => { e.preventDefault(); onClose(); }}>
          Tüm bildirimleri gör
        </a>
      </div>
    </div>
  );
}
