import React, { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Menu, X, Settings, Code, Sun, Moon, 
  FileQuestion, Briefcase, FileText, GraduationCap, Users, TrendingUp, 
  Landmark, Target, Rocket
} from 'lucide-react';
import { Persona } from '../types';
import { Button, Dialog, Select, Label } from './ui/Components';
import { translations } from '../utils/translations';

interface LayoutProps {
  children: React.ReactNode;
  currentPersona: Persona;
  onSwitchPersona: (p: Persona) => void;
  lang: string;
  setLang: (l: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogoClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, currentPersona, onSwitchPersona, lang, setLang, theme, toggleTheme, currentView, onNavigate, onLogoClick 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);

  const t = translations[lang] || translations['en'];

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 180 && newWidth < 450) {
        setSidebarWidth(newWidth);
      }
    }
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // Map persona to theme class
  const getThemeClass = () => {
      switch(currentPersona) {
          case 'STUDENT': return 'theme-student';
          case 'TEACHER': return 'theme-teacher';
          case 'PROFESSIONAL': return 'theme-professional';
          case 'BUSINESS': return 'theme-business';
          case 'INTERVIEW': return 'theme-interview';
          case 'ASPIRANT': return 'theme-aspirant';
          default: return '';
      }
  };

  const menus = {
    STUDENT: [
      { name: t.dashboard || 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
      { name: t.aiTools || 'AI Tools', icon: BookOpen, id: 'materials' },
      { name: t.exams || 'Exams', icon: FileQuestion, id: 'exams' },
      { name: t.codePlayground || 'Code Playground', icon: Code, id: 'playground' },
    ],
    TEACHER: [
      { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
      { name: 'Exam Creator', icon: FileText, id: 'EXAM_CREATOR' },
      { name: 'Classroom', icon: Users, id: 'CLASSROOM' },
      { name: 'Performance', icon: BookOpen, id: 'PERFORMANCE' },
    ],
    PROFESSIONAL: [
      { name: 'Workspace', icon: Briefcase, id: 'dashboard' },
      { name: 'Financials', icon: TrendingUp, id: 'financials' },
      { name: 'Documents', icon: FileText, id: 'docs' },
    ],
    INTERVIEW: [
      { name: 'Career Radar', icon: Target, id: 'dashboard' },
      { name: 'Resume Review', icon: FileText, id: 'resume' },
      { name: 'Mock Interview', icon: Users, id: 'mock' },
    ],
    ASPIRANT: [
      { name: 'Daily Digest', icon: LayoutDashboard, id: 'dashboard' },
      { name: 'Current Affairs', icon: Landmark, id: 'affairs' },
      { name: 'Quizzes', icon: FileQuestion, id: 'quizzes' },
    ],
    BUSINESS: [
      { name: 'Strategy', icon: Target, id: 'dashboard' },
      { name: 'Pitch Deck', icon: Rocket, id: 'pitch' },
    ]
  };

  const navItems = menus[currentPersona] || menus['STUDENT'];

  const handleMobileClick = (action: () => void) => {
      action();
      setSidebarOpen(false);
  };

  const PersonaButton = ({ p, label, icon: Icon, colorClass }: any) => (
      <button 
          onClick={() => handleMobileClick(() => onSwitchPersona(p))} 
          className={`w-full flex items-center gap-3 px-3 py-2 border-2 border-border font-black uppercase text-[10px] tracking-tighter transition-all ${currentPersona === p ? `${colorClass} text-white shadow-[var(--brutalist-shadow-sm)] translate-x-[-1px] translate-y-[-1px]` : 'bg-surface text-text hover:bg-accent/20'}`}
      >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{label}</span>
      </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden bg-background text-text font-sans transition-colors duration-500 ${getThemeClass()}`}>
      
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/90 z-40 lg:hidden backdrop-blur-[6px] animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        style={{ width: sidebarOpen ? '100%' : `${sidebarWidth}px` }}
        className={`fixed inset-y-0 left-0 z-50 bg-surface border-r-[4px] border-border transition-transform duration-500 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col shadow-[var(--brutalist-shadow)]`}
      >
        <div className="h-16 flex items-center px-5 border-b-[4px] border-border bg-surface">
          <button onClick={onLogoClick} className="flex items-center group focus:outline-none">
            <div className="bg-danger text-white px-2 py-0.5 border-[3px] border-border font-black text-lg shadow-[var(--brutalist-shadow-sm)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform rounded-xl">
                P
            </div>
            <span className="ml-2.5 text-lg font-black uppercase tracking-tighter text-text">PersonaLearn</span>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-text hover:scale-125 transition-transform">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-2 bg-surface dotted-bg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileClick(() => onNavigate(item.id))}
              className={`w-full flex items-center px-4 py-2 border-[3px] border-border font-black uppercase text-[11px] tracking-widest transition-all rounded-xl ${currentView === item.id ? 'bg-primary text-black shadow-[var(--brutalist-shadow-sm)] translate-x-[-2px] translate-y-[-2px]' : 'bg-surface text-text hover:bg-accent/20'}`}
            >
              <item.icon className={`w-4.5 h-4.5 mr-2.5 ${currentView === item.id ? 'text-black' : 'text-text'}`} />
              {sidebarWidth > 180 && <span className="truncate">{item.name}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 border-t-[4px] border-border space-y-3 bg-surface">
             {sidebarWidth > 200 && (
                 <div className="p-3 bg-accent/10 border-[3px] border-border shadow-[var(--brutalist-shadow-sm)] rounded-xl">
                    <p className="text-[9px] text-text mb-2 font-black uppercase tracking-[0.15em]">{t.switchRole || 'SWITCH ROLE'}</p>
                    <div className="grid grid-cols-2 gap-1">
                        <PersonaButton p="STUDENT" label="Student" icon={GraduationCap} colorClass="bg-violet-400" />
                        <PersonaButton p="TEACHER" label="Teacher" icon={BookOpen} colorClass="bg-emerald-400" />
                        <PersonaButton p="PROFESSIONAL" label="Professional" icon={Briefcase} colorClass="bg-blue-400" />
                        <PersonaButton p="BUSINESS" label="Business" icon={Rocket} colorClass="bg-amber-400" />
                        <PersonaButton p="INTERVIEW" label="Interview" icon={Users} colorClass="bg-fuchsia-400" />
                        <PersonaButton p="ASPIRANT" label="Aspirant" icon={Landmark} colorClass="bg-orange-400" />
                    </div>
                </div>
             )}

            <Button variant="ghost" className="w-full justify-start border-[3px] border-border bg-surface text-text shadow-[var(--brutalist-shadow-sm)] rounded-xl" onClick={() => handleMobileClick(() => setSettingsOpen(true))}>
                <Settings className="w-4 h-4 mr-2" />
                {sidebarWidth > 180 && <span className="text-[11px]">{t.settings || 'Settings'}</span>}
            </Button>
        </div>

        {/* Resize Handle */}
        <div 
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/30 transition-colors z-50 hidden lg:block"
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden flex items-center h-14 px-5 bg-surface border-b-[4px] border-border z-20 relative">
            <button onClick={() => setSidebarOpen(true)} className="text-text p-2 hover:scale-125 transition-transform">
                <Menu className="w-6 h-6" />
            </button>
            <button onClick={onLogoClick} className="ml-2.5 font-black uppercase text-text text-lg tracking-tighter">
                PersonaLearn
            </button>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-background transition-colors duration-500">
            <div className="relative z-10 max-w-7xl mx-auto p-3 md:p-6 lg:p-8 pb-20">
                {children}
            </div>
            
            {/* Ticker at the bottom of main content */}
            <div 
                style={{ left: sidebarOpen ? '0' : `${sidebarWidth}px` }}
                className="fixed bottom-0 right-0 z-30 transition-all duration-500"
            >
                <div className="ticker-wrap border-t-[4px] border-border">
                    <div className="ticker">
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="ticker-item text-[9px]">
                                {currentPersona} MODE ACTIVE + SYSTEM STATUS: OPTIMAL + AI GROUNDING: {currentPersona === 'BUSINESS' ? 'REAL-TIME' : 'STANDARD'} + LANGUAGE: {lang.toUpperCase()} + 
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </main>
      </div>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t.settings || 'Settings'}>
          <div className="space-y-6">
              <div>
                  <Label>{t.language || 'Language'}</Label>
                  <Select value={lang} onChange={(e) => setLang(e.target.value)}>
                      <option value="en">English</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="bn">Bengali (বাংলা)</option>
                      <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                      <option value="mr">Marathi (मराठी)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                  </Select>
              </div>
              
              <div>
                  <Label>{t.appearance || 'Appearance'}</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                      <button 
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${theme === 'light' ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary' : 'bg-background border-border text-muted hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                          <Sun className="w-4 h-4" /> Light
                      </button>
                      <button 
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${theme === 'dark' ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary' : 'bg-background border-border text-muted hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                          <Moon className="w-4 h-4" /> Dark
                      </button>
                  </div>
              </div>
          </div>
      </Dialog>
    </div>
  );
};

export default Layout;