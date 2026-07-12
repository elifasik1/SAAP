// =============================================
// SAAP — Shared Types
// =============================================

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

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  joinDate?: string;
  avatarInitials: string;
  avatarUrl?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionLockEnabled: boolean;
  ipWhitelistEnabled: boolean;
  auditNotificationsEnabled: boolean;
  apiKeyRotationEnabled: boolean;
}

export const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionLockEnabled: true,
  ipWhitelistEnabled: false,
  auditNotificationsEnabled: true,
  apiKeyRotationEnabled: false,
};

export function mapSecuritySettingsFromApi(data: Record<string, unknown>): SecuritySettings {
  return {
    twoFactorEnabled: Boolean(data.twoFactorEnabled ?? data.TwoFactorEnabled ?? false),
    sessionLockEnabled: Boolean(data.sessionLockEnabled ?? data.SessionLockEnabled ?? true),
    ipWhitelistEnabled: Boolean(data.ipWhitelistEnabled ?? data.IpWhitelistEnabled ?? false),
    auditNotificationsEnabled: Boolean(
      data.auditNotificationsEnabled ?? data.AuditNotificationsEnabled ?? true,
    ),
    apiKeyRotationEnabled: Boolean(data.apiKeyRotationEnabled ?? data.ApiKeyRotationEnabled ?? false),
  };
}

export interface AppNotification {
  id: string;
  type: 'error' | 'report' | 'system' | 'info';
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface TrafficDataPoint {
  time: string;
  requests: number;
  errors: number;
}

export function mapAuditLogFromApi(log: Record<string, unknown>): AuditEntry {
  const createdAtRaw = log.createdAt ?? log.CreatedAt;
  const createdAt = createdAtRaw
    ? new Date(String(createdAtRaw)).toISOString().replace('T', ' ').slice(0, 19)
    : '';

  return {
    id: String(log.id ?? log.Id ?? crypto.randomUUID()),
    ip: String(log.ip ?? log.ipAddress ?? log.IpAddress ?? '0.0.0.0'),
    path: String(log.endpoint ?? log.Endpoint ?? log.path ?? log.Path ?? '/'),
    method: String(log.method ?? log.Method ?? log.httpMethod ?? log.HttpMethod ?? 'GET'),
    statusCode: Number(log.status ?? log.Status ?? log.statusCode ?? log.StatusCode ?? 200),
    durationMs: Number(log.duration ?? log.Duration ?? log.durationMs ?? log.DurationMs ?? 0),
    user: String(log.user ?? log.User ?? log.userEmail ?? log.UserEmail ?? 'anonim'),
    createdAt,
  };
}

export function buildTrafficFromLogs(logs: AuditEntry[]): TrafficDataPoint[] {
  const buckets = new Map<string, { requests: number; errors: number }>();

  logs.forEach((log) => {
    const hour = log.createdAt ? log.createdAt.slice(11, 13) + ':00' : '00:00';
    const current = buckets.get(hour) ?? { requests: 0, errors: 0 };
    current.requests += 1;
    if (log.statusCode >= 400) current.errors += 1;
    buckets.set(hour, current);
  });

  if (buckets.size === 0) {
    return [{ time: '00:00', requests: 0, errors: 0 }];
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, data]) => ({ time, ...data }));
}

export function getAvatarInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || 'U';
}

export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
}

export interface MonthlyTrend {
  month: string;
  riskScore: number;
  incidents: number;
  resolved: number;
}

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const HEATMAP_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function parseLogDate(createdAt: string): Date | null {
  if (!createdAt) return null;
  const date = new Date(createdAt.includes('T') ? createdAt : createdAt.replace(' ', 'T'));
  return isNaN(date.getTime()) ? null : date;
}

export function buildHeatmapFromLogs(logs: AuditEntry[]): HeatmapCell[] {
  const buckets = new Map<string, number>();

  logs.forEach((log) => {
    const date = parseLogDate(log.createdAt);
    if (!date) return;
    const day = DAY_LABELS[date.getDay()];
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });

  const maxCount = Math.max(...buckets.values(), 1);

  const cells: HeatmapCell[] = [];
  HEATMAP_DAYS.forEach((day) => {
    for (let h = 0; h < 24; h++) {
      const count = buckets.get(`${day}-${h}`) ?? 0;
      cells.push({ day, hour: h, value: Math.round((count / maxCount) * 100) });
    }
  });
  return cells;
}

export function buildMonthlyTrendsFromLogs(logs: AuditEntry[]): MonthlyTrend[] {
  const buckets = new Map<number, { total: number; incidents: number; resolved: number }>();

  logs.forEach((log) => {
    const date = parseLogDate(log.createdAt);
    if (!date) return;
    const month = date.getMonth();
    const current = buckets.get(month) ?? { total: 0, incidents: 0, resolved: 0 };
    current.total += 1;
    if (log.statusCode >= 400) current.incidents += 1;
    else current.resolved += 1;
    buckets.set(month, current);
  });

  if (buckets.size === 0) {
    return [{ month: MONTH_LABELS[new Date().getMonth()], riskScore: 0, incidents: 0, resolved: 0 }];
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, data]) => ({
      month: MONTH_LABELS[month],
      riskScore: data.total > 0 ? Math.round((data.incidents / data.total) * 100) : 0,
      incidents: data.incidents,
      resolved: data.resolved,
    }));
}
