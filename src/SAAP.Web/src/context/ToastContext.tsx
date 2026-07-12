import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import '../components/Toast.css';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    let shouldSchedule = false;

    setToasts((prev) => {
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      shouldSchedule = true;
      return [...prev, { id, message, type }].slice(-3);
    });

    if (shouldSchedule) {
      setTimeout(() => removeToast(id), 4000);
    }
  }, [removeToast]);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-success" />;
      case 'error':
        return <ShieldAlert size={16} className="text-danger" />;
      default:
        return <Info size={16} className="text-accent" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {getIcon(toast.type)}
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
