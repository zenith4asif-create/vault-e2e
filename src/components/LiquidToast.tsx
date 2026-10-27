import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'warn' | 'error' | 'info';
  visible: boolean;
}

export const LiquidToast: React.FC<ToastProps> = ({ message, type, visible }) => {
  if (!visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-white shrink-0" />,
    warn: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />,
    info: <Info className="w-4 h-4 text-white shrink-0" />
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl liquid-glass-elevated border border-white/20 text-xs text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none max-w-sm">
      {icons[type]}
      <span className="font-medium truncate">{message}</span>
    </div>
  );
};
