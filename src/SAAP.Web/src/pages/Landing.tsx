import { Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Zap, Database } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing animate-fade-in">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Zap size={12} className="text-accent" />
          <span>SAAP PLATFORM v1.0 ÇIKTI</span>
        </div>
        <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Güvenli, Akıcı ve <br />
          <span className="text-glow">Sıfır Yerçekimi Mimarisi</span>
        </h1>
        <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          Gelişmiş yetkilendirme, gerçek zamanlı denetim izleri ve yüksek performanslı Redis/EF Core katmanıyla API operasyonlarınızı tek bir merkezden yönetin.
        </p>
        <div className="hero-cta animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Link to="/login" className="btn">
            Platforma Giriş Yap
            <ArrowRight size={16} />
          </Link>
          <Link to="/register" className="btn btn-outline">
            Hemen Kaydol
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-features">
        <div className="landing-feature-card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="feature-icon">
            <Shield size={20} />
          </div>
          <h3>Detaylı Audit Loglama</h3>
          <p>Tüm HTTP istekleri, durum kodları ve işlem süreleri güvenli bir veri tabanında izlenir.</p>
        </div>

        <div className="landing-feature-card animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="feature-icon">
            <Lock size={20} />
          </div>
          <h3>Gelişmiş Yetki Yönetimi</h3>
          <p>Kullanıcı rolleri ve güvenli yetkilendirme katmanları ile hassas endpoint'lerinizi koruyun.</p>
        </div>

        <div className="landing-feature-card animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="feature-icon">
            <Database size={20} />
          </div>
          <h3>Redis & PostgreSQL</h3>
          <p>Yüksek performanslı önbellekleme ve ölçeklenebilir veri tabanı mimarisi bir arada.</p>
        </div>
      </section>
    </div>
  );
}
