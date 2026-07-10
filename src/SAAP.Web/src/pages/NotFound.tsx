import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <main className="not-found animate-fade-in">
      <div className="not-found-card">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Sayfa Bulunamadı</h2>
        <p className="not-found-text">
          Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
        </p>
        <Link to="/" className="btn">
          <Home size={16} />
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
