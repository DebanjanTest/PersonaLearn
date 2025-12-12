import React, { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import { Persona } from './types';
import { StudentDashboard, StudentTools, StudentExams } from './views/Student';
import { TeacherDashboard } from './views/Teacher';
import { ProfessionalDashboard } from './views/Professional';
import { AspirantDashboard } from './views/Aspirant';
import { InterviewDashboard } from './views/Interview';
import { BusinessDashboard } from './views/Business';
import CodePlayground from './components/CodePlayground';
import { ToastContainer } from './components/ui/Components';
import { translations } from './utils/translations';

// Toast Context
interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}
const ToastContext = createContext<{ addToast: (msg: string, type: 'success' | 'error' | 'info') => void }>({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);

const App: React.FC = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona>('STUDENT');
  const [activeView, setActiveView] = useState('dashboard');
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.setProperty('color-scheme', 'light');
    }
  }, [theme]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleOnboardingComplete = (selectedLang: string) => {
      setLang(selectedLang);
      setHasCompletedOnboarding(true);
  };

  const renderContent = () => {
    if (activeView === 'playground') return <CodePlayground lang={lang} />;
    
    switch (currentPersona) {
      case 'STUDENT':
        if (activeView === 'materials') return <StudentTools lang={lang} onNavigate={setActiveView} />;
        if (activeView === 'exams') return <StudentExams lang={lang} />;
        return <StudentDashboard lang={lang} theme={theme} onNavigate={setActiveView} />;
      
      case 'TEACHER':
        const isTeacherTab = ['dashboard', 'EXAM_CREATOR', 'CLASSROOM', 'PERFORMANCE'].includes(activeView);
        return <TeacherDashboard lang={lang} activeTab={isTeacherTab ? activeView : 'dashboard'} onNavigate={setActiveView} />;

      case 'PROFESSIONAL':
        return <ProfessionalDashboard lang={lang} activeTab={activeView} onNavigate={setActiveView} />;
        
      case 'ASPIRANT':
        return <AspirantDashboard lang={lang} activeTab={activeView} />;
        
      case 'INTERVIEW':
        return <InterviewDashboard lang={lang} activeTab={activeView} />;
        
      case 'BUSINESS':
        return <BusinessDashboard lang={lang} activeTab={activeView} />;

      default:
        return <div>{translations[lang]?.selectPersona || "Select a persona"}</div>;
    }
  };

  const handlePersonaSwitch = (p: Persona) => {
      setCurrentPersona(p);
      setActiveView('dashboard');
      addToast(`Switched to ${p.charAt(0) + p.slice(1).toLowerCase().replace('_', ' ')} view`, 'info');
  };

  if (!hasCompletedOnboarding) {
      return <LandingPage onComplete={handleOnboardingComplete} theme={theme} />;
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
        <div className="min-h-screen bg-background text-text">
        <Layout 
            currentPersona={currentPersona} 
            onSwitchPersona={handlePersonaSwitch}
            lang={lang}
            setLang={setLang}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            currentView={activeView}
            onNavigate={setActiveView}
            onLogoClick={() => setHasCompletedOnboarding(false)}
            >
            {renderContent()}
        </Layout>
        <ToastContainer toasts={toasts} />
        </div>
    </ToastContext.Provider>
  );
};

export default App;