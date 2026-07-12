// =============================================
// SAAP — API Service Layer (Axios)
// =============================================

import axios from 'axios';
import { mapAuditLogFromApi, mapSecuritySettingsFromApi, type AppNotification, type AuditEntry, type SecuritySettings, type UserProfile, getAvatarInitials } from '../types';

const TOKEN_KEY = 'token';
const AUTH_PATHS = ['/auth/login', '/auth/register'];

const apiClient = axios.create({
  baseURL: 'http://localhost:5181/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('saap_token');
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? '';
    const isAuthRequest = AUTH_PATHS.some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('saap_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol edin.';
    }
    const data = error.response.data;
    if (typeof data === 'string' && data) return data;
    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string') return data.message;
      if ('Message' in data && typeof data.Message === 'string') return data.Message;
      if (Array.isArray(data)) {
        return data.map((e: { description?: string }) => e.description).filter(Boolean).join(', ') || fallback;
      }
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapUserProfile(data: Record<string, unknown>): UserProfile {
  const firstName = String(data.firstName ?? data.FirstName ?? '');
  const lastName = String(data.lastName ?? data.LastName ?? '');
  return {
    id: String(data.id ?? data.Id ?? ''),
    firstName,
    lastName,
    email: String(data.email ?? data.Email ?? ''),
    role: String(data.role ?? data.Role ?? 'User'),
    avatarInitials: getAvatarInitials(firstName, lastName),
    avatarUrl: (data.avatarUrl ?? data.AvatarUrl)
      ? `http://localhost:5181${String(data.avatarUrl ?? data.AvatarUrl)}`
      : undefined,
  };
}

export const api = {
  async login(email: string, password: string) {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const token = data.token ?? data.Token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem('saap_token');
      }
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Giriş yapılamadı. Bilgilerinizi kontrol edin.'));
    }
  },

  async register(formData: Record<string, string>) {
    try {
      const { data } = await apiClient.post('/auth/register', formData);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Kayıt başarısız.'));
    }
  },

  async getMe(): Promise<UserProfile> {
    try {
      const { data } = await apiClient.get('/auth/me');
      return mapUserProfile(data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Profil bilgileri alınamadı.'));
    }
  },

  async updateProfile(profile: { firstName: string; lastName: string; email: string }): Promise<UserProfile> {
    try {
      const { data } = await apiClient.put('/auth/me', profile);
      return mapUserProfile(data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Profil güncellenemedi.'));
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('saap_token');
  },

  isAuthenticated() {
    return !!getStoredToken();
  },

  async getAuditLogs(): Promise<AuditEntry[]> {
    try {
      const { data } = await apiClient.get('/audit-logs');
      const list = Array.isArray(data) ? data : [];
      return list.map((log) => mapAuditLogFromApi(log as Record<string, unknown>));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Audit logları yüklenirken bir hata oluştu.'));
    }
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const { data } = await apiClient.get('/settings/security');
      return mapSecuritySettingsFromApi(data as Record<string, unknown>);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Güvenlik ayarları alınamadı.'));
    }
  },

  async updateSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    try {
      const { data } = await apiClient.put('/settings/security', settings);
      return mapSecuritySettingsFromApi(data as Record<string, unknown>);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Güvenlik ayarları kaydedilemedi.'));
    }
  },

  async updateAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.put('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return `http://localhost:5181${String(data.avatarUrl)}`;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Profil görseli güncellenemedi.'));
    }
  },

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const { data } = await apiClient.get('/notifications');
      return (data as Record<string, unknown>[]).map((item) => ({
        id: String(item.id), type: String(item.type) as AppNotification['type'], message: String(item.message),
        createdAt: String(item.createdAt), isRead: Boolean(item.isRead),
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Bildirimler alınamadı.'));
    }
  },

  async markNotificationRead(id: string) { await apiClient.patch(`/notifications/${id}/read`); },
  async markAllNotificationsRead() { await apiClient.patch('/notifications/read-all'); },

  async search(query: string): Promise<Array<{ title: string; category: string; path: string }>> {
    const { data } = await apiClient.get('/search', { params: { q: query } });
    return data as Array<{ title: string; category: string; path: string }>;
  },
};

export default apiClient;
