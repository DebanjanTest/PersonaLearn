import React, { useState } from 'react';
import { Rocket, LineChart, Target, Layers, Zap, PenTool, Palette, MessageSquare, Search, AlertCircle, FileText, TrendingDown, Package, Sparkles } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Badge, Label } from '../components/ui/Components';
import { GeminiService } from '../services/geminiService';
import { Type } from "@google/genai";
import { LineChart as RechartsLine, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { translations } from '../utils/translations';

const StrategyAnalyzer: React.FC<{t: any}> = ({t}) => {
    const [topic, setTopic] = useState('');
    const [framework, setFramework] = useState<'SWOT' | 'PESTLE'>('SWOT');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await GeminiService.analyzeBusinessStrategy(topic, framework);
            setResult(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const renderGrid = () => {
        if (!result) return null;
        const keys = Object.keys(result);
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {keys.map((key, i) => (
                    <Card key={i} className="h-full border-t-4 border-t-primary">
                        <h4 className="font-bold text-lg capitalize mb-3 text-primary">{key}</h4>
                        <ul className="list-disc list-inside space-y-2">
                            {result[key]?.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm text-text/80 leading-relaxed">{item}</li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium text-muted mb-1 block">{t.businessConcept}</label>
                        <Input placeholder="e.g., A subscription-based coffee delivery service" value={topic} onChange={e => setTopic(e.target.value)} className="w-full" />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="text-sm font-medium text-muted mb-1 block">{t.framework}</label>
                        <Select value={framework} onChange={e => setFramework(e.target.value as any)}>
                            <option value="SWOT">SWOT</option>
                            <option value="PESTLE">PESTLE</option>
                        </Select>
                    </div>
                    <Button onClick={handleAnalyze} loading={loading} className="w-full md:w-auto">
                        <Zap className="w-4 h-4 mr-2" /> {t.analyze}
                    </Button>
                </div>
            </Card>
            {result && renderGrid()}
        </div>
    );
};

const PitchDeckGenerator: React.FC<{t: any}> = ({t}) => {
    const [idea, setIdea] = useState('');
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!idea) return;
        setLoading(true);
        try {
            const res = await GeminiService.generatePitchDeck(idea);
            setSlides(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 space-y-4">
                <Card title={t.pitchAssistant}>
                    <Textarea 
                        placeholder="Describe your startup idea..." 
                        value={idea} 
                        onChange={e => setIdea(e.target.value)} 
                        className="h-32 mb-4 w-full"
                    />
                    <Button onClick={handleGenerate} loading={loading} className="w-full">
                        <Layers className="w-4 h-4 mr-2" /> {t.genOutline}
                    </Button>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {slides.length > 0 ? slides.map((slide, i) => (
                    <Card key={i} className="relative group hover:border-primary transition-colors">
                        <div className="absolute top-4 right-4 text-xs font-bold text-muted/50">Slide {i+1}</div>
                        <h3 className="text-xl font-bold mb-3 text-primary">{slide.title}</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-background rounded-lg border border-border">
                                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Content</p>
                                <p className="text-sm text-text whitespace-pre-wrap">{slide.content}</p>
                            </div>
                            <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                <p className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <PenTool className="w-3 h-3" /> Visual Suggestion
                                </p>
                                <p className="text-sm text-blue-400 italic">{slide.visual}</p>
                            </div>
                        </div>
                    </Card>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted p-10 border border-dashed border-border rounded-xl">
                        <Rocket className="w-12 h-12 mb-3 opacity-20" />
                        <p>{t.pleaseEnterText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const BrandKitGenerator: React.FC<{t: any}> = ({t}) => {
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [kit, setKit] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!name || !industry) return;
        setLoading(true);
        try {
             const prompt = `Generate a Brand Kit for a ${industry} business named "${name}". Return JSON with: 1. colors (array of hex codes), 2. fontPairing (heading and body font names), 3. iconSuggestion (description).`;
             const schema = {
                 type: Type.OBJECT,
                 properties: {
                     colors: { type: Type.ARRAY, items: { type: Type.STRING }},
                     fontPairing: { type: Type.STRING },
                     iconSuggestion: { type: Type.STRING }
                 }
             };
             const res = await GeminiService.generateStructuredJSON(prompt, schema);
             setKit(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.brandKit}>
            <div className="space-y-3">
                <Input placeholder={t.compName} value={name} onChange={e => setName(e.target.value)} className="w-full" />
                <Input placeholder={t.industry} value={industry} onChange={e => setIndustry(e.target.value)} className="w-full" />
                <Button onClick={generate} loading={loading} className="w-full"><Palette className="w-4 h-4 mr-2" /> {t.genKit}</Button>
            </div>
            {kit && (
                <div className="mt-4 space-y-4 animate-in fade-in">
                    <div>
                        <Label>Palette</Label>
                        <div className="flex gap-2 mt-1">
                            {kit.colors?.map((c: string, i: number) => (
                                <div key={i} className="h-10 w-full rounded-md shadow-sm" style={{backgroundColor: c}} title={c}></div>
                            ))}
                        </div>
                    </div>
                    <div><Label>Typography</Label><p className="text-sm font-mono bg-background p-2 rounded border border-border">{kit.fontPairing}</p></div>
                    <div><Label>Icon Idea</Label><p className="text-sm text-muted">{kit.iconSuggestion}</p></div>
                </div>
            )}
        </Card>
    );
}

const ReviewResponder: React.FC<{t: any}> = ({t}) => {
    const [review, setReview] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!review) return;
        setLoading(true);
        try {
             const prompt = `Write a professional, empathetic response to this customer review: "${review}". If negative, offer help. If positive, thank them.`;
             const res = await GeminiService.polishEmail(prompt, 'DIPLOMATIC'); // reusing text gen
             setResponse(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <Card title={t.reviewResp}>
             <Textarea placeholder="Paste review..." value={review} onChange={e => setReview(e.target.value)} className="w-full mb-3" />
             <Button onClick={generate} loading={loading} variant="secondary" className="w-full"><MessageSquare className="w-4 h-4 mr-2" /> {t.genResponse}</Button>
             {response && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-sm whitespace-pre-wrap">{response}</div>}
        </Card>
    );
}

const CompetitorSpy: React.FC<{t: any}> = ({t}) => {
    const [competitor, setCompetitor] = useState('');
    const [product, setProduct] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const spy = async () => {
        if(!competitor || !product) return;
        setLoading(true);
        try {
             const query = `Find the current price of ${product} by ${competitor} in India.`;
             const res = await GeminiService.search(query);
             setData(res);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.compSpy}>
            <div className="space-y-3">
                <Input placeholder={t.compName} value={competitor} onChange={e => setCompetitor(e.target.value)} className="w-full" />
                <Input placeholder={t.prodName} value={product} onChange={e => setProduct(e.target.value)} className="w-full" />
                <Button onClick={spy} loading={loading} className="w-full" variant="danger"><Search className="w-4 h-4 mr-2" /> {t.findPrice}</Button>
            </div>
            {data && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-xs leading-relaxed">{data}</div>}
        </Card>
    )
}

const InventoryForecaster: React.FC<{t: any}> = ({t}) => {
    const [event, setEvent] = useState('');
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);

    const forecast = async () => {
        if(!event) return;
        setLoading(true);
        try {
            const prompt = `Based on the event "${event}", predict inventory needs for a retail store. Assume +10% growth year over year.`;
            const res = await GeminiService.polishEmail(prompt, 'ASSERTIVE');
            setInsight(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    return (
        <Card title={t.invForecast}>
            <div className="space-y-3">
                <Input placeholder={t.upcomingEvent || "Event"} value={event} onChange={e => setEvent(e.target.value)} />
                <Button onClick={forecast} loading={loading} className="w-full"><Package className="w-4 h-4 mr-2" /> {t.forecast}</Button>
            </div>
            {insight && <div className="mt-3 p-3 bg-surface border border-border rounded-lg text-xs">{insight}</div>}
        </Card>
    );
}

const LegalTemplates: React.FC<{t: any}> = ({t}) => {
    const [type, setType] = useState('NDA');
    const [draft, setDraft] = useState('');

    const loadDraft = () => {
        if(type === 'NDA') setDraft("NON-DISCLOSURE AGREEMENT\n\nThis Agreement is made on [DATE] between [PARTY A] and [PARTY B]...");
        if(type === 'Freelance') setDraft("FREELANCE CONTRACT\n\nServices to be provided: [SERVICES]\nPayment Terms: [TERMS]...");
        if(type === 'Rent') setDraft("RENTAL AGREEMENT\n\nLandlord: [NAME]\nTenant: [NAME]\nProperty: [ADDRESS]...");
    }

    return (
        <Card title={t.legalTemps}>
             <div className="flex gap-2 mb-2">
                 <Select value={type} onChange={e => setType(e.target.value)} className="w-full">
                     <option value="NDA">NDA</option>
                     <option value="Freelance">Freelance Contract</option>
                     <option value="Rent">Rent Agreement</option>
                 </Select>
                 <Button onClick={loadDraft}>{t.loading?.replace('...', '') || 'Load'}</Button>
             </div>
             {draft && <Textarea value={draft} onChange={e => setDraft(e.target.value)} rows={5} className="text-xs font-mono" />}
        </Card>
    )
}

const CashFlowVisualizer: React.FC<{t: any}> = ({t}) => {
    const data = [
        { name: 'Week 1', balance: 50000 },
        { name: 'Week 2', balance: 35000 },
        { name: 'Week 3', balance: 60000 },
        { name: 'Week 4', balance: 45000 },
    ];

    return (
        <Card title={t.cashFlow}>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLine data={data}>
                         <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                         <XAxis dataKey="name" fontSize={10} />
                         <YAxis fontSize={10} />
                         <Tooltip />
                         <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} />
                    </RechartsLine>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted text-center mt-2">Projected Month-End Balance: <span className="text-green-500 font-bold">₹45,000</span></p>
        </Card>
    );
}

export const BusinessDashboard: React.FC<{ lang: string, activeTab?: string }> = ({ lang, activeTab }) => {
    const t = translations[lang] || translations['en'];
    const tab = activeTab || 'dashboard';

    return (
        <div className="space-y-6 animate-in fade-in">
             {tab === 'pitch' ? (
                <PitchDeckGenerator t={t} />
             ) : (
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 to-orange-700 p-8 shadow-2xl">
                        <div className="relative z-10 flex justify-between items-end">
                             <div className="text-white space-y-2">
                                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                     <Sparkles className="w-4 h-4" />
                                     <span className="text-xs font-medium">Empire Building Mode</span>
                                 </div>
                                 <h1 className="text-3xl md:text-4xl font-bold">What's the next big move?</h1>
                                 <p className="text-amber-100 max-w-lg">Market trends are favoring your sector. Review customer feedback and adjust pricing.</p>
                                 <div className="flex gap-3 pt-4">
                                     <Button className="bg-white text-amber-800 hover:bg-amber-50 border-0">
                                        <Target className="w-4 h-4 mr-2" /> New Strategy
                                     </Button>
                                     <Button className="bg-amber-500/30 text-white hover:bg-amber-500/40 border-0 backdrop-blur-sm">
                                        Check Trends
                                     </Button>
                                 </div>
                             </div>
                             <div className="hidden md:block opacity-80">
                                 <Rocket className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                                 <LineChart className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                             </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <StrategyAnalyzer t={t} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-6">
                                <BrandKitGenerator t={t} />
                                <InventoryForecaster t={t} />
                            </div>
                            <div className="space-y-6">
                                <ReviewResponder t={t} />
                                <LegalTemplates t={t} />
                            </div>
                            <div className="space-y-6">
                                <CompetitorSpy t={t} />
                                <CashFlowVisualizer t={t} />
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};