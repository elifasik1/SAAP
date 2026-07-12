import { useState, useRef, useEffect } from 'react';
import { ShieldAlert, FileText, Settings, Info } from 'lucide-react';
import { api } from '../services/api';
import type { AppNotification } from '../types';
import './NotificationDropdown.css';

interface NotificationDropdownProps { onClose: () => void; onUnreadCountChange: (count: number) => void; }

function relativeTime(dateText: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(dateText).getTime()) / 60000));
  return minutes < 1 ? 'Şimdi' : minutes < 60 ? `${minutes} dk önce` : minutes < 1440 ? `${Math.floor(minutes / 60)} saat önce` : `${Math.floor(minutes / 1440)} gün önce`;
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { api.getNotifications().then(setNotifications).catch(() => setNotifications([])); }, []);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  useEffect(() => { onUnreadCountChange(unreadCount); }, [unreadCount, onUnreadCountChange]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const markAllAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  const markRead = async (id: string) => {
    const current = notifications.find(n => n.id === id);
    if (!current || current.isRead) return;
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };
  const icon = (type: AppNotification['type']) => type === 'error' ? <ShieldAlert size={14} className="text-danger" /> : type === 'report' ? <FileText size={14} /> : type === 'system' ? <Settings size={14} /> : <Info size={14} className="text-success" />;

  return <div className="notification-dropdown" ref={dropdownRef}>
    <div className="notification-dropdown-header"><span className="notification-dropdown-title">Bildirimler</span>{unreadCount > 0 && <button className="notification-clear-btn" onClick={markAllAsRead}>Tümünü okundu işaretle</button>}</div>
    <div className="notification-list">{notifications.length === 0 ? <div className="notification-empty">Yeni bildirim bulunmuyor.</div> : notifications.map(n => <button type="button" key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`} onClick={() => markRead(n.id)}><div className="notification-icon-wrapper">{icon(n.type)}</div><div className="notification-content"><span className="notification-message">{n.message}</span><span className="notification-time">{relativeTime(n.createdAt)}</span></div>{!n.isRead && <span className="notification-dot" />}</button>)}</div>
  </div>;
}
