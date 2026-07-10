// =============================================
// SAAP — Authentication Services
// =============================================

export function logout() {
  localStorage.removeItem('saap_token');
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function getToken(): string | null {
  return localStorage.getItem('saap_token') || localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
