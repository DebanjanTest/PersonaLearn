import React, { useState, useEffect } from 'react';
import { Landmark, Bell, RefreshCw, ChevronLeft, ChevronRight, ExternalLink, Zap, CheckCircle, XCircle, Brain, BookOpen, AlertCircle, FileText, TrendingUp, Sparkles, Flag } from 'lucide-react';
import { Card, Button, Badge, Input, Textarea, Label } from '../components/ui/Components';
import { GeminiService } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { translations } from '../utils/translations';

const ExamTicker: React.FC<{t: any}> = ({t}) => (
    <div className="bg-blue-900 text-white py-2 overflow-hidden flex items-center shadow-md relative h-10 w-full mb-6 rounded-lg">
        <div className="bg-blue-900 z-10 px-4 h-full flex items-center shadow-[4px_0_12px_rgba(0,0,0,0.5)] flex-shrink-0">
            <span className="font-bold bg-red-600 px-2 py-0.5 rounded text-xs animate-pulse whitespace-nowrap border border-red-400">{t.examTicker}</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="absolute whitespace-nowrap animate-marquee left-0 flex items-center">
                <span className="mx-6 text-sm font-medium text-blue-100">🔔 UPSC CSE 2024: Prelims Result Declared</span>
                <span className="mx-6 text-sm font-medium text-blue-100">🔔 IBPS PO: Applications closing in 2 days</span>
                <span className="mx-6 text-sm font-medium text-blue-100">🔔 SSC CGL: Tier 1 Admit Cards released</span>
            </div>
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 25s linear infinite; }`}</style>
    </div>
);

const CurrentAffairsFeed: React.FC<{t: any}> = ({t}) => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0);

    const fetchNews = async () => {
        setLoading(true);
        const data = await GeminiService.generateCurrentAffairs();
        if (Array.isArray(data) && data.length > 0) { setNews(data); setIndex(0); }
        setLoading(false);
    };

    useEffect(() => { fetchNews(); }, []);

    return (
        <Card className="h-full flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> {t.dailyDigest}</h3>
                <Button variant="ghost" size="sm" onClick={fetchNews} disabled={loading} className="h-6 w-6 p-0 rounded-full"><RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /></Button>
            </div>
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-50"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div><p className="text-xs text-muted">{t.loading}</p></div>
            ) : news.length > 0 ? (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex-1 bg-background border border-border rounded-lg p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-3"><Badge variant={news[index].category === 'Politics' ? 'warning' : 'info'}>{news[index].category}</Badge><span className="text-[10px] text-muted uppercase tracking-wider">{news[index].importance} Impact</span></div>
                        <h4 className="text-lg font-bold text-text mb-3 leading-tight">{news[index].title}</h4>
                        <p className="text-sm text-muted leading-relaxed mb-3">{news[index].summary}</p>
                        {news[index].source && <div className="flex items-center gap-2 text-xs text-muted/70 mt-auto pt-3 border-t border-border/50"><span>Source: {news[index].source}</span>{news[index].url && <a href={news[index].url} target="_blank" className="text-primary hover:underline flex items-center gap-1 ml-auto"><ExternalLink className="w-3 h-3" /> Read More</a>}</div>}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <Button variant="secondary" size="sm" onClick={() => setIndex(prev => (prev - 1 + news.length) % news.length)} className="h-8 w-8 p-0 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
                        <span className="text-xs font-mono text-muted">{index + 1} / {news.length}</span>
                        <Button variant="secondary" size="sm" onClick={() => setIndex(prev => (prev + 1) % news.length)} className="h-8 w-8 p-0 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted text-sm gap-2"><p>No news available.</p><Button variant="ghost" size="sm" onClick={fetchNews} className="text-xs text-primary">{t.clear}</Button></div>
            )}
        </Card>
    );
};

const AspirantQuiz: React.FC<{t: any}> = ({t}) => {
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const startQuiz = async () => {
        setLoading(true);
        try {
            const data = await GeminiService.generateQuizByTopic("General Studies (Polity, History, Economy)");
            setQuestions(data); setStarted(true); setSubmitted(false); setAnswers({});
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSubmit = () => {
        let s = 0;
        questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) s++; });
        setScore(s); setSubmitted(true);
    };

    if (loading) return <div className="h-64 flex flex-col items-center justify-center text-muted"><Zap className="w-8 h-8 animate-pulse mb-2 text-primary" /><p>{t.loading}</p></div>;

    if (!started) return (
        <Card className="h-full flex flex-col items-center justify-center text-center p-8">
            <Landmark className="w-16 h-16 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold">{t.dailyQuiz}</h3>
            <p className="text-sm text-muted mb-6">5 questions to test your preparation level.</p>
            <Button onClick={startQuiz} size="lg">{t.startQuiz}</Button>
        </Card>
    );

    return (
        <Card className="h-full overflow-y-auto">
             {!submitted ? (
                 <div className="space-y-6">
                     {questions.map((q, i) => (
                         <div key={i} className="pb-4 border-b border-border last:border-0">
                             <p className="font-medium text-text mb-3">{i+1}. {q.question}</p>
                             <div className="space-y-2">
                                 {q.options.map((opt: string, idx: number) => (
                                     <button key={idx} onClick={() => setAnswers(prev => ({...prev, [i]: opt}))} className={`w-full text-left p-2 rounded-lg text-sm border transition-all ${answers[i] === opt ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-border hover:bg-surface'}`}>{opt}</button>
                                 ))}
                             </div>
                         </div>
                     ))}
                     <Button onClick={handleSubmit} className="w-full">{t.submit}</Button>
                 </div>
             ) : (
                 <div className="text-center space-y-4">
                     <div className="p-4 bg-surface border border-border rounded-lg">
                         <h3 className="text-xl font-bold mb-1">Score: {score} / {questions.length}</h3>
                         <p className="text-sm text-muted">{score > 3 ? "Great Job!" : "Keep Revising!"}</p>
                     </div>
                     <Button onClick={startQuiz} variant="secondary" className="w-full">Take Another Quiz</Button>
                 </div>
             )}
        </Card>
    );
};

const MnemonicGen: React.FC<{t: any}> = ({t}) => {
    const [fact, setFact] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!fact) return;
        setLoading(true);
        try {
            const prompt = `Create a catchy mnemonic or acronym to remember this list/fact: "${fact}".`;
            const res = await GeminiService.polishEmail(prompt, 'ASSERTIVE'); 
            setResult(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.mnemonicGen}>
             <Textarea placeholder="Paste facts..." value={fact} onChange={e => setFact(e.target.value)} className="w-full mb-3" />
             <Button onClick={generate} loading={loading} size="sm" className="w-full"><Brain className="w-4 h-4 mr-2" /> {t.memorize}</Button>
             {result && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-sm whitespace-pre-wrap">{result}</div>}
        </Card>
    );
}

const ConstitutionFinder: React.FC<{t: any}> = ({t}) => {
    const [article, setArticle] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const find = async () => {
        if(!article) return;
        setLoading(true);
        try {
            const prompt = `Explain Indian Constitution ${article} briefly. State the article text and simplified meaning.`;
            const res = await GeminiService.polishEmail(prompt, 'DIPLOMATIC'); 
            setInfo(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.articleFinder}>
             <div className="flex gap-2 mb-3">
                 <Input placeholder="e.g. Article 21" value={article} onChange={e => setArticle(e.target.value)} className="w-full" />
                 <Button onClick={find} loading={loading}><BookOpen className="w-4 h-4" /></Button>
             </div>
             {info && <div className="p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap h-32 overflow-y-auto">{info}</div>}
        </Card>
    );
}

const ErrorLog: React.FC<{t: any}> = ({t}) => {
    const [silly, setSilly] = useState(2);
    const [conceptual, setConceptual] = useState(5);
    const [guess, setGuess] = useState(3);

    const data = [
        { name: t.silly, value: silly, color: '#eab308' },
        { name: t.conceptual, value: conceptual, color: '#ef4444' },
        { name: t.guess, value: guess, color: '#3b82f6' },
    ];

    return (
        <Card title={t.errorLog}>
            <div className="flex items-center gap-4">
                <div className="h-32 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} innerRadius={25} outerRadius={40} dataKey="value"><Cell fill="#eab308"/><Cell fill="#ef4444"/><Cell fill="#3b82f6"/></Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 text-xs">
                     <div className="flex justify-between items-center"><Label>{t.silly}</Label><div className="flex gap-2"><button onClick={() => setSilly(s => s+1)} className="px-1 bg-surface border rounded">+</button>{silly}</div></div>
                     <div className="flex justify-between items-center"><Label>{t.conceptual}</Label><div className="flex gap-2"><button onClick={() => setConceptual(s => s+1)} className="px-1 bg-surface border rounded">+</button>{conceptual}</div></div>
                     <div className="flex justify-between items-center"><Label>{t.guess}</Label><div className="flex gap-2"><button onClick={() => setGuess(s => s+1)} className="px-1 bg-surface border rounded">+</button>{guess}</div></div>
                </div>
            </div>
            {conceptual > 4 && <div className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Focus on Concepts!</div>}
        </Card>
    );
}

const EditorialSimplifier: React.FC<{t: any}> = ({t}) => {
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const simplify = async () => {
        if(!text) return;
        setLoading(true);
        try {
            const prompt = `Summarize this editorial into 5 bullet points relevant for UPSC/Civil Services Exam. Focus on Policy, Economy, and International Relations.\n\nText: ${text}`;
            const res = await GeminiService.polishEmail(prompt, 'DIPLOMATIC');
            setSummary(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.editSimple}>
             <Textarea placeholder="Paste editorial text..." value={text} onChange={e => setText(e.target.value)} className="mb-2 h-20" />
             <Button onClick={simplify} loading={loading} size="sm" className="w-full"><FileText className="w-4 h-4 mr-2" /> {t.simplify}</Button>
             {summary && <div className="mt-2 p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap">{summary}</div>}
        </Card>
    );
}

const TrendAnalyzer: React.FC<{t: any}> = ({t}) => {
    const [topic, setTopic] = useState('');
    const [prob, setProb] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const analyze = () => {
        setLoading(true);
        // Mock logic for demo
        setTimeout(() => {
            setProb(Math.floor(Math.random() * 40) + 40); // Random 40-80%
            setLoading(false);
        }, 1000);
    }

    return (
        <Card title={t.trendAnalyze}>
            <div className="flex gap-2 mb-4">
                <Input placeholder="Topic (e.g. Buddhism)" value={topic} onChange={e => setTopic(e.target.value)} />
                <Button onClick={analyze} loading={loading}><TrendingUp className="w-4 h-4" /></Button>
            </div>
            {prob && (
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{prob}%</div>
                    <p className="text-xs text-muted">{t.probability} (2024)</p>
                    <div className="w-full bg-surface border border-border rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-1000" style={{width: `${prob}%`}}></div>
                    </div>
                </div>
            )}
        </Card>
    );
}

export const AspirantDashboard: React.FC<{ lang: string, activeTab?: string }> = ({ lang, activeTab }) => {
    const t = translations[lang] || translations['en'];
    const tab = activeTab || 'dashboard';

    const renderContent = () => {
        if (tab === 'affairs') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <CurrentAffairsFeed t={t} />
                    <EditorialSimplifier t={t} />
                </div>
            )
        }
        if (tab === 'quizzes') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                     <div className="md:col-span-2"><AspirantQuiz t={t} /></div>
                     <div className="space-y-6">
                         <MnemonicGen t={t} />
                         <ConstitutionFinder t={t} />
                     </div>
                </div>
            )
        }
        return (
            <div className="space-y-8 animate-in fade-in">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 to-red-700 p-8 shadow-2xl">
                    <div className="relative z-10 flex justify-between items-end">
                         <div className="text-white space-y-2">
                             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                 <Sparkles className="w-4 h-4" />
                                 <span className="text-xs font-medium">Eyes on the Target</span>
                             </div>
                             <h1 className="text-3xl md:text-4xl font-bold">LBSNAA is waiting for you.</h1>
                             <p className="text-orange-100 max-w-lg">Current Affairs backlog cleared. 3 new articles on International Relations added.</p>
                             <div className="flex gap-3 pt-4">
                                 <Button className="bg-white text-orange-800 hover:bg-orange-50 border-0">
                                    Start Daily Quiz
                                 </Button>
                                 <Button className="bg-orange-500/30 text-white hover:bg-orange-500/40 border-0 backdrop-blur-sm">
                                    Read News
                                 </Button>
                             </div>
                         </div>
                         <div className="hidden md:block opacity-80">
                             <Flag className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                             <Landmark className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                         </div>
                    </div>
                </div>

                <ExamTicker t={t} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <TrendAnalyzer t={t} />
                        <ErrorLog t={t} />
                    </div>
                     <div className="md:col-span-2">
                        <CurrentAffairsFeed t={t} />
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