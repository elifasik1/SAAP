import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

interface SearchResult {
  title: string;
  category: string;
  path: string;
}

const mockSearchDatabase: SearchResult[] = [
  { title: 'Dashboard', category: 'Sayfa', path: '/' },
  { title: 'Denetim Yönetimi', category: 'Sayfa', path: '/audit' },
  { title: 'Raporlama ve Analitik', category: 'Sayfa', path: '/reporting' },
  { title: 'Ayarlar ve Profil', category: 'Sayfa', path: '/settings' },
  { title: 'Son Audit Kayıtları', category: 'Log', path: '/audit' },
  { title: 'API Trafik Analizi Grafiği', category: 'Grafik', path: '/' },
  { title: 'Kullanıcı Rol Yetkileri', category: 'Güvenlik', path: '/settings' },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  
  const navigate = useNavigate();
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Shell for future API search implementation
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Simple filter matching title/category
    const matches = mockSearchDatabase.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(matches);
  }, []);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleSearch(val);
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="navbar-logo">S</div>
        <h1 className="navbar-title">
          SAAP
          <span>Dashboard</span>
        </h1>
      </Link>

      <div className="navbar-actions">
        <div className="navbar-search" ref={searchDropdownRef}>
          <Search size={14} className="navbar-search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Ara..."
            value={searchQuery}
            onChange={onSearchInputChange}
          />
          {searchQuery && (
            <div className="search-results-dropdown">
              {searchResults.length === 0 ? (
                <div className="search-no-results">Sonuç bulunamadı</div>
              ) : (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    className="search-result-item"
                    onClick={() => handleResultClick(res.path)}
                  >
                    <span>{res.title}</span>
                    <span className="search-result-category">{res.category}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="navbar-divider" />

        <div style={{ position: 'relative' }}>
          <button 
            className="navbar-icon-btn" 
            title="Bildirimler"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && <span className="badge" />}
          </button>

          {showNotifications && (
            <NotificationDropdown
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={setUnreadNotificationsCount}
            />
          )}
        </div>

        <button className="navbar-icon-btn" title="Ayarlar" onClick={() => navigate('/settings')}>
          <Settings size={18} />
        </button>

        <div className="navbar-divider" />

        <div className="navbar-user" onClick={() => navigate('/settings')}>
          <div className="navbar-avatar">EA</div>
          <span className="navbar-username">Elif A.</span>
        </div>
      </div>
    </nav>
  );
}
