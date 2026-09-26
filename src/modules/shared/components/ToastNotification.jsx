import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className={`toast-container ${isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info'}`}>
      <div className="toast-icon">
        {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
        {isError && <AlertCircle size={18} className="text-rose-400" />}
        {!isSuccess && !isError && <Info size={18} className="text-blue-400" />}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button onClick={onClose} className="btn-icon-subtle" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
