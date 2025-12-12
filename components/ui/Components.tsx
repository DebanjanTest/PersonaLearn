import React, { useEffect, useState } from 'react';
import { Loader2, X, Check, AlertCircle, Info } from 'lucide-react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string }> = ({ children, className = '', title, ...props }) => (
  <div className={`bg-surface border border-border rounded-2xl shadow-sm p-6 ${className}`} {...props}>
    {title && <h3 className="text-lg font-bold text-text mb-5 tracking-tight">{title}</h3>}
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg', loading?: boolean }> = ({ 
  children, variant = 'primary', size = 'md', loading, className = '', ...props 
}) => {
  const base = "rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base"
  };

  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 border border-primary/20",
    secondary: "bg-surface hover:bg-black/5 dark:hover:bg-white/5 text-text border border-border",
    ghost: "text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
  };
  
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full bg-surface border border-border/60 rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm hover:border-primary/30"
    {...props} 
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    className="w-full bg-surface border border-border/60 rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm hover:border-primary/30 resize-y min-h-[100px]"
    {...props} 
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
   <div className="relative">
    <select className="w-full bg-surface border border-border/60 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all duration-200 shadow-sm hover:border-primary/30" {...props}>
        {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
   </div>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <label className={`block text-xs font-semibold text-muted uppercase tracking-wider mb-2 ml-1 ${className}`}>{children}</label>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'info' }> = ({ children, variant = 'info' }) => {
    const colors = {
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${colors[variant]}`}>
            {children}
        </span>
    );
};

export const Dialog: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
                <div className="flex justify-between items-center p-5 border-b border-border bg-background/50">
                    <h3 className="text-lg font-bold text-text">{title}</h3>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: {id: string, message: string, type: 'success' | 'error' | 'info'}[] }> = ({ toasts }) => (
    <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border animate-in slide-in-from-right-full duration-300 ${
                t.type === 'success' ? 'bg-surface border-green-500/20 text-green-500' :
                t.type === 'error' ? 'bg-surface border-red-500/20 text-red-500' :
                'bg-surface border-blue-500/20 text-blue-500'
            }`}>
                {t.type === 'success' && <Check className="w-5 h-5" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {t.type === 'info' && <Info className="w-5 h-5" />}
                <span className="text-sm font-medium text-text">{t.message}</span>
            </div>
        ))}
    </div>
);