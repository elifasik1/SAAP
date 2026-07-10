// =============================================
// SAAP — API Service Layer
// =============================================

const API_BASE_URL = 'https://localhost:7021/api';

// Helper to get headers with token
const getHeaders = (contentType = 'application/json') => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = localStorage.getItem('saap_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    }

    const data = await response.json(); // returns { token, expiration }
    localStorage.setItem('saap_token', data.token);
    return data;
  },

  async register(formData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errors = await response.json().catch(() => []);
      const errMsg = Array.isArray(errors) 
        ? errors.map((e: any) => e.description).join(', ') 
        : errors.message || 'Kayıt başarısız.';
      throw new Error(errMsg);
    }

    return response.json();
  },

  logout() {
    localStorage.removeItem('saap_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('saap_token');
  },

  // --- Audit Logs ---
  async getAuditLogs() {
    const response = await fetch(`${API_BASE_URL}/audit-logs`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('saap_token');
        throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
      throw new Error('Audit logları yüklenirken bir hata oluştu.');
    }

    return response.json(); // returns array of AuditLogs
  }
};
