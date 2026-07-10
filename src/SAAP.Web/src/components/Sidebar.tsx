import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScrollText,
  BarChart3,
  UserCog,
  Menu,
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/audit', label: 'Denetim Yönetimi', icon: <ScrollText size={18} />, badge: '12' },
  { to: '/reporting', label: 'Raporlama', icon: <BarChart3 size={18} /> },
  { to: '/settings', label: 'Ayarlar', icon: <UserCog size={18} /> },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Ana Menü</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setOpen(false)}
              >
                <span className="link-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="link-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <strong>SAAP Platform</strong>
            <br />
            v1.0.0 · Antigravity UI
          </div>
        </div>
      </aside>

      <button
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Menüyü aç"
      >
        <Menu size={22} />
      </button>
    </>
  );
}
