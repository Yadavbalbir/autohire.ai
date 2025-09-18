import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

interface ToastData {
  id: string;
  type: 'no-face' | 'multiple-faces';
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={onRemoveToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;