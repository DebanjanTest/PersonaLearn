import React, { useEffect, useState } from 'react';
import { Loader2, X, Check, AlertCircle, Info } from 'lucide-react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string }> = ({ children, className = '', title, ...props }) => (
  <div className={`bg-surface border-[3px] border-border brutalist-card p-4 md:p-6 ${className}`} {...props}>
    {title && <h3 className="text-lg md:text-xl font-black text-text mb-3 md:mb-5 uppercase tracking-tight border-b-[3px] border-border pb-2.5">{title}</h3>}
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg', loading?: boolean }> = ({ 
  children, variant = 'primary', size = 'md', loading, className = '', ...props 
}) => {
  const base = "font-black uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[3px] active:translate-y-[3px] active:shadow-none brutalist-button";
  
  const sizes = {
      sm: "px-2.5 py-1 text-[9px]",
      md: "px-4 py-2 md:px-6 md:py-2.5 text-xs",
      lg: "px-6 py-3 md:px-10 md:py-4 text-base"
  };

  const variants = {
    primary: "bg-primary text-black border-border",
    secondary: "bg-accent text-black border-border",
    ghost: "bg-transparent border-transparent shadow-none hover:bg-text/5",
    danger: "bg-danger text-white border-border"
  };
  
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full bg-surface border-[3px] border-border px-3 py-2 md:px-4 md:py-2.5 text-xs font-black text-text placeholder:text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-[var(--brutalist-shadow-sm)] rounded-xl"
    {...props} 
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    className="w-full bg-surface border-[3px] border-border px-3 py-2 md:px-4 md:py-2.5 text-xs font-black text-text placeholder:text-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-[var(--brutalist-shadow-sm)] resize-y min-h-[100px] rounded-xl"
    {...props} 
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
   <div className="relative">
    <select className="w-full bg-surface border-[3px] border-border px-3 py-2 md:px-4 md:py-2.5 text-xs font-black text-text focus:outline-none appearance-none transition-all duration-200 shadow-[var(--brutalist-shadow-sm)] rounded-xl" {...props}>
        {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
   </div>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <label className={`block text-xs font-black text-text uppercase tracking-[0.2em] mb-3 ml-2 ${className}`}>{children}</label>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'info' }> = ({ children, variant = 'info' }) => {
    const colors = {
        success: 'bg-secondary text-black',
        warning: 'bg-accent text-black',
        info: 'bg-primary text-black'
    };
    return (
        <span className={`px-4 py-1.5 border-[3px] border-border text-[10px] font-black uppercase tracking-widest shadow-[var(--brutalist-shadow-sm)] rounded-full ${colors[variant]}`}>
            {children}
        </span>
    );
};

export const Dialog: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[4px] animate-in fade-in duration-300">
            <div className="bg-surface border-[4px] border-border shadow-[var(--brutalist-shadow-lg)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 rounded-[20px]">
                <div className="flex justify-between items-center p-4 md:p-5 border-b-[4px] border-border bg-accent">
                    <h3 className="text-lg font-black text-black uppercase tracking-tight">{title}</h3>
                    <button onClick={onClose} className="text-black hover:scale-125 transition-transform"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 md:p-8">
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