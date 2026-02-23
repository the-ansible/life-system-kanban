import { useEffect } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <ToastPrimitive.Root className={`toast ${type}`} open onOpenChange={onClose}>
      <ToastPrimitive.Description className="toast-message">
        {message}
      </ToastPrimitive.Description>
    </ToastPrimitive.Root>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="toast-viewport" />
    </ToastPrimitive.Provider>
  );
}
