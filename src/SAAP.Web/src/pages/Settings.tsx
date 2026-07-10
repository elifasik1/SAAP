import { useState } from 'react';
import { Camera, ShieldCheck, User, Save } from 'lucide-react';
import { userProfile, securityToggles as initialToggles } from '../data/mockData';
import Breadcrumb from '../components/Breadcrumb';
import { logout } from '../services/auth';
import './Settings.css';

export default function Settings() {
  const [profile, setProfile] = useState(userProfile);
  const [toggles, setToggles] = useState(initialToggles);

  const handleToggleChange = (id: string) => {
    setToggles(prev =>
      prev.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Ayarlar başarıyla kaydedildi!');
  };

  return (
    <main className="settings">
      <div className="settings-header animate-fade-in">
        <h2>Kullanıcı Profili ve Ayarlar</h2>
        <p>Hesap bilgilerinizi güncelleyin ve güvenlik tercihlerini yönetin.</p>
        <Breadcrumb />
      </div>

      <div className="settings-grid">
        {/* Profile Card (Left Column) */}
        <section className="card profile-card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <div className="profile-avatar-container">
            {profile.avatarInitials}
            <label className="profile-upload-badge" title="Profil Fotoğrafı Yükle">
              <Camera size={16} />
              <input type="file" style={{ display: 'none' }} accept="image/*" />
            </label>
          </div>
          
          <div>
            <h3 className="profile-name">{profile.firstName} {profile.lastName}</h3>
            <span className="profile-role">{profile.role}</span>
          </div>

          <div className="profile-details-list">
            <div className="profile-detail-item">
              <span>Departman</span>
              <span>{profile.department}</span>
            </div>
            <div className="profile-detail-item">
              <span>E-posta</span>
              <span>{profile.email}</span>
            </div>
            <div className="profile-detail-item">
              <span>Katılım Tarihi</span>
              <span>{profile.joinDate}</span>
            </div>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '24px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={logout}>
            Çıkış Yap
          </button>
        </section>

        {/* Settings Forms (Right Column) */}
        <section className="settings-main">
          {/* Profile Edit Card */}
          <form className="card animate-fade-in-up" style={{ animationDelay: '160ms' }} onSubmit={handleSave}>
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
                  value={profile.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Soyad</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="input"
                  value={profile.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="email">E-posta Adresi</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={profile.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="settings-actions" style={{ marginTop: '24px' }}>
              <button type="submit" className="btn">
                <Save size={16} />
                Kaydet
              </button>
            </div>
          </form>

          {/* Security Settings Card */}
          <section className="card animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <h3 className="settings-card-title">
              <ShieldCheck size={18} className="text-accent" />
              Güvenlik Tercihleri
            </h3>

            <div className="toggles-list">
              {toggles.map((toggle) => (
                <div key={toggle.id} className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-title">{toggle.label}</span>
                    <span className="toggle-description">{toggle.description}</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={toggle.enabled}
                      onChange={() => handleToggleChange(toggle.id)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
