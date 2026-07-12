import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AuditManagement from './pages/AuditManagement';
import Reporting from './pages/Reporting';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function AppContent() {
  const location = useLocation();
  const isAuthOrLanding = ['/', '/landing', '/login', '/register'].includes(location.pathname);

  if (isAuthOrLanding) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      
      <div className="main-content-layout">
        <Sidebar />
        
        <div className="page-wrapper">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditManagement /></ProtectedRoute>} />
            <Route path="/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
