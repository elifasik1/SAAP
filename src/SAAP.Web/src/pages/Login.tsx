import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('saap_token') || localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormInvalid = !email || !password || !isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) {
      setError('Lütfen geçerli bir e-posta ve şifre girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.login(email, password);
      showToast('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.message || 'Giriş başarısız. Lütfen tekrar deneyin.';
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
          <h2>SAAP Platformu</h2>
          <p>Yönetici hesabınızla giriş yapın</p>
        </div>

        {error && (
          <div className="text-danger" style={{ fontSize: '12px', textAlign: 'center', background: 'rgba(248, 113, 113, 0.1)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <div className="label-row">
              <label htmlFor="password">Şifre</label>
              <a href="#forgot" className="forgot-password" onClick={(e) => { e.preventDefault(); alert('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'); }}>
                Şifremi Unuttum
              </a>
            </div>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-auth" disabled={loading || isFormInvalid}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="auth-footer">
          Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
        </div>
      </div>
    </main>
  );
}
