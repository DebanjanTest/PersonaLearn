import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Globe, Sparkles } from 'lucide-react';
import { Button } from './ui/Components';
import { translations } from '../utils/translations';

interface LandingPageProps {
    onComplete: (lang: string) => void;
    theme?: 'light' | 'dark';
}

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onComplete, theme = 'dark' }) => {
    const [selectedLang, setSelectedLang] = useState('en');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Get translations for selected language
    const t = translations[selectedLang] || translations['en'];

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / 25; // Division factor controls sensitivity
        const y = (e.clientY - innerHeight / 2) / 25;
        setMousePos({ x, y });
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background text-text transition-colors duration-300"
        >
             {/* Background Effects */}
             <div className="absolute inset-0 z-0 opacity-[0.05]" 
                 style={{ backgroundImage: `radial-gradient(${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
            </div>
            
            {/* Interactive Blobs */}
            <div 
                className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out will-change-transform"
                style={{ transform: `translate(calc(-50% + ${mousePos.x * 1.5}px), calc(-50% + ${mousePos.y * 1.5}px))` }}
            ></div>
            <div 
                className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 transition-transform duration-100 ease-out will-change-transform"
                style={{ transform: `translate(calc(50% - ${mousePos.x}px), calc(50% - ${mousePos.y}px))` }}
            ></div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 shadow-lg shadow-primary/20 ring-1 ring-primary/30 animate-pulse-slow">
                    <Sparkles className="w-8 h-8 text-primary" />
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-text">
                        {t.landingTitle}
                    </h1>
                    <p className="text-xl text-muted max-w-lg mx-auto leading-relaxed">
                        {t.landingSubtitle}
                    </p>
                </div>

                <div className="bg-surface/50 backdrop-blur-md border border-border p-8 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-center gap-2 mb-6 text-muted">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium uppercase tracking-widest">{t.selectLanguage}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setSelectedLang(lang.code)}
                                className={`p-4 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                                    selectedLang === lang.code 
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' 
                                    : 'bg-background border-border text-muted hover:border-primary/50 hover:text-text'
                                }`}
                            >
                                <div className="text-sm font-semibold">{lang.name}</div>
                                <div className="text-xs opacity-70 mt-1">{lang.native}</div>
                            </button>
                        ))}
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full h-14 text-lg" 
                        onClick={() => onComplete(selectedLang)}
                    >
                        {t.continue} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
                
                <p className="text-xs text-muted/50">
                    {t.demoNote}
                </p>
            </div>
        </div>
    );
};

export default LandingPage;