import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Bell, Settings, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { api } from '../services/api';
import './Navbar.css';

interface SearchResult { title: string; category: string; path: string; }

export default function Navbar() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const navigate = useNavigate();
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    try { setSearchResults(await api.search(query)); } catch { setSearchResults([]); }
  }, []);
  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const value = e.target.value; setSearchQuery(value); void handleSearch(value); };
  const handleResultClick = (path: string) => { navigate(path); setSearchQuery(''); setSearchResults([]); };
  useEffect(() => {
    const close = (event: MouseEvent) => { if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) setSearchResults([]); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, []);

  return <nav className="navbar">
    <Link to="/dashboard" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit' }}><div className="navbar-logo"><ShieldCheck size={19} strokeWidth={2.5} /></div><h1 className="navbar-title">SAAP<span>Security Console</span></h1></Link>
    <div className="navbar-actions">
      <div className="navbar-search" ref={searchDropdownRef}><Search size={14} className="navbar-search-icon" /><input type="text" className="input" placeholder="Ara..." value={searchQuery} onChange={onSearchInputChange} />
        {searchQuery && <div className="search-results-dropdown">{searchResults.length === 0 ? <div className="search-no-results">Sonuç bulunamadı</div> : searchResults.map((res, i) => <button key={`${res.path}-${i}`} className="search-result-item" onClick={() => handleResultClick(res.path)}><span>{res.title}</span><span className="search-result-category">{res.category}</span></button>)}</div>}
      </div>
      <div className="navbar-divider" />
      <div style={{ position: 'relative' }}><button className="navbar-icon-btn" title="Bildirimler" onClick={() => setShowNotifications(!showNotifications)}><Bell size={18} />{unreadNotificationsCount > 0 && <span className="badge" />}</button>{showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} onUnreadCountChange={setUnreadNotificationsCount} />}</div>
      <button className="navbar-icon-btn" title="Ayarlar" onClick={() => navigate('/settings')}><Settings size={18} /></button><div className="navbar-divider" />
      <div className="navbar-user" onClick={() => navigate('/settings')}><div className="navbar-avatar">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user?.avatarInitials ?? 'U'}</div><span className="navbar-username">{user ? `${user.firstName} ${user.lastName.charAt(0)}.` : 'Kullanıcı'}</span></div>
    </div>
  </nav>;
}
