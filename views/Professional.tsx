import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, DollarSign, Send, Zap, ChevronDown, ChevronUp, Clock, Linkedin, MessageCircle, AlertTriangle, Coffee, Scale, Plane, Sparkles, Building } from 'lucide-react';
import { Card, Button, Input, Label, Textarea, Badge, Select } from '../components/ui/Components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, RadialBarChart, RadialBar } from 'recharts';
import { GeminiService } from '../services/geminiService';
import { translations } from '../utils/translations';

interface ProfessionalProps {
    lang: string;
    activeTab?: string;
    onNavigate: (view: string) => void;
}

const LunchLearn: React.FC<{t: any}> = ({t}) => {
    const [tip, setTip] = useState('');
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const tips = [
            "Excel Tip: Use Alt+= to quickly sum a column.",
            "Negotiation: Never say 'Yes' to the first offer. Pause for 5 seconds.",
            "Shortcut: Ctrl+Shift+T opens the last closed tab in browsers.",
            "Productivity: The 2-minute rule - if it takes < 2 mins, do it now.",
            "Wellness: Look 20ft away for 20s every 20 mins to save eyes."
        ];
        setTip(tips[Math.floor(Math.random() * tips.length)]);
    }, []);

    if (!visible) return null;

    return (
        <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full"><Coffee className="w-5 h-5 text-orange-600" /></div>
                <div>
                    <h4 className="font-bold text-sm text-orange-700 dark:text-orange-300">{t.lunchLearn}</h4>
                    <p className="text-sm text-text/80">{tip}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setVisible(false)}>{t.dismiss}</Button>
        </div>
    );
};

const FinancialWidget: React.FC<{t: any}> = ({t}) => {
    const [grossIncome, setGrossIncome] = useState(85000);
    const [needs, setNeeds] = useState(25000);
    const [wants, setWants] = useState(12000);
    const [includeTax, setIncludeTax] = useState(true);
    
    const calculateMonthlyTax = (monthlyGross: number) => {
        const annualIncome = monthlyGross * 12;
        const taxableIncome = Math.max(0, annualIncome - 75000);
        let annualTax = 0;
        if (taxableIncome > 300000) annualTax += Math.min(taxableIncome - 300000, 400000) * 0.05;
        if (taxableIncome > 700000) annualTax += Math.min(taxableIncome - 700000, 300000) * 0.10;
        if (taxableIncome > 1000000) annualTax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
        if (taxableIncome > 1200000) annualTax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
        if (taxableIncome > 1500000) annualTax += (taxableIncome - 1500000) * 0.30;
        return (annualTax * 1.04) / 12;
    };

    const appliedTax = includeTax ? calculateMonthlyTax(grossIncome) : 0;
    const savings = Math.max(0, grossIncome - appliedTax - needs - wants);
    
    const data = [
        ...(includeTax && appliedTax > 0 ? [{ name: 'Tax', value: appliedTax, color: '#EAB308' }] : []),
        { name: 'Needs', value: needs, color: '#3B82F6' },
        { name: 'Wants', value: wants, color: '#EF4444' },
        { name: 'Savings', value: savings, color: '#10B981' },
    ];

    return (
        <Card className="flex flex-col w-full">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                <h3 className="font-bold flex items-center gap-2 text-lg"><DollarSign className="w-5 h-5 text-green-500" /> {t.financialHealth}</h3>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer"><input type="checkbox" checked={includeTax} onChange={e => setIncludeTax(e.target.checked)} className="rounded" /> {t.deductTax}</label>
            </div>
            <div className="h-[200px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"><Cell fill="#EAB308"/><Cell fill="#3B82F6"/><Cell fill="#EF4444"/><Cell fill="#10B981"/></Pie><RechartsTooltip formatter={(val: number) => `₹${Math.round(val).toLocaleString()}`}/><Legend verticalAlign="middle" align="right" layout="vertical"/></PieChart></ResponsiveContainer></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="col-span-2"><Label>{t.monthlyGross}</Label><Input type="number" value={grossIncome} onChange={e => setGrossIncome(Number(e.target.value))} className="w-full" /></div>
                <div><Label className="text-blue-400">{t.needs}</Label><Input type="number" value={needs} onChange={e => setNeeds(Number(e.target.value))} className="w-full" /></div>
                <div><Label className="text-red-400">{t.wants}</Label><Input type="number" value={wants} onChange={e => setWants(Number(e.target.value))} className="w-full" /></div>
            </div>
        </Card>
    );
};

const BurnoutBarometer: React.FC<{t: any}> = ({t}) => {
    const [hours, setHours] = useState(45);
    const data = [{ name: 'Hours', value: hours, fill: hours > 50 ? '#ef4444' : hours > 40 ? '#eab308' : '#22c55e' }];

    return (
        <Card title={t.burnoutBarometer}>
            <div className="flex items-center justify-between">
                <div className="h-32 w-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="80%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
                            <RadialBar background dataKey="value" cornerRadius={30} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                        <span className="text-2xl font-bold">{hours}</span>
                        <span className="text-xs text-muted">hrs/wk</span>
                    </div>
                </div>
                <div className="flex-1 ml-4 space-y-2">
                    <Label>{t.weeklyHours}</Label>
                    <Input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full" />
                    {hours > 50 && <div className="flex items-center gap-2 text-xs text-red-500 font-bold animate-pulse"><AlertTriangle className="w-3 h-3" /> High Risk</div>}
                </div>
            </div>
        </Card>
    );
};

const MeetingCostCalculator: React.FC<{t: any}> = ({t}) => {
    const [attendees, setAttendees] = useState(4);
    const [avgRate, setAvgRate] = useState(1000); // Hourly rate
    const [duration, setDuration] = useState(60); // Minutes

    const cost = (avgRate * attendees * (duration / 60));

    return (
        <Card title={t.meetingCost}>
            <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-border pb-2">
                    <span className="text-sm text-muted">Cost</span>
                    <span className={`text-2xl font-bold ${cost > 5000 ? 'text-red-500' : 'text-text'}`}>₹{Math.round(cost).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div><Label>{t.attendees}</Label><Input type="number" value={attendees} onChange={e => setAttendees(Number(e.target.value))} className="w-full" /></div>
                    <div><Label>{t.durationMin}</Label><Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full" /></div>
                    <div className="col-span-2"><Label>{t.hourlyRate}</Label><Input type="number" value={avgRate} onChange={e => setAvgRate(Number(e.target.value))} className="w-full" /></div>
                </div>
            </div>
        </Card>
    );
};

const CorporateDocAnalyzer: React.FC<{t: any}> = ({t}) => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'EXEC' | 'ACTION' | 'ELI5'>('EXEC');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if(!text) return;
        setLoading(true);
        try {
            const res = await GeminiService.corporateSummarize(text, undefined, mode);
            setResult(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.docIntel}>
             <div className="flex gap-2 mb-2">{(['EXEC', 'ACTION', 'ELI5'] as const).map(m => <button key={m} onClick={() => { setMode(m); setResult(''); }} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === m ? 'bg-primary text-white' : 'bg-surface border border-border text-muted'}`}>{m === 'EXEC' ? t.summary : m === 'ACTION' ? t.actionItems : t.simplifier}</button>)}</div>
             <Textarea placeholder="Paste text..." value={text} onChange={e => setText(e.target.value)} className="min-h-[100px] text-xs mb-2 w-full" />
             <Button onClick={handleAnalyze} loading={loading} size="sm" className="w-full"><Zap className="w-3 h-3 mr-2" /> {t.analyze}</Button>
             {result && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{result}</div>}
        </Card>
    );
}

const SalaryNegotiator: React.FC<{t: any}> = ({t}) => {
    const [role, setRole] = useState('');
    const [hike, setHike] = useState('30');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!role) return;
        setLoading(true);
        try {
            const prompt = `Write a salary negotiation script for a ${role} asking for a ${hike}% hike. Use 'anchoring' and 'value-based' tactics.`;
            const res = await GeminiService.polishEmail(prompt, 'ASSERTIVE');
            setScript(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.salaryNeg}>
            <div className="flex gap-2 mb-2">
                <Input placeholder={t.role} value={role} onChange={e => setRole(e.target.value)} className="w-full" />
                <div className="w-24 relative">
                    <Input type="number" value={hike} onChange={e => setHike(e.target.value)} />
                    <span className="absolute right-2 top-2 text-xs text-muted">%</span>
                </div>
            </div>
            <Button onClick={generate} loading={loading} size="sm" className="w-full"><Scale className="w-4 h-4 mr-2" /> {t.genScript}</Button>
            {script && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{script}</div>}
        </Card>
    );
}

const OOOGenerator: React.FC<{t: any}> = ({t}) => {
    const [type, setType] = useState('Internal');
    const [dates, setDates] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const tone = type === 'Internal' ? 'Witty & Fun' : 'Strictly Professional';
            const prompt = `Write an Out of Office email. Dates: ${dates}. Tone: ${tone}.`;
            const res = await GeminiService.polishEmail(prompt, 'DIPLOMATIC');
            setMsg(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.oooArch}>
             <div className="grid grid-cols-2 gap-2 mb-2">
                 <Select value={type} onChange={e => setType(e.target.value)}>
                     <option>Internal</option>
                     <option>External</option>
                 </Select>
                 <Input placeholder="Dates" value={dates} onChange={e => setDates(e.target.value)} />
             </div>
             <Button onClick={generate} loading={loading} size="sm" className="w-full"><Plane className="w-4 h-4 mr-2" /> {t.draftOOO}</Button>
             {msg && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{msg}</div>}
        </Card>
    );
}

const LinkedinGhostwriter: React.FC<{t: any}> = ({t}) => {
    const [draft, setDraft] = useState('');
    const [viralPost, setViralPost] = useState('');
    const [loading, setLoading] = useState(false);

    const handleViralize = async () => {
        if (!draft) return;
        setLoading(true);
        try {
             const prompt = `Rewrite this for LinkedIn. Use a hook, short paragraphs, emojis, and hashtags. Make it engaging.\n\nText: ${draft}`;
             const res = await GeminiService.polishEmail(prompt, 'LEADERSHIP'); 
             setViralPost(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.linkedinGhost}>
            <Textarea placeholder="Rough thought..." value={draft} onChange={e => setDraft(e.target.value)} className="mb-2 w-full h-24" />
            <Button onClick={handleViralize} loading={loading} variant="secondary" className="w-full text-blue-500"><Linkedin className="w-4 h-4 mr-2" /> {t.viralize}</Button>
            {viralPost && <div className="mt-2 p-3 bg-surface border border-border rounded-lg text-sm whitespace-pre-wrap">{viralPost}</div>}
        </Card>
    );
};

const SlangTranslator: React.FC<{t: any}> = ({t}) => {
    const [slang, setSlang] = useState('');
    const [meaning, setMeaning] = useState('');
    const [loading, setLoading] = useState(false);

    const translate = async () => {
        if(!slang) return;
        setLoading(true);
        try {
            const prompt = `Translate this corporate slang to plain English: "${slang}". Be concise.`;
            const res = await GeminiService.polishEmail(prompt, 'ASSERTIVE'); 
            setMeaning(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.slangTranslator}>
             <div className="flex gap-2">
                 <Input placeholder="e.g. 'Let's circle back'" value={slang} onChange={e => setSlang(e.target.value)} className="w-full" />
                 <Button onClick={translate} loading={loading} size="sm"><MessageCircle className="w-4 h-4" /></Button>
             </div>
             {meaning && <p className="mt-2 text-sm text-primary font-medium">{meaning}</p>}
        </Card>
    );
};

const CommunicationDrafter: React.FC<{t: any}> = ({t}) => {
    const [intent, setIntent] = useState('');
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDraft = async () => {
        if (!intent) return;
        setLoading(true);
        try {
            const res = await GeminiService.polishEmail(intent, 'DIPLOMATIC');
            setDraft(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.commLab}>
            <Textarea placeholder="Rough draft..." value={intent} onChange={e => setIntent(e.target.value)} className="mb-2 w-full" />
            <Button onClick={handleDraft} loading={loading} variant="secondary" className="w-full"><Send className="w-4 h-4 mr-2" /> {t.polishEmail}</Button>
            {draft && <div className="mt-2 p-3 bg-surface border border-border rounded-lg text-sm whitespace-pre-wrap">{draft}</div>}
        </Card>
    );
};

export const ProfessionalDashboard: React.FC<ProfessionalProps> = ({ lang, activeTab, onNavigate }) => {
    const t = translations[lang] || translations['en'];
    const tab = activeTab || 'dashboard';

    const renderContent = () => {
        if (tab === 'financials') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <FinancialWidget t={t} />
                    <div className="space-y-6">
                        <MeetingCostCalculator t={t} />
                        <SalaryNegotiator t={t} />
                    </div>
                </div>
            );
        }
        if (tab === 'docs') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                    <CorporateDocAnalyzer t={t} />
                    <CommunicationDrafter t={t} />
                    <OOOGenerator t={t} />
                    <div className="lg:col-span-2">
                         <LinkedinGhostwriter t={t} />
                    </div>
                    <SlangTranslator t={t} />
                </div>
            );
        }
        return (
            <div className="space-y-8 animate-in fade-in">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-600 to-gray-800 p-8 shadow-2xl">
                    <div className="relative z-10 flex justify-between items-end">
                         <div className="text-white space-y-2">
                             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                 <Sparkles className="w-4 h-4" />
                                 <span className="text-xs font-medium">Welcome Back</span>
                             </div>
                             <h1 className="text-3xl md:text-4xl font-bold">Focus on impact today.</h1>
                             <p className="text-slate-100 max-w-lg">You have 4 hours of meetings scheduled. Your efficiency score is up 12%.</p>
                             <div className="flex gap-3 pt-4">
                                 <Button onClick={() => onNavigate('docs')} className="bg-white text-slate-800 hover:bg-slate-50 border-0">
                                    <Send className="w-4 h-4 mr-2" /> Draft Email
                                 </Button>
                                 <Button onClick={() => onNavigate('financials')} className="bg-slate-500/30 text-white hover:bg-slate-500/40 border-0 backdrop-blur-sm">
                                    Log Hours
                                 </Button>
                             </div>
                         </div>
                         <div className="hidden md:block opacity-80">
                             <Building className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                             <Briefcase className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                    <div className="lg:col-span-1 space-y-6">
                        <LunchLearn t={t} />
                        <BurnoutBarometer t={t} />
                        <MeetingCostCalculator t={t} />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CorporateDocAnalyzer t={t} />
                            <CommunicationDrafter t={t} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderContent()}
        </div>
    );
};