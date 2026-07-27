import { useCallback, useState } from 'react';

type ToastType = 'success' | 'error';

type Toast = {
  id: number;
  type: ToastType;
  message: string;
  exiting: boolean;
};

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message, exiting: false }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return { toasts, show, dismiss };
}
