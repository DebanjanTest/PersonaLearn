import React, { useState } from 'react';
import { Target, FileText, Users, RefreshCw, ExternalLink, MessageSquare, Calculator, Code, Mail, AlertTriangle, UserPlus, PlayCircle, FileSearch, Loader2, Sparkles, Briefcase } from 'lucide-react';
import { Card, Button, Badge, Textarea, Input, Label } from '../components/ui/Components';
import { GeminiService } from '../services/geminiService';
import { translations } from '../utils/translations';

const CareerRadar: React.FC<{t: any}> = ({t}) => {
    const [jobs, setJobs] = useState([
        { title: 'Frontend Developer', company: 'TechCorp', type: 'Remote' },
        { title: 'Product Designer', company: 'Creative Studio', type: 'Hybrid' },
        { title: 'Data Analyst', company: 'FinData', type: 'On-site' },
    ]);

    return (
        <Card title={t.careerRadar} className="h-full">
            <div className="space-y-3">
                {jobs.map((job, i) => (
                    <div key={i} className="p-3 bg-background border border-border rounded-lg flex justify-between items-center hover:border-primary transition-colors cursor-pointer">
                        <div>
                            <p className="font-bold text-text">{job.title}</p>
                            <p className="text-xs text-muted">{job.company}</p>
                        </div>
                        <Badge variant="info">{job.type}</Badge>
                    </div>
                ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs">{t.view} More Jobs</Button>
        </Card>
    );
};

const MockInterview: React.FC<{t: any}> = ({t}) => {
    const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
        { role: 'ai', text: 'Hello! I am your AI Interviewer. Tell me about yourself.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const newMessages = [...messages, { role: 'user' as const, text: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));
            
            const response = await GeminiService.chat(history, input);
            setMessages([...newMessages, { role: 'ai', text: response }]);
        } catch (e) {
            console.error(e);
            setMessages([...newMessages, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={t.mockInterview} className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-white' : 'bg-surface border border-border text-text'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface border border-border p-3 rounded-xl flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-xs text-muted">AI is thinking...</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Textarea 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder={t.typeAnswer} 
                    className="min-h-[50px] resize-none w-full"
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <Button onClick={handleSend} disabled={loading}><MessageSquare className="w-4 h-4" /></Button>
            </div>
        </Card>
    );
};

const CTCDecoder: React.FC<{t: any}> = ({t}) => {
    const [ctc, setCtc] = useState(1200000);
    
    // Simple logic for Indian salary approx
    const monthlyGross = ctc / 12;
    const pf = Math.min(monthlyGross * 0.12, 1800);
    const tax = monthlyGross > 100000 ? (monthlyGross * 0.15) : (monthlyGross * 0.05); // Rough calc
    const inHand = monthlyGross - pf - tax - 200; // Prof tax

    return (
        <Card title={t.ctcDecoder}>
            <div className="space-y-4">
                <div>
                    <Label>{t.annualCTC}</Label>
                    <Input type="number" value={ctc} onChange={e => setCtc(Number(e.target.value))} className="w-full" />
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted">{t.monthlyGross}</span><span>₹{Math.round(monthlyGross).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-red-400"><span className="text-muted">{t.deductTax}</span><span>- ₹{Math.round(pf + tax + 200).toLocaleString()}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2"><span className="text-text">{t.inHand}</span><span className="text-green-500">₹{Math.round(inHand).toLocaleString()}</span></div>
                </div>
            </div>
        </Card>
    );
};

const TechCrashCourse: React.FC<{t: any}> = ({t}) => {
    const [tech, setTech] = useState('');
    const [roadmap, setRoadmap] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!tech) return;
        setLoading(true);
        try {
            const prompt = `Create a concise 60-minute interview crash course roadmap for ${tech}. List key concepts and 3 common interview questions.`;
            const res = await GeminiService.polishEmail(prompt, 'ASSERTIVE'); // Reusing text gen
            setRoadmap(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.techCrash}>
             <div className="flex gap-2 mb-3">
                 <Input placeholder="e.g. ReactJS" value={tech} onChange={e => setTech(e.target.value)} className="w-full" />
                 <Button onClick={generate} loading={loading}><Code className="w-4 h-4" /></Button>
             </div>
             {roadmap && <div className="p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">{roadmap}</div>}
        </Card>
    );
};

const ThankYouGen: React.FC<{t: any}> = ({t}) => {
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!name || !topic) return;
        setLoading(true);
        try {
            const prompt = `Write a post-interview thank you email to ${name}. We discussed ${topic}. Keep it professional and concise.`;
            const res = await GeminiService.polishEmail(prompt, 'DIPLOMATIC');
            setEmail(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.thankYouGen}>
            <div className="space-y-2 mb-3">
                <Input placeholder={t.interviewerName} value={name} onChange={e => setName(e.target.value)} className="w-full" />
                <Input placeholder="Topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full" />
                <Button onClick={generate} loading={loading} variant="secondary" className="w-full"><Mail className="w-4 h-4 mr-2" /> {t.generate}</Button>
            </div>
            {email && <div className="p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap">{email}</div>}
        </Card>
    );
};

const GotchaDrill: React.FC<{t: any}> = ({t}) => {
    const [question, setQuestion] = useState('');
    const questions = ["Why is there a gap in your resume?", "What is your biggest weakness?", "Why should we hire you over others?"];

    return (
        <Card title={t.gotchaDrill}>
            <div className="h-32 flex items-center justify-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-center mb-4">
                <p className="text-lg font-bold text-red-400">{question || "Press Start!"}</p>
            </div>
            <Button onClick={() => setQuestion(questions[Math.floor(Math.random() * questions.length)])} className="w-full" variant="danger"><PlayCircle className="w-4 h-4 mr-2" /> {t.spinWheel}</Button>
        </Card>
    );
}

const AlumniConnector: React.FC<{t: any}> = ({t}) => {
    const [college, setCollege] = useState('');
    const [company, setCompany] = useState('');
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const prompt = `Write a LinkedIn connection request to an alumni from ${college} working at ${company}. Keep it under 300 characters.`;
            const res = await GeminiService.polishEmail(prompt, 'DIPLOMATIC');
            setDraft(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.alumniConn}>
             <div className="space-y-2 mb-2">
                 <Input placeholder={t.collegeName || "College"} value={college} onChange={e => setCollege(e.target.value)} />
                 <Input placeholder={t.targetCompany || "Company"} value={company} onChange={e => setCompany(e.target.value)} />
             </div>
             <Button onClick={generate} loading={loading} size="sm" className="w-full"><UserPlus className="w-4 h-4 mr-2" /> {t.generate}</Button>
             {draft && <div className="mt-2 p-3 bg-surface border border-border rounded-lg text-xs italic">{draft}</div>}
        </Card>
    )
}

const OfferDecoder: React.FC<{t: any}> = ({t}) => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const decode = async () => {
        if(!text) return;
        setLoading(true);
        try {
            const prompt = `Analyze this offer letter clause. Highlight red flags like 'Non-Compete', 'Bond', or 'Notice Period'.\n\nText: ${text}`;
            const res = await GeminiService.polishEmail(prompt, 'ASSERTIVE');
            setAnalysis(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.offerDecoder}>
             <Textarea placeholder="Paste clause..." value={text} onChange={e => setText(e.target.value)} className="mb-2 h-20" />
             <Button onClick={decode} loading={loading} size="sm" className="w-full"><FileSearch className="w-4 h-4 mr-2" /> {t.scanFlags}</Button>
             {analysis && <div className="mt-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-300">{analysis}</div>}
        </Card>
    )
}

export const InterviewDashboard: React.FC<{ lang: string, activeTab?: string }> = ({ lang, activeTab }) => {
    const t = translations[lang] || translations['en'];
    const tab = activeTab || 'dashboard';

    const renderContent = () => {
        if (tab === 'resume') {
             return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                     <OfferDecoder t={t} />
                     <div className="space-y-6">
                        <ThankYouGen t={t} />
                        <AlumniConnector t={t} />
                     </div>
                 </div>
             )
        }
        if (tab === 'mock') {
            return (
                <div className="animate-in fade-in">
                    <MockInterview t={t} />
                </div>
            )
        }
        return (
             <div className="space-y-8 animate-in fade-in">
                 {/* Hero Section */}
                 <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-fuchsia-600 to-pink-700 p-8 shadow-2xl">
                    <div className="relative z-10 flex justify-between items-end">
                         <div className="text-white space-y-2">
                             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                 <Sparkles className="w-4 h-4" />
                                 <span className="text-xs font-medium">Get Hired</span>
                             </div>
                             <h1 className="text-3xl md:text-4xl font-bold">Land that dream job.</h1>
                             <p className="text-fuchsia-100 max-w-lg">Your mock interview score improved by 15%. Keep practicing.</p>
                             <div className="flex gap-3 pt-4">
                                 <Button className="bg-white text-fuchsia-800 hover:bg-fuchsia-50 border-0">
                                    Start Mock Interview
                                 </Button>
                                 <Button className="bg-fuchsia-500/30 text-white hover:bg-fuchsia-500/40 border-0 backdrop-blur-sm">
                                    Resume Scan
                                 </Button>
                             </div>
                         </div>
                         <div className="hidden md:block opacity-80">
                             <Target className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                             <Briefcase className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                         </div>
                    </div>
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                     <div className="lg:col-span-1 space-y-6">
                         <CareerRadar t={t} />
                         <GotchaDrill t={t} />
                         <CTCDecoder t={t} />
                     </div>
                     <div className="lg:col-span-2 space-y-6">
                          <TechCrashCourse t={t} />
                     </div>
                 </div>
             </div>
        );
    }

    return (
        <div className="space-y-6">
            {renderContent()}
        </div>
    );
};