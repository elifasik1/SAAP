import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormInvalid = !name.trim() || !email || !password || password.length < 6 || password !== confirmPassword || !isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) {
      let validationMsg = 'Lütfen tüm alanları doldurun.';
      if (password !== confirmPassword) {
        validationMsg = 'Şifreler eşleşmiyor!';
      } else if (password.length < 6) {
        validationMsg = 'Şifre en az 6 karakter olmalıdır.';
      } else if (!isValidEmail) {
        validationMsg = 'Geçerli bir e-posta adresi girin.';
      }
      setError(validationMsg);
      showToast(validationMsg, 'error');
      return;
    }
    
    setLoading(true);
    setError('');

    // Parse FirstName and LastName from Name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '.';

    try {
      await api.register({
        email,
        password,
        firstName,
        lastName
      });
      showToast('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
      navigate('/login');
    } catch (err: any) {
      const errMsg = err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">S</div>
          <h2>Hesap Oluştur</h2>
          <p>SAAP Platformuna kaydolun</p>
        </div>

        {error && (
          <div className="text-danger" style={{ fontSize: '12px', textAlign: 'center', background: 'rgba(248, 113, 113, 0.1)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Ad Soyad</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Elif Arslan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className="input"
                placeholder="ornek@saap.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <div className="input-icon-wrapper">
              <ShieldCheck size={16} className="input-icon" />
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-auth" disabled={loading || isFormInvalid}>
            {loading ? 'Kaydolunuyor...' : 'Kaydol'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="auth-footer">
          Zaten hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
        </div>
      </div>
    </main>
  );
}
