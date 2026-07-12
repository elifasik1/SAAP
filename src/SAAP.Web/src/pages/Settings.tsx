import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  ShieldCheck,
  User,
  Save,
  KeyRound,
  Lock,
  Globe,
  BellRing,
  RefreshCw,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { defaultSecuritySettings, type SecuritySettings } from '../types';
import './Settings.css';

type SecurityToggleId = keyof SecuritySettings;

interface SecurityToggle {
  id: SecurityToggleId;
  label: string;
  description: string;
  icon: LucideIcon;
  category: 'auth' | 'access' | 'monitoring';
  recommended?: boolean;
}

const securityToggles: SecurityToggle[] = [
  {
    id: 'twoFactorEnabled',
    label: 'İki Faktörlü Doğrulama',
    description: 'Giriş yaparken SMS veya Authenticator ile ek doğrulama katmanı',
    icon: Fingerprint,
    category: 'auth',
    recommended: true,
  },
  {
    id: 'sessionLockEnabled',
    label: 'Otomatik Oturum Kilitleme',
    description: '15 dakika hareketsizlikte oturumu otomatik olarak kilitle',
    icon: Lock,
    category: 'access',
    recommended: true,
  },
  {
    id: 'ipWhitelistEnabled',
    label: 'IP Beyaz Listesi',
    description: 'Yalnızca onaylı IP adreslerinden API erişimine izin ver',
    icon: Globe,
    category: 'access',
  },
  {
    id: 'auditNotificationsEnabled',
    label: 'Kritik Audit Bildirimleri',
    description: '5xx hataları veya yetkisiz erişim denemelerinde anlık bildirim',
    icon: BellRing,
    category: 'monitoring',
    recommended: true,
  },
  {
    id: 'apiKeyRotationEnabled',
    label: 'API Anahtar Rotasyonu',
    description: 'API anahtarlarını her 30 günde otomatik olarak yenile',
    icon: KeyRound,
    category: 'monitoring',
  },
];

const categoryLabels: Record<SecurityToggle['category'], string> = {
  auth: 'Kimlik Doğrulama',
  access: 'Oturum & Erişim',
  monitoring: 'İzleme & Uyarılar',
};

function getSecurityScore(settings: SecuritySettings): number {
  const weights: Record<SecurityToggleId, number> = {
    twoFactorEnabled: 30,
    sessionLockEnabled: 20,
    ipWhitelistEnabled: 20,
    auditNotificationsEnabled: 15,
    apiKeyRotationEnabled: 15,
  };

  return Object.entries(weights).reduce(
    (score, [key, weight]) => score + (settings[key as SecurityToggleId] ? weight : 0),
    0,
  );
}

function getScoreLabel(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Güçlü', className: 'strong' };
  if (score >= 50) return { label: 'Orta', className: 'medium' };
  return { label: 'Zayıf', className: 'weak' };
}

export default function Settings() {
  const { user, loading, logout, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [securityLoading, setSecurityLoading] = useState(true);
  const [securityError, setSecurityError] = useState('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);

  const loadSecuritySettings = useCallback(async () => {
    try {
      setSecurityLoading(true);
      setSecurityError('');
      const data = await api.getSecuritySettings();
      setSecuritySettings(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Güvenlik ayarları alınamadı.';
      setSecurityError(message);
      setSecuritySettings(defaultSecuritySettings);
    } finally {
      setSecurityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    }
  }, [user]);

  useEffect(() => {
    void loadSecuritySettings();
  }, [loadSecuritySettings]);

  useEffect(() => {
    if (location.hash === '#security') {
      document.getElementById('security')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const securityScore = useMemo(
    () => getSecurityScore(securitySettings ?? defaultSecuritySettings),
    [securitySettings],
  );
  const scoreMeta = getScoreLabel(securityScore);

  const handleToggleChange = async (id: SecurityToggleId) => {
    if (!securitySettings) return;
    const previous = securitySettings;
    const next = { ...previous, [id]: !previous[id] };
    setSecuritySettings(next);

    try {
      const updated = await api.updateSecuritySettings(next);
      setSecuritySettings(updated);
      showToast('Güvenlik tercihi kaydedildi.', 'success');
    } catch (err: unknown) {
      setSecuritySettings(previous);
      showToast(err instanceof Error ? err.message : 'Güvenlik tercihi kaydedilemedi.', 'error');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await api.updateAvatar(file);
      await refreshProfile();
      showToast('Profil görseli güncellendi.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Profil görseli güncellenemedi.', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      showToast('Lütfen tüm alanları doldurun.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });
      await refreshProfile();
      showToast('Profil başarıyla güncellendi.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Profil güncellenemedi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="settings">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="settings">
      <div className="settings-header animate-fade-in">
        <h2>Kullanıcı Profili ve Ayarlar</h2>
        <p>Hesap bilgilerinizi güncelleyin ve güvenlik tercihlerini yönetin.</p>
        <Breadcrumb />
      </div>

      <div className="settings-grid">
        <section className="card profile-card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="profile-avatar-container">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profil görseli" />
            ) : (
              user.avatarInitials
            )}
            <label className="profile-upload-badge" title="Profil Fotoğrafı Yükle">
              <Camera size={16} />
              <input
                type="file"
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div>
            <h3 className="profile-name">
              {user.firstName} {user.lastName}
            </h3>
            <span className="profile-role">{user.role}</span>
          </div>
          <div className="profile-details-list">
            <div className="profile-detail-item">
              <span>E-posta</span>
              <span>{user.email}</span>
            </div>
            <div className="profile-detail-item">
              <span>Hesap ID</span>
              <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>{user.id}</span>
            </div>
          </div>
          <button
            className="btn btn-outline logout-btn"
            onClick={logout}
          >
            Çıkış Yap
          </button>
        </section>

        <section className="settings-main">
          <form
            className="card animate-fade-in-up"
            style={{ animationDelay: '160ms' }}
            onSubmit={handleSave}
          >
            <h3 className="settings-card-title">
              <User size={18} className="text-accent" />
              Profil Bilgileri
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">Ad</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Soyad</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="email">E-posta Adresi</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="settings-actions">
              <button type="submit" className="btn" disabled={saving}>
                <Save size={16} />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>

          <section id="security" className="card security-card animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <div className="security-card-header">
              <div>
                <h3 className="settings-card-title">
                  <ShieldCheck size={18} className="text-accent" />
                  Güvenlik Tercihleri
                </h3>
                <p className="security-card-subtitle">
                  Hesabınızın güvenlik seviyesini artırmak için tercihlerinizi yönetin.
                </p>
              </div>
              <div className={`security-score-badge ${scoreMeta.className}`}>
                <ShieldCheck size={16} />
                <div>
                  <span>Güvenlik Skoru</span>
                  <strong>
                    {securityScore}% · {scoreMeta.label}
                  </strong>
                </div>
              </div>
            </div>

            <div className="security-score-bar">
              <div className="security-score-fill" style={{ width: `${securityScore}%` }} />
            </div>

            {securityError && (
              <div className="security-error-banner">
                <ShieldAlert size={16} />
                <span>{securityError}</span>
                <button type="button" onClick={loadSecuritySettings}>
                  Tekrar Dene
                </button>
              </div>
            )}

            {securityLoading ? (
              <div className="security-skeleton">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="security-skeleton-row" />
                ))}
              </div>
            ) : (
              Object.entries(categoryLabels).map(([category, label]) => {
                const items = securityToggles.filter((t) => t.category === category);
                if (items.length === 0) return null;

                return (
                  <div key={category} className="security-category">
                    <h4 className="security-category-title">{label}</h4>
                    <div className="toggles-list">
                      {items.map((toggle) => {
                        const Icon = toggle.icon;
                        const enabled = securitySettings?.[toggle.id] ?? false;

                        return (
                          <div
                            key={toggle.id}
                            className={`toggle-item ${enabled ? 'enabled' : ''}`}
                          >
                            <div className="toggle-icon">
                              <Icon size={18} />
                            </div>
                            <div className="toggle-info">
                              <div className="toggle-title-row">
                                <span className="toggle-title">{toggle.label}</span>
                                {toggle.recommended && (
                                  <span className="toggle-recommended">Önerilen</span>
                                )}
                              </div>
                              <span className="toggle-description">{toggle.description}</span>
                            </div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => handleToggleChange(toggle.id)}
                              />
                              <span className="slider" />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {!securityLoading && (
              <div className="security-footer-note">
                <RefreshCw size={13} />
                Değişiklikler anında kaydedilir ve bildirim merkezine yansıtılır.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
