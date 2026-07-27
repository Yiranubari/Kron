import './Toast.css';

type ToastItem = {
  id: number;
  type: 'success' | 'error';
  message: string;
  exiting: boolean;
};

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
};

export function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}${toast.exiting ? ' toast--exiting' : ''}`}
          role="alert"
        >
          <span className="toast__icon">
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__dismiss"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
