import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ToastContext } from './toast';

const toastStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    borderClass: 'border-emerald-200',
  },
  info: {
    icon: Info,
    iconClass: 'text-gold',
    borderClass: 'border-yellow-200',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    borderClass: 'border-amber-200',
  },
  danger: {
    icon: AlertTriangle,
    iconClass: 'text-red-600',
    borderClass: 'border-red-200',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'success', title, message }) => {
      const id = crypto.randomUUID();

      setToasts((current) =>
        [{ id, type, title, message }, ...current].slice(0, 4)
      );

      window.setTimeout(() => dismiss(id), 3200);
      return id;
    },
    [dismiss]
  );

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmation({
        tone: 'danger',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        ...options,
        resolve,
      });
    });
  }, []);

  const resolveConfirmation = (result) => {
    if (confirmation?.resolve) {
      confirmation.resolve(result);
    }

    setConfirmation(null);
  };

  const value = useMemo(() => ({ confirm, toast }), [confirm, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-24 z-[80] w-[calc(100%-2rem)] max-w-sm space-y-3 sm:right-6">
        {toasts.map((item) => {
          const style = toastStyles[item.type] || toastStyles.info;
          const ToastIcon = style.icon;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${style.borderClass}`}
              role="status"
            >
              <ToastIcon className={`mt-0.5 h-5 w-5 ${style.iconClass}`} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{item.title}</p>
                {item.message && (
                  <p className="mt-1 text-sm leading-5 text-muted">
                    {item.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-muted hover:bg-gray-100 hover:text-gray-900"
                aria-label="Fermer la notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {confirmation && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                {confirmation.tone === 'danger' ? (
                  <Trash2 size={22} />
                ) : (
                  <AlertTriangle size={22} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {confirmation.title}
                </h2>
                {confirmation.message && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {confirmation.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => resolveConfirmation(false)}
                className="rounded-lg border border-border px-5 py-3 font-semibold hover:bg-gray-50"
              >
                {confirmation.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => resolveConfirmation(true)}
                className="rounded-lg bg-gold px-5 py-3 font-semibold text-black transition hover:bg-yellow-600"
              >
                {confirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
