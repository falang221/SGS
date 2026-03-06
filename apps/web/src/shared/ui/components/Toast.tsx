import React from 'react';
import { useToastStore, ToastType } from '../../store/useToastStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: any; onRemove: () => void }> = ({ toast, onRemove }) => {
  const icons: Record<ToastType, any> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = icons[toast.type as ToastType] || Info;

  const variants: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    error: 'bg-rose-50 border-rose-100 text-rose-800',
    info: 'bg-brand-50 border-brand-100 text-brand-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
  };

  const iconColors: Record<ToastType, string> = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    info: 'text-brand-500',
    warning: 'text-amber-500',
  };

  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-lg animate-in slide-in-from-right-full duration-300',
        variants[toast.type as ToastType]
      )}
    >
      <div className={clsx('mt-0.5', iconColors[toast.type as ToastType])}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold leading-tight">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
