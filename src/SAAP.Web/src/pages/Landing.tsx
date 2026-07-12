import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  ArrowRight,
  Zap,
  Database,
  BarChart3,
  ScrollText,
  UserCheck,
  Activity,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const features = [
  {
    icon: ScrollText,
    title: 'Detaylı Audit Loglama',
    description: 'Her HTTP isteği IP, endpoint, durum kodu ve süre ile kayıt altına alınır. Kendi hesabınıza ait logları anında görüntüleyin.',
  },
  {
    icon: Lock,
    title: 'JWT Kimlik Doğrulama',
    description: 'Güvenli token tabanlı oturum yönetimi. Her kullanıcı yalnızca kendi verilerine erişebilir.',
  },
  {
    icon: Database,
    title: 'Redis & PostgreSQL',
    description: 'Yüksek performanslı rate limiting ve ölçeklenebilir veri tabanı mimarisi tek platformda.',
  },
  {
    icon: BarChart3,
    title: 'Gerçek Zamanlı Analitik',
    description: 'Trafik grafikleri, yoğunluk haritaları ve aylık hata trendleri ile API sağlığını izleyin.',
  },
  {
    icon: Shield,
    title: 'Rol Tabanlı Yetkilendirme',
    description: 'ASP.NET Identity ile kullanıcı rolleri ve endpoint koruması. Hassas kaynaklar güvende.',
  },
  {
    icon: Activity,
    title: 'Rate Limiting',
    description: 'Redis destekli IP bazlı istek sınırlama. DDoS ve brute-force saldırılarına karşı koruma.',
  },
];

const steps = [
  { step: '01', title: 'Hesap Oluştur', description: 'E-posta ile ücretsiz kayıt olun ve platforma erişim kazanın.' },
  { step: '02', title: 'API Kullanın', description: 'Kimlik doğrulamalı istekleriniz otomatik olarak loglanır.' },
  { step: '03', title: 'Loglarınızı İzleyin', description: 'Dashboard ve denetim panelinden kendi istek geçmişinizi analiz edin.' },
];

const stats = [
  { value: '100+', label: 'Log / Kullanıcı' },
  { value: '<50ms', label: 'Ort. Yanıt Süresi' },
  { value: '7/24', label: 'İzleme' },
  { value: 'CSV', label: 'Dışa Aktarma' },
];

export default function Landing() {
  const { isAuthenticated, user, loading } = useAuth();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav animate-fade-in">
        <Link to="/" className="landing-nav-brand">
          <div className="landing-nav-logo"><ShieldCheck size={20} strokeWidth={2.5} /></div>
          <span>SAAP <small>SECURITY</small></span>
        </Link>
        <nav className="landing-nav-links">
          <a href="#features">Özellikler</a>
          <a href="#how-it-works">Nasıl Çalışır</a>
          {!loading && (
            isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-sm">
                Dashboard
                <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-login">Giriş Yap</Link>
                <Link to="/register" className="btn btn-sm">Kayıt Ol</Link>
              </>
            )
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-glow" />
        <div className="hero-badge animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Zap size={12} className="text-accent" />
          <span>SAAP PLATFORM v1.0</span>
        </div>
        <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          API Güvenliğinizi <br />
          <span className="text-glow">Tek Merkezden Yönetin</span>
        </h1>
        <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          Gelişmiş kimlik doğrulama, kullanıcıya özel denetim izleri ve gerçek zamanlı analitik.
          Her hesap kendi API loglarını görür — verileriniz izole ve güvende.
        </p>
        <div className="hero-cta animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-lg">
              {user ? `Hoş geldin, ${user.firstName}` : 'Dashboard\'a Git'}
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-lg">
                Ücretsiz Başla
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Giriş Yap
              </Link>
            </>
          )}
        </div>

        <div className="hero-product-preview animate-fade-in-up" style={{ animationDelay: '460ms' }} aria-label="SAAP dashboard önizlemesi">
          <div className="preview-topbar">
            <div className="preview-brand"><span className="preview-brand-mark">S</span><span>SAAP <em>Security Console</em></span></div>
            <span className="preview-status"><span /> Tüm sistemler çalışıyor</span>
          </div>
          <div className="preview-body">
            <aside className="preview-sidebar">
              <span className="preview-nav-active">Genel Bakış</span>
              <span>Denetim Kayıtları</span>
              <span>Raporlama</span>
              <span>Ayarlar</span>
            </aside>
            <div className="preview-content">
              <div className="preview-heading"><div><span>Canlı görünüm</span><strong>API güvenlik özeti</strong></div><ArrowUpRight size={17} /></div>
              <div className="preview-metrics">
                <div><small>İstekler</small><strong>12.8K</strong><span className="metric-good">+18.4%</span></div>
                <div><small>Engellenen</small><strong>32</strong><span className="metric-warn">Bugün</span></div>
                <div><small>Ort. yanıt</small><strong>42ms</strong><span className="metric-good">Sağlıklı</span></div>
              </div>
              <div className="preview-chart"><div className="chart-label"><span>İstek trafiği</span><span>Son 24 saat</span></div><div className="chart-bars">{[24, 38, 31, 54, 47, 71, 59, 82, 64, 91, 76, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div>
              <div className="preview-log"><span className="log-icon"><ShieldCheck size={14} /></span><div><strong>GET /api/audit-logs</strong><small>Başarıyla kaydedildi · 42ms</small></div><span className="log-code">200</span></div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          {stats.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="section-header animate-fade-in-up">
          <h2>Platform Özellikleri</h2>
          <p>Modern API yönetimi için ihtiyacınız olan her şey tek bir arayüzde.</p>
        </div>
        <div className="landing-features-grid">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="landing-feature-card animate-fade-in-up"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className="feature-icon">
                <feature.icon size={20} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-steps-section">
        <div className="section-header animate-fade-in-up">
          <h2>Nasıl Çalışır?</h2>
          <p>Üç adımda API izleme ve güvenlik yönetimine başlayın.</p>
        </div>
        <div className="landing-steps">
          {steps.map((item, i) => (
            <div
              key={item.step}
              className="landing-step-card animate-fade-in-up"
              style={{ animationDelay: `${200 + i * 120}ms` }}
            >
              <span className="step-number">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Trust / highlights */}
      <section className="landing-section">
        <div className="landing-highlights animate-fade-in-up">
          <div className="highlight-item">
            <CheckCircle2 size={18} className="text-accent" />
            <span>Kullanıcıya özel log izolasyonu</span>
          </div>
          <div className="highlight-item">
            <CheckCircle2 size={18} className="text-accent" />
            <span>JWT Bearer token kimlik doğrulama</span>
          </div>
          <div className="highlight-item">
            <CheckCircle2 size={18} className="text-accent" />
            <span>CSV dışa aktarma desteği</span>
          </div>
          <div className="highlight-item">
            <UserCheck size={18} className="text-accent" />
            <span>Profil yönetimi ve güvenlik ayarları</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section animate-fade-in-up">
        <div className="landing-cta-card">
          <h2>API operasyonlarınızı kontrol altına alın</h2>
          <p>Hemen kayıt olun ve kendi hesabınıza ait audit loglarını izlemeye başlayın.</p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-lg">
                Dashboard'a Git
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-lg">
                  Hemen Kaydol
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Giriş Yap
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <div className="landing-nav-logo"><ShieldCheck size={20} strokeWidth={2.5} /></div>
          <span>SAAP Platform</span>
        </div>
        <div className="landing-footer-links">
          <Link to="/login">Giriş</Link>
          <Link to="/register">Kayıt</Link>
          <a href="#features">Özellikler</a>
        </div>
        <p className="landing-footer-copy">© 2026 SAAP · Antigravity UI · v1.0.0</p>
      </footer>
    </div>
  );
}
