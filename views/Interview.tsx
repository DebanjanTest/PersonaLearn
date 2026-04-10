import React, { useState, useRef } from 'react';
import { Target, FileText, Users, RefreshCw, ExternalLink, MessageSquare, Calculator, Code, Mail, AlertTriangle, UserPlus, PlayCircle, FileSearch, Loader2, Sparkles, Briefcase, Upload, Send, Check, X, Mic } from 'lucide-react';
import { Card, Button, Badge, Textarea, Input, Label, Select } from '../components/ui/Components';
import { GeminiService } from '../services/geminiService';
import { translations } from '../utils/translations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
    const [started, setStarted] = useState(false);
    const [config, setConfig] = useState({ role: '', experience: 'Entry Level', type: 'Behavioral' });
    const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const startSession = async () => {
        if (!config.role) return;
        setStarted(true);
        setLoading(true);
        const intro = `Hello! I see you're applying for a ${config.role} role (${config.experience}). Let's start with a simple question: Tell me about yourself.`;
        setMessages([{ role: 'ai', text: intro }]);
        setLoading(false);
    };

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
            
            const systemContext = `You are an expert Interviewer for a ${config.role} position. 
            Experience Level: ${config.experience}. 
            Interview Type: ${config.type}.
            
            Rules:
            1. Ask one question at a time.
            2. After the user answers, provide brief constructive feedback in brackets [], then ask the next relevant question.
            3. Keep the tone professional but encouraging.
            4. If the user struggles, offer a hint.
            `;

            const response = await GeminiService.chat(history, input, systemContext);
            setMessages([...newMessages, { role: 'ai', text: response }]);
        } catch (e) {
            console.error(e);
            setMessages([...newMessages, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!started) {
        return (
            <Card className="h-full flex flex-col justify-center items-center p-12 text-center border-dashed border-2 border-border bg-surface/50">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <Users className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Mock Interview Simulator</h2>
                <p className="text-muted mb-8 max-w-md">Configure your session to simulate a real interview environment tailored to your target role.</p>
                
                <div className="w-full max-w-sm space-y-4 text-left">
                    <div>
                        <Label>Target Role</Label>
                        <Input placeholder="e.g. Senior React Developer" value={config.role} onChange={e => setConfig({...config, role: e.target.value})} />
                    </div>
                    <div>
                        <Label>Experience Level</Label>
                        <Select value={config.experience} onChange={e => setConfig({...config, experience: e.target.value})}>
                            <option>Intern / Fresher</option>
                            <option>Junior (1-3 years)</option>
                            <option>Mid-Level (3-5 years)</option>
                            <option>Senior (5+ years)</option>
                            <option>Lead / Manager</option>
                        </Select>
                    </div>
                    <div>
                        <Label>Interview Focus</Label>
                        <Select value={config.type} onChange={e => setConfig({...config, type: e.target.value})}>
                            <option>Behavioral & HR</option>
                            <option>Technical Deep Dive</option>
                            <option>System Design</option>
                            <option>Live Coding (Conceptual)</option>
                        </Select>
                    </div>
                    <Button size="lg" className="w-full mt-4" onClick={startSession} disabled={!config.role}>Start Interview</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title={`${config.role} Interview`} className="h-[calc(100vh-140px)] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                                {m.role === 'user' ? <UserPlus className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface border border-border text-text rounded-tl-none'}`}>
                                {m.text.split('\n').map((line, idx) => <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>)}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface border border-border p-3 rounded-xl rounded-tl-none flex items-center gap-2 ml-11">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-xs text-muted">Interviewer is thinking...</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-surface border-t border-border">
                <div className="flex gap-2 relative">
                    <Textarea 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder="Type your answer here..." 
                        className="min-h-[50px] resize-none w-full pr-12"
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                        <Button size="sm" className="h-8 w-8 p-0 rounded-full" onClick={handleSend} disabled={loading}><Send className="w-4 h-4" /></Button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-muted">
                    <span>Press Enter to send</span>
                    <button className="hover:text-red-500" onClick={() => setStarted(false)}>End Session</button>
                </div>
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
        <Card title={t.ctcDecoder} className="h-full">
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
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!tech) return;
        setLoading(true);
        setCourses([]);
        try {
            const res = await GeminiService.findTechCourses(tech);
            setCourses(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.techCrash} className="h-full flex flex-col">
             <div className="flex gap-2 mb-4">
                 <Input placeholder="e.g. ReactJS, Docker, System Design" value={tech} onChange={e => setTech(e.target.value)} className="w-full" />
                 <Button onClick={generate} loading={loading}><Code className="w-4 h-4" /></Button>
             </div>
             
             {courses.length > 0 ? (
                 <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
                     {courses.map((course, i) => (
                         <div key={i} className="p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col justify-between group">
                             <div>
                                 <div className="flex justify-between items-start mb-1">
                                     <h4 className="font-bold text-sm line-clamp-1 text-primary group-hover:underline" title={course.title}>{course.title}</h4>
                                     <Badge variant={course.difficulty === 'Beginner' ? 'success' : 'info'}>{course.difficulty}</Badge>
                                 </div>
                                 <p className="text-xs text-muted mb-2 line-clamp-2">{course.description}</p>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-[10px] text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border">{course.platform}</span>
                                 <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-text hover:text-primary flex items-center gap-1">
                                     Open <ExternalLink className="w-3 h-3" />
                                 </a>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="flex-1 text-center text-muted text-sm py-8 border border-dashed border-border rounded-lg flex flex-col items-center justify-center">
                     <Code className="w-8 h-8 mb-2 opacity-20" />
                     Find curated learning resources.
                 </div>
             )}
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
        <Card title={t.thankYouGen} className="h-full">
            <div className="space-y-2 mb-3">
                <Input placeholder={t.interviewerName} value={name} onChange={e => setName(e.target.value)} className="w-full" />
                <Input placeholder="Key Topic Discussed" value={topic} onChange={e => setTopic(e.target.value)} className="w-full" />
                <Button onClick={generate} loading={loading} variant="secondary" className="w-full"><Mail className="w-4 h-4 mr-2" /> {t.generate}</Button>
            </div>
            {email && <div className="p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{email}</div>}
        </Card>
    );
};

const GotchaDrill: React.FC<{t: any}> = ({t}) => {
    const [question, setQuestion] = useState('');
    const questions = ["Why is there a gap in your resume?", "What is your biggest weakness?", "Why should we hire you over others?", "Describe a time you failed.", "Where do you see yourself in 5 years?"];

    return (
        <Card title={t.gotchaDrill} className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-center mb-4">
                <p className="text-lg font-bold text-red-400 leading-snug">{question || "Press Start to reveal a tough question!"}</p>
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
        <Card title={t.alumniConn} className="h-full">
             <div className="space-y-2 mb-2">
                 <Input placeholder={t.collegeName || "College"} value={college} onChange={e => setCollege(e.target.value)} />
                 <Input placeholder={t.targetCompany || "Company"} value={company} onChange={e => setCompany(e.target.value)} />
             </div>
             <Button onClick={generate} loading={loading} size="sm" className="w-full"><UserPlus className="w-4 h-4 mr-2" /> {t.generate}</Button>
             {draft && <div className="mt-2 p-3 bg-surface border border-border rounded-lg text-xs italic whitespace-pre-wrap">{draft}</div>}
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
        <Card title={t.offerDecoder} className="h-full">
             <Textarea placeholder="Paste clause text here..." value={text} onChange={e => setText(e.target.value)} className="mb-2 h-32 text-xs" />
             <Button onClick={decode} loading={loading} size="sm" className="w-full"><FileSearch className="w-4 h-4 mr-2" /> {t.scanFlags}</Button>
             {analysis && <div className="mt-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-300 max-h-40 overflow-y-auto">{analysis}</div>}
        </Card>
    )
}

const ResumeScanner: React.FC<{t: any}> = ({t}) => {
    const [resumeText, setResumeText] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             const reader = new FileReader();
             reader.onload = (evt) => {
                 // Simplistic extraction - in real app would use PDF parser
                 // For now assuming text file or just raw bytes loaded as string for demo
                 setResumeText("Loaded File: " + file.name + "\n(Note: Text extraction simulated for demo. Please paste text for best results.)"); 
             };
             reader.readAsText(file);
        }
    };

    const analyze = async () => {
        if (!resumeText) return;
        setLoading(true);
        try {
            const res = await GeminiService.analyzeResume(resumeText, jobDesc);
            setAnalysis(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const data = analysis ? [
        { name: 'Score', value: analysis.score, color: analysis.score > 75 ? '#10b981' : analysis.score > 50 ? '#eab308' : '#ef4444' },
        { name: 'Gap', value: 100 - analysis.score, color: 'transparent' }
    ] : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">
            <Card className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Resume Scanner</h3>
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> Upload
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md" />
                </div>
                
                <div className="space-y-4 flex-1">
                    <div>
                        <Label>Resume Content</Label>
                        <Textarea 
                            placeholder="Paste your resume text here..." 
                            value={resumeText} 
                            onChange={e => setResumeText(e.target.value)} 
                            className="h-48 text-xs font-mono"
                        />
                    </div>
                    <div>
                        <Label>Job Description (Optional)</Label>
                        <Textarea 
                            placeholder="Paste JD for targeted analysis..." 
                            value={jobDesc} 
                            onChange={e => setJobDesc(e.target.value)} 
                            className="h-32 text-xs"
                        />
                    </div>
                    <Button onClick={analyze} loading={loading} size="lg" className="w-full">Analyze Resume</Button>
                </div>
            </Card>

            <Card className="h-full overflow-y-auto">
                {analysis ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-6">
                            <div className="h-32 w-32 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data} innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                                            {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold">{analysis.score}</span>
                                    <span className="text-[10px] text-muted uppercase">Score</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">Executive Summary</h4>
                                <p className="text-sm text-muted">{analysis.summary}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <h5 className="font-bold text-green-600 flex items-center gap-2 mb-2"><Check className="w-4 h-4"/> Strengths</h5>
                                <ul className="list-disc list-inside text-sm space-y-1 text-green-700 dark:text-green-300">
                                    {analysis.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                <h5 className="font-bold text-red-600 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4"/> Improvements</h5>
                                <ul className="list-disc list-inside text-sm space-y-1 text-red-700 dark:text-red-300">
                                    {analysis.weaknesses?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <Label>Missing Keywords</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analysis.missingKeywords?.map((k: string, i: number) => (
                                    <Badge key={i} variant="warning">{k}</Badge>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-3 bg-surface border border-border rounded-lg text-sm">
                            <span className="font-bold text-text">Formatting Check:</span> <span className="text-muted">{analysis.formatting}</span>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                        <FileSearch className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Ready to Review</h3>
                        <p className="max-w-xs">Paste your resume and the job description to get AI-powered feedback instantly.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export const InterviewDashboard: React.FC<{ lang: string, activeTab?: string }> = ({ lang, activeTab }) => {
    const t = translations[lang] || translations['en'];
    const tab = activeTab || 'dashboard';

    const renderContent = () => {
        if (tab === 'resume') {
             return (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                     <div className="lg:col-span-2">
                        <ResumeScanner t={t} />
                     </div>
                     <div className="lg:col-span-1 space-y-6 flex flex-col">
                        <OfferDecoder t={t} />
                        <AlumniConnector t={t} />
                     </div>
                 </div>
             )
        }
        if (tab === 'mock') {
            return (
                <div className="animate-in fade-in h-full">
                    <MockInterview t={t} />
                </div>
            )
        }
        return (
             <div className="space-y-6 animate-in fade-in">
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
                         </div>
                         <div className="hidden md:block opacity-80">
                             <Target className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                             <Briefcase className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                         </div>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                     <div className="space-y-6 flex flex-col">
                         <CareerRadar t={t} />
                         <GotchaDrill t={t} />
                     </div>
                     <div className="space-y-6 flex flex-col">
                          <TechCrashCourse t={t} />
                     </div>
                     <div className="space-y-6 flex flex-col">
                         <CTCDecoder t={t} />
                         <ThankYouGen t={t} />
                     </div>
                 </div>
             </div>
        );
    }

    return (
        <div className="space-y-6 h-full">
            {renderContent()}
        </div>
    );
};