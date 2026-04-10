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
    const containerRef = useRef<HTMLDivElement>(null);

    // Get translations for selected language
    const t = translations[selectedLang] || translations['en'];

    return (
        <div 
            ref={containerRef}
            className="min-h-screen flex flex-col bg-background text-text transition-colors duration-500 overflow-x-hidden selection:bg-accent selection:text-black dotted-bg"
        >
            {/* Header / Nav Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-surface text-text px-8 h-16 flex items-center justify-between border-b-[4px] border-border shadow-[var(--brutalist-shadow-sm)]">
                <div className="flex items-center gap-3">
                    <div className="bg-danger text-white px-2.5 py-1 border-[3px] border-border font-black text-xl shadow-[var(--brutalist-shadow-sm)] rounded-xl">P</div>
                    <span className="text-xl font-black uppercase tracking-tighter">PersonaLearn</span>
                </div>
                <div className="hidden md:flex items-center gap-10">
                    {['Benefits', 'How it works', 'Pricing', 'FAQs'].map(item => (
                        <a key={item} href="#" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">{item}</a>
                    ))}
                    <Button variant="secondary" size="md" onClick={() => onComplete(selectedLang)}>Launch App</Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-16 bg-primary text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 py-10 md:py-12 flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="flex-1 space-y-5">
                        <div className="space-y-[-6px]">
                            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                                super <br/> <span className="text-white">hello</span>
                            </h1>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-black leading-tight">{t.landingTitle}</h2>
                        <p className="text-base font-black uppercase opacity-90 tracking-wide max-w-lg">{t.landingSubtitle}</p>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="secondary" size="md" className="text-base px-8 py-3 shadow-[var(--brutalist-shadow)]" onClick={() => onComplete(selectedLang)}>
                                {t.continue} <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative hidden md:block">
                        <div className="w-full max-w-sm aspect-square bg-white border-[5px] border-black shadow-[var(--brutalist-shadow)] rounded-[40px] flex items-center justify-center rotate-2 overflow-hidden">
                             <img 
                                src="https://picsum.photos/seed/robot/800/800" 
                                alt="Brutalist Robot" 
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                referrerPolicy="no-referrer"
                             />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent border-[3px] border-black shadow-[var(--brutalist-shadow-sm)] flex items-center justify-center rounded-full -rotate-12">
                             <Sparkles className="w-12 h-12 text-black" />
                        </div>
                    </div>
                </div>
                {/* Wavy Divider */}
                <div className="wavy-divider h-16 bg-accent"></div>
            </section>

            {/* Language Selection Section */}
            <section className="bg-accent py-12 relative overflow-hidden border-b-[4px] border-border">
                <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-8">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-center text-black">
                        {t.selectLanguage}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-xl">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setSelectedLang(lang.code)}
                                className={`p-3 border-[3px] border-black font-black text-base uppercase tracking-widest transition-all rounded-xl shadow-[var(--brutalist-shadow-sm)] ${
                                    selectedLang === lang.code 
                                    ? 'bg-primary text-black translate-x-[-2px] translate-y-[-2px] shadow-[var(--brutalist-shadow)]' 
                                    : 'bg-white text-black hover:bg-white/80'
                                }`}
                            >
                                {lang.native}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none dotted-bg"></div>
            </section>

            {/* How it works */}
            <section className="bg-surface py-16 border-t-[4px] border-border">
                <div className="max-w-7xl mx-auto px-8">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-center mb-12">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Subscribe', desc: 'Kickstart your design adventure by hopping on our monthly subscription. For just $2k, you get unlimited dibs on top-notch design work.', icon: Globe, color: 'bg-primary' },
                            { title: 'Request', desc: "Alright, you're in! Now, it's time to toss your design tasks our way. Need a branding concept? A sleek landing page design? No sweat.", icon: Sparkles, color: 'bg-accent' },
                            { title: 'Review', desc: "Hold tight! In just 48 hours, you'll get your first peek at your completed design. And if it's not love at first sight, no worries!", icon: ArrowRight, color: 'bg-danger' }
                        ].map((step, i) => (
                            <div key={i} className="bg-background border-[3px] border-border p-5 shadow-[var(--brutalist-shadow)] rounded-[24px] flex flex-col items-center text-center group hover:translate-y-[-4px] transition-transform">
                                <div className={`w-20 h-20 ${step.color} border-[3px] border-border shadow-[var(--brutalist-shadow-sm)] flex items-center justify-center mb-6 rounded-xl group-hover:rotate-6 transition-transform`}>
                                    <step.icon className="w-10 h-10 text-black" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{step.title}</h3>
                                <p className="text-sm font-medium text-muted leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ticker */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="ticker-wrap border-t-[4px] border-border bg-black text-white">
                    <div className="ticker">
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="ticker-item text-[10px]">
                                {t.landingTitle.toUpperCase()} + {t.landingSubtitle.toUpperCase()} + PERSONA: {languages.find(l => l.code === selectedLang)?.name.toUpperCase()} + 
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;