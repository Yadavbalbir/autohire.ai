import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Users } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'no-face' | 'multiple-faces';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'no-face':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'multiple-faces':
        return <Users className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'no-face':
        return 'bg-red-900/90 border-red-700';
      case 'multiple-faces':
        return 'bg-orange-900/90 border-orange-700';
      default:
        return 'bg-gray-900/90 border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className={`${getBgColor()} backdrop-blur-sm border rounded-lg shadow-lg p-4 min-w-[320px] max-w-sm`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;