import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer 
}) => {
  // Prevent scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
      />

      {/* Sheet Content */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col">
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div>
            {title && <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>}
            {description && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
