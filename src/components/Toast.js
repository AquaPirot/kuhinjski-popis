import { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, showToast };
}

const ICON = { success: CheckCircle, error: AlertCircle, info: Info };
const COLOR = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = ICON[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`${COLOR[toast.type] || COLOR.info} text-white flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-toast-in max-w-sm`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
