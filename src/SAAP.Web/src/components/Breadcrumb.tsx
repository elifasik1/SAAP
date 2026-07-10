import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

const routeMap: Record<string, string> = {
  '': 'Portal',
  'dashboard': 'Dashboard',
  'audit': 'Denetim Yönetimi',
  'reporting': 'Raporlama',
  'settings': 'Ayarlar',
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't render on landing or auth pages
  const isLandingOrAuth = ['/login', '/register', '/landing'].includes(location.pathname);
  if (isLandingOrAuth) return null;

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumbs">
        <li className="breadcrumb-item">
          <Link to="/">Platform</Link>
        </li>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = routeMap[value] || value;

          return (
            <li key={to} className="breadcrumb-item">
              <ChevronRight size={10} className="breadcrumb-separator" />
              {last ? (
                <span className="breadcrumb-item active">{label}</span>
              ) : (
                <Link to={to}>{label}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
