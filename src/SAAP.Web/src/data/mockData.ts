// =============================================
// SAAP — Centralized Mock Data
// =============================================

// --- Dashboard Stats ---
export interface StatData {
  label: string;
  value: string;
  trend: number;
  iconName: 'users' | 'activity' | 'globe' | 'alert-triangle';
}

export const dashboardStats: StatData[] = [
  { label: 'Toplam Kullanıcı', value: '2,847', trend: 12.5, iconName: 'users' },
  { label: 'Aktif Oturumlar', value: '184', trend: 8.2, iconName: 'activity' },
  { label: 'API İstekleri (24s)', value: '34.2K', trend: 23.1, iconName: 'globe' },
  { label: 'Hata Oranı', value: '%1.2', trend: -0.8, iconName: 'alert-triangle' },
];

// --- Traffic Chart Data ---
export interface TrafficDataPoint {
  time: string;
  requests: number;
  errors: number;
}

export const trafficData: TrafficDataPoint[] = [
  { time: '00:00', requests: 120, errors: 8 },
  { time: '02:00', requests: 85, errors: 5 },
  { time: '04:00', requests: 45, errors: 2 },
  { time: '06:00', requests: 78, errors: 6 },
  { time: '08:00', requests: 210, errors: 12 },
  { time: '10:00', requests: 340, errors: 18 },
  { time: '12:00', requests: 420, errors: 22 },
  { time: '14:00', requests: 380, errors: 15 },
  { time: '16:00', requests: 450, errors: 20 },
  { time: '18:00', requests: 390, errors: 14 },
  { time: '20:00', requests: 280, errors: 10 },
  { time: '22:00', requests: 190, errors: 7 },
];

// --- Audit Logs ---
export interface AuditEntry {
  id: string;
  ip: string;
  path: string;
  method: string;
  statusCode: number;
  durationMs: number;
  user: string;
  createdAt: string;
}

export const auditLogs: AuditEntry[] = [
  { id: '1', ip: '192.168.1.42', method: 'POST', path: '/api/auth/login', statusCode: 200, durationMs: 124, user: 'elif.a@saap.io', createdAt: '2026-07-10 22:15:03' },
  { id: '2', ip: '10.0.0.15', method: 'GET', path: '/api/audit-logs', statusCode: 200, durationMs: 45, user: 'admin@saap.io', createdAt: '2026-07-10 22:14:58' },
  { id: '3', ip: '172.16.0.8', method: 'POST', path: '/api/auth/register', statusCode: 400, durationMs: 89, user: 'anonim', createdAt: '2026-07-10 22:14:32' },
  { id: '4', ip: '192.168.1.42', method: 'GET', path: '/weatherforecast', statusCode: 200, durationMs: 12, user: 'elif.a@saap.io', createdAt: '2026-07-10 22:13:45' },
  { id: '5', ip: '10.0.0.22', method: 'POST', path: '/api/auth/login', statusCode: 401, durationMs: 67, user: 'anonim', createdAt: '2026-07-10 22:12:11' },
  { id: '6', ip: '172.16.0.3', method: 'GET', path: '/api/users', statusCode: 500, durationMs: 340, user: 'admin@saap.io', createdAt: '2026-07-10 22:11:50' },
  { id: '7', ip: '192.168.1.100', method: 'GET', path: '/api/audit-logs', statusCode: 200, durationMs: 38, user: 'elif.a@saap.io', createdAt: '2026-07-10 22:10:22' },
  { id: '8', ip: '10.0.0.15', method: 'POST', path: '/api/auth/login', statusCode: 200, durationMs: 112, user: 'admin@saap.io', createdAt: '2026-07-10 22:09:05' },
  { id: '9', ip: '172.16.0.12', method: 'PUT', path: '/api/users/5', statusCode: 403, durationMs: 23, user: 'anonim', createdAt: '2026-07-10 22:08:18' },
  { id: '10', ip: '192.168.1.55', method: 'DELETE', path: '/api/users/12', statusCode: 204, durationMs: 56, user: 'admin@saap.io', createdAt: '2026-07-10 22:07:44' },
  { id: '11', ip: '10.0.0.30', method: 'GET', path: '/api/reports', statusCode: 200, durationMs: 198, user: 'elif.a@saap.io', createdAt: '2026-07-10 22:06:30' },
  { id: '12', ip: '172.16.0.8', method: 'POST', path: '/api/auth/login', statusCode: 429, durationMs: 5, user: 'anonim', createdAt: '2026-07-10 22:05:12' },
];

// --- Reporting: Monthly Trend Data ---
export interface MonthlyTrend {
  month: string;
  riskScore: number;
  incidents: number;
  resolved: number;
}

export const monthlyTrends: MonthlyTrend[] = [
  { month: 'Oca', riskScore: 72, incidents: 14, resolved: 12 },
  { month: 'Şub', riskScore: 65, incidents: 11, resolved: 10 },
  { month: 'Mar', riskScore: 78, incidents: 18, resolved: 15 },
  { month: 'Nis', riskScore: 55, incidents: 8, resolved: 8 },
  { month: 'May', riskScore: 48, incidents: 6, resolved: 6 },
  { month: 'Haz', riskScore: 62, incidents: 10, resolved: 9 },
  { month: 'Tem', riskScore: 42, incidents: 5, resolved: 5 },
];

// --- Reporting: Heatmap Data (day × hour) ---
export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
}

export const heatmapData: HeatmapCell[] = (() => {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const cells: HeatmapCell[] = [];
  days.forEach((day) => {
    for (let h = 0; h < 24; h++) {
      const isWorkHour = h >= 8 && h <= 18;
      const isWeekend = day === 'Cmt' || day === 'Paz';
      const base = isWeekend ? 10 : isWorkHour ? 60 : 20;
      const jitter = Math.floor(Math.random() * 40);
      cells.push({ day, hour: h, value: Math.min(base + jitter, 100) });
    }
  });
  return cells;
})();

// --- Settings: User Profile ---
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  avatarInitials: string;
}

export const userProfile: UserProfile = {
  firstName: 'Elif',
  lastName: 'Arslan',
  email: 'elif.a@saap.io',
  role: 'Sistem Yöneticisi',
  department: 'Bilgi Güvenliği',
  joinDate: '15 Mart 2025',
  avatarInitials: 'EA',
};

// --- Settings: Security Toggles ---
export interface SecurityToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const securityToggles: SecurityToggle[] = [
  { id: '2fa', label: 'İki Faktörlü Doğrulama', description: 'Giriş yaparken SMS veya Authenticator ile doğrulama', enabled: true },
  { id: 'session-lock', label: 'Otomatik Oturum Kilitleme', description: '15 dakika hareketsizlikte oturumu kilitle', enabled: true },
  { id: 'ip-whitelist', label: 'IP Beyaz Listesi', description: 'Sadece onaylı IP adreslerinden erişime izin ver', enabled: false },
  { id: 'audit-notify', label: 'Kritik Audit Bildirimleri', description: '5xx hata veya yetkisiz erişim denemelerinde bildirim gönder', enabled: true },
  { id: 'api-key-rotation', label: 'API Anahtar Rotasyonu', description: 'API anahtarlarını her 30 günde otomatik yenile', enabled: false },
];

// --- Quick Actions ---
export interface QuickAction {
  label: string;
  iconName: 'user-plus' | 'shield-check' | 'file-text' | 'database';
}

export const quickActions: QuickAction[] = [
  { label: 'Yeni Kullanıcı Ekle', iconName: 'user-plus' },
  { label: 'Rol & Yetki Yönetimi', iconName: 'shield-check' },
  { label: 'Audit Log İndir', iconName: 'file-text' },
  { label: 'Veritabanı Yedekle', iconName: 'database' },
];
