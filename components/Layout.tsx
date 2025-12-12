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

  const t = translations[lang] || translations['en'];

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
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-left ${currentPersona === p ? `${colorClass} text-white shadow-md` : 'bg-surface text-muted hover:bg-black/5 dark:hover:bg-white/5 border border-border hover:text-text'}`}
      >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{label}</span>
      </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden bg-background text-text font-sans transition-colors duration-300 ${getThemeClass()}`}>
      
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none`}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <button onClick={onLogoClick} className="flex items-center group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-primary mr-3 flex items-center justify-center shadow-[0_0_10px_rgba(var(--color-primary),0.5)] group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-text group-hover:text-primary transition-colors">PersonaLearn</span>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileClick(() => onNavigate(item.id))}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === item.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${currentView === item.id ? 'text-primary' : 'text-muted group-hover:text-primary'}`} />
              {item.name}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-3">
             <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-[10px] text-muted mb-2 font-mono uppercase tracking-widest">{t.switchRole || 'SWITCH ROLE'}</p>
                <div className="space-y-1.5">
                    <PersonaButton p="STUDENT" label="Student" icon={GraduationCap} colorClass="bg-violet-500" />
                    <PersonaButton p="TEACHER" label="Teacher" icon={BookOpen} colorClass="bg-emerald-500" />
                    <PersonaButton p="PROFESSIONAL" label="Professional" icon={Briefcase} colorClass="bg-slate-500" />
                    <PersonaButton p="BUSINESS" label="Business" icon={Rocket} colorClass="bg-amber-500" />
                    <PersonaButton p="INTERVIEW" label="Interview Prep" icon={Users} colorClass="bg-fuchsia-500" />
                    <PersonaButton p="ASPIRANT" label="Aspirant" icon={Landmark} colorClass="bg-orange-500" />
                </div>
            </div>

            <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleMobileClick(() => setSettingsOpen(true))}>
                <Settings className="w-4 h-4 mr-2" />
                {t.settings || 'Settings'}
            </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden flex items-center h-16 px-4 bg-surface border-b border-border z-20 relative shadow-sm">
            <button onClick={() => setSidebarOpen(true)} className="text-muted p-2 hover:text-text">
                <Menu className="w-6 h-6" />
            </button>
            <button onClick={onLogoClick} className="ml-4 font-bold text-text text-lg hover:text-primary transition-colors">
                PersonaLearn
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto pb-10">
                {children}
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