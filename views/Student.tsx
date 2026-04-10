import React, { useState, useEffect, useRef } from 'react';
import { Flame, Target, Book, Brain, FileText, Zap, ChevronDown, Trash2, Upload, File as FileIcon, Save, X, Settings2, RotateCw, FileQuestion, CheckCircle, AlertCircle, Code, Layout as LayoutIcon, Mic, PieChart as PieIcon, ScanLine, Sparkles, GraduationCap, Trophy, Plus, ArrowLeft, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { Card, Button, Input, Textarea, Badge, Select, Label } from '../components/ui/Components';
import { StudyActivityChart } from '../components/Charts';
import { GeminiService, FileData, QAConfig } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { HistoryItem, Material, Exam } from '../types';
import { useToast } from '../App';
import { translations } from '../utils/translations';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Type } from "@google/genai";

// Mermaid Chart Component
const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const render = async () => {
            if (!chart) return;
            try {
                setError(false);
                // @ts-ignore
                if (window.mermaid) {
                     const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                     // @ts-ignore
                     const { svg } = await window.mermaid.render(id, chart);
                     setSvg(svg);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            }
        };
        render();
    }, [chart]);

    if (error) return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">Failed to render mind map. The AI may have generated invalid syntax.</p>
            <details className="mt-2">
                <summary className="text-xs text-red-400/70 cursor-pointer">View Syntax</summary>
                <pre className="text-xs text-muted mt-1 overflow-x-auto p-2 bg-black/20 rounded">{chart}</pre>
            </details>
        </div>
    );
    
    return <div className="mermaid-container bg-surface/50 p-6 rounded-lg overflow-x-auto flex justify-center border border-white/5" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const FlashcardViewer: React.FC<{ cards: any[] }> = ({ cards }) => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    
    // reset flip when index changes
    useEffect(() => setFlipped(false), [index]);

    if (!cards || cards.length === 0) return <div>No cards generated.</div>;

    const current = cards[index];

    return (
        <div className="flex flex-col items-center space-y-6 w-full">
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div 
                className="group h-96 w-full max-w-2xl perspective-1000 cursor-pointer"
                onClick={() => setFlipped(!flipped)}
            >
                <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${flipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-surface border-2 border-primary/20 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors z-10">
                         <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                            <div className="max-h-full overflow-y-auto hide-scrollbar w-full">
                                <h3 className="text-2xl font-bold text-text leading-snug">{current.front}</h3>
                            </div>
                         </div>
                         <span className="text-xs text-muted mt-4 uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
                            <RotateCw className="w-4 h-4" /> Tap to flip
                        </span>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 rotate-y-180 backface-hidden bg-gradient-to-br from-primary/10 to-surface border-2 border-primary p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center z-10">
                         <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                            <div className="max-h-full overflow-y-auto hide-scrollbar w-full">
                                <p className="text-lg text-text font-medium leading-relaxed whitespace-pre-wrap">{current.back}</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 bg-surface p-2 rounded-xl border border-border shadow-sm">
                <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIndex(i => Math.max(0, i-1)); }} disabled={index === 0}>
                    <ChevronLeft className="w-5 h-5" /> Prev
                </Button>
                <span className="font-mono text-sm text-muted font-medium w-16 text-center">{index + 1} / {cards.length}</span>
                <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIndex(i => Math.min(cards.length-1, i+1)); }} disabled={index === cards.length-1}>
                    Next <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

const QAResultViewer: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return <div className="text-muted italic">No Q&A generated.</div>;
    
    const sections = [
        { key: 'fillInTheBlanks', title: 'Fill in the Blanks' },
        { key: 'mcq', title: 'Multiple Choice Questions' },
        { key: 'questions2Marks', title: 'Short Answer (2 Marks)' },
        { key: 'questions5Marks', title: 'Short Answer (5 Marks)' },
        { key: 'questions10Marks', title: 'Long Answer (10 Marks)' },
        { key: 'questions15Marks', title: 'Essay (15 Marks)' },
    ];

    const hasData = sections.some(sec => data[sec.key] && data[sec.key].length > 0);
    if (!hasData) return <div className="text-muted italic">Format not recognized or empty.</div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            {sections.map(sec => {
                const items = data[sec.key];
                if (!items || items.length === 0) return null;
                return (
                    <div key={sec.key} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <div className="h-6 w-1 bg-primary rounded-full"></div>
                            <h4 className="font-bold text-lg text-text">{sec.title}</h4>
                        </div>
                        <div className="space-y-4">
                            {items.map((item: any, i: number) => (
                                <div key={i} className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:border-primary/30 transition-colors">
                                    <p className="font-medium text-text mb-3 leading-relaxed">
                                        <span className="font-bold text-muted mr-3">{i+1}.</span>
                                        {item.question}
                                    </p>
                                    
                                    {item.options && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 ml-6">
                                            {item.options.map((opt: string, idx: number) => (
                                                <div key={idx} className={`text-sm px-3 py-2 rounded-lg transition-colors ${opt === item.correctAnswer ? 'bg-green-500/10 text-green-600 border border-green-500/20 font-medium' : 'bg-background border border-border text-muted-foreground'}`}>
                                                    <span className="font-mono opacity-50 mr-2">{String.fromCharCode(65+idx)}.</span> {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="mt-3 ml-6 text-sm flex gap-2 items-start">
                                        <Badge variant="success">Answer</Badge>
                                        <span className="text-text/80 leading-relaxed bg-green-500/5 px-2 py-0.5 rounded inline-block">
                                            {item.answer || item.correctAnswer}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ProjectTrackerViewer: React.FC<{ data: any[] }> = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) return <div className="text-muted italic">No project data generated.</div>;
    
    return (
        <div className="space-y-6 animate-in fade-in">
            <h4 className="font-bold text-lg text-text border-b border-border pb-2">Contribution Analysis</h4>
            <div className="grid gap-4">
                {data.map((member, i) => (
                    <div key={i} className="bg-surface border border-border p-5 rounded-xl flex items-center gap-5 shadow-sm hover:border-primary/40 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-lg text-text truncate pr-4">{member.name}</span>
                                <span className="font-mono text-primary font-bold">{member.percentage}%</span>
                            </div>
                            <div className="w-full bg-background h-3 rounded-full overflow-hidden mb-2 border border-border/50">
                                <div className="bg-primary h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${member.percentage}%` }}></div>
                            </div>
                            <p className="text-sm text-muted line-clamp-2">{member.task}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CitationViewer: React.FC<{ data: { apa: string, mla: string } }> = ({ data }) => {
    if (!data || (!data.apa && !data.mla)) return <div className="text-muted italic">No citations generated.</div>;

    const CopyBlock = ({ title, text, colorClass, bgClass }: any) => (
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${bgClass} ${colorClass}`}>
                    {title} Style
                </span>
                <button 
                    onClick={() => navigator.clipboard.writeText(text)}
                    className="text-muted hover:text-primary transition-colors p-1 rounded hover:bg-background"
                    title="Copy to clipboard"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            <p className="font-mono text-sm text-text select-all leading-relaxed bg-background/50 p-3 rounded-lg border border-border/50">
                {text}
            </p>
        </div>
    );

    return (
        <div className="grid gap-6 animate-in fade-in">
            {data.apa && <CopyBlock title="APA" text={data.apa} colorClass="text-blue-600" bgClass="bg-blue-500/10" />}
            {data.mla && <CopyBlock title="MLA" text={data.mla} colorClass="text-purple-600" bgClass="bg-purple-500/10" />}
        </div>
    );
};

interface StudentViewProps {
    lang: string;
    theme?: 'light' | 'dark';
    onNavigate?: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentViewProps> = ({ lang, theme = 'dark', onNavigate }) => {
    const [improvementAreas, setImprovementAreas] = useState<any[]>([]);
    const [stats, setStats] = useState({
        streak: 0,
        weeklyGoal: 0,
        materialsCount: 0,
        activityData: [] as any[],
        upcomingExams: [] as Exam[]
    });
    
    const t = translations[lang] || translations['en'];
    
    useEffect(() => {
        GeminiService.getImprovementAreas().then(setImprovementAreas);
        StorageService.getStudentStats().then(data => {
            setStats({
                streak: data.streak,
                weeklyGoal: data.weeklyGoal,
                materialsCount: data.materialsCount,
                activityData: data.activityData,
                upcomingExams: data.upcomingExams
            });
        });
    }, []);

    const navCards = [
        {
            id: 'materials',
            title: t.aiTools,
            desc: "Generate summaries, flashcards, Q&A, and mind maps.",
            icon: Book,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "hover:border-blue-500"
        },
        {
            id: 'exams',
            title: t.exams,
            desc: "Generate custom exams from your notes and test yourself.",
            icon: FileQuestion,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "hover:border-purple-500"
        },
        {
            id: 'playground',
            title: t.codePlayground,
            desc: "Write, run, and debug code in Python, JavaScript, C++, and HTML.",
            icon: Code,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "hover:border-green-500"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-800 p-8 shadow-2xl">
                <div className="relative z-10 flex justify-between items-end">
                     <div className="text-white space-y-2">
                         <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                             <Sparkles className="w-4 h-4" />
                             <span className="text-xs font-medium">Keep Learning</span>
                         </div>
                         <h1 className="text-3xl md:text-4xl font-bold">Ready to conquer your goals?</h1>
                         <p className="text-violet-100 max-w-lg">You're on a {stats.streak}-day streak! Your next Physics exam is approaching.</p>
                         <div className="flex gap-3 pt-4">
                             <Button onClick={() => onNavigate?.('materials')} className="bg-white text-violet-800 hover:bg-violet-50 border-0">
                                <Upload className="w-4 h-4 mr-2" /> Upload Notes
                             </Button>
                             <Button onClick={() => onNavigate?.('exams')} className="bg-violet-500/30 text-white hover:bg-violet-500/40 border-0 backdrop-blur-sm">
                                Take Exam
                             </Button>
                         </div>
                     </div>
                     <div className="hidden md:block opacity-80">
                         <Trophy className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                         <GraduationCap className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                     </div>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200 border-l-4 border-l-orange-500">
                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">{t.studyStreak}</p>
                        <h3 className="text-2xl font-bold text-text">{stats.streak} {t.days}</h3>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200 border-l-4 border-l-blue-500">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">{t.weeklyGoal}</p>
                        <h3 className="text-2xl font-bold text-text">{stats.weeklyGoal}%</h3>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200 border-l-4 border-l-purple-500">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                        <Book className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">{t.materials}</p>
                        <h3 className="text-2xl font-bold text-text">{stats.materialsCount}</h3>
                    </div>
                </Card>
            </div>

            {/* Quick Access / Main Navigation */}
            <div>
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                    <LayoutIcon className="w-5 h-5 text-primary" />
                    {t.quickActions || "Study Hub"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {navCards.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => onNavigate?.(item.id)} 
                            className={`group p-5 bg-surface border border-border rounded-xl text-left transition-all hover:shadow-lg ${item.border}`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${item.bg}`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <h3 className="font-bold text-lg text-text mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title={t.studyActivity}>
                        <StudyActivityChart data={stats.activityData.length > 0 ? stats.activityData : [{name:'Mon', value:0}]} theme={theme} />
                    </Card>
                    
                    <Card title={t.aiSuggestions}>
                        <div className="space-y-3">
                            {improvementAreas.length > 0 ? improvementAreas.map((area, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border hover:shadow-md transition-all">
                                    <div className="mt-1 p-1.5 bg-yellow-500/10 rounded-full">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-text">{area.topic}</h4>
                                            <Badge variant={area.priority === 'High' ? 'warning' : 'info'}>{area.priority}</Badge>
                                        </div>
                                        <p className="text-sm text-muted leading-relaxed">{area.suggestion}</p>
                                    </div>
                                </div>
                            )) : <div className="flex flex-col items-center justify-center py-8 text-muted">
                                <Zap className="w-8 h-8 mb-2 opacity-20" />
                                <p>{t.analyzing}</p>
                            </div>}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                   <Card title={t.upcomingExams}>
                        <div className="space-y-3">
                             {stats.upcomingExams.length > 0 ? stats.upcomingExams.map((exam, i) => (
                                 <div key={i} className="p-4 bg-background rounded-lg border border-border flex flex-col gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                     <div className="flex justify-between items-start">
                                         <div>
                                            <h4 className="font-bold text-text">{exam.subject}</h4>
                                            <p className="text-xs text-muted mt-1">{new Date(exam.date).toLocaleDateString()} • {exam.durationMinutes} mins</p>
                                         </div>
                                         <Badge variant="info">Scheduled</Badge>
                                     </div>
                                     <p className="text-xs text-muted opacity-80 line-clamp-1">{exam.title}</p>
                                     <Button size="sm" variant="primary" className="w-full text-xs h-8 mt-1 group-hover:bg-primary-hover">
                                         {t.start} Exam
                                     </Button>
                                 </div>
                             )) : (
                                 <div className="text-center py-10 border border-dashed border-border rounded-lg">
                                     <FileQuestion className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                                     <p className="text-sm text-muted">No exams scheduled.</p>
                                 </div>
                             )}
                        </div>
                   </Card>
                </div>
            </div>
        </div>
    );
};

export const StudentTools: React.FC<StudentViewProps> = ({ lang, onNavigate }) => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTool, setActiveTool] = useState<'SUMMARY' | 'FLASHCARD' | 'MINDMAP' | 'QA' | 'PROJECT_TRACKER' | 'BIBLIO' | 'VOICE_FLOW'>('SUMMARY');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    // QA Configuration State
    const [qaSettings, setQaSettings] = useState({
        fillInBlanks: { enabled: false, count: 5 },
        mcq: { enabled: true, count: 5 },
        short2: { enabled: true, count: 5 },
        short5: { enabled: true, count: 2 },
        long10: { enabled: true, count: 1 },
        long15: { enabled: true, count: 1 },
    });

    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const { addToast } = useToast();
    const t = translations[lang] || translations['en'];

    useEffect(() => {
        setHistory(StorageService.getHistory('STUDENT').filter(h => h.type === activeTool));
    }, [activeTool]);

    useEffect(() => {
        StorageService.getAllMaterials().then(setMaterials);
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                addToast("Speech recognition not supported in this browser.", "error");
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                if (finalTranscript) setInputText(prev => prev + " " + finalTranscript);
            };
            recognition.start();
            recognitionRef.current = recognition;
            setIsRecording(true);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             setSelectedMaterialId('');
             const reader = new FileReader();
             reader.onload = (evt) => {
                 const result = evt.target?.result as string;
                 const match = result.match(/^data:(.*);base64,(.*)$/);
                 if (match) setUploadedFile({ name: file.name, mimeType: match[1], data: match[2] });
             };
             reader.readAsDataURL(file);
        }
    };

    const handleSaveMaterial = async () => {
        if (!uploadedFile) return;
        const newMaterial: Material = {
            id: Date.now().toString(),
            title: uploadedFile.name,
            type: uploadedFile.mimeType.includes('pdf') ? 'PDF' : uploadedFile.mimeType.includes('image') ? 'IMAGE' : 'TEXT',
            content: `data:${uploadedFile.mimeType};base64,${uploadedFile.data}`,
            createdAt: Date.now()
        };
        await StorageService.saveMaterial(newMaterial);
        setMaterials(prev => [newMaterial, ...prev]);
        addToast("Material saved successfully", "success");
    };

    const handleGenerate = async () => {
        if (!inputText && !uploadedFile && !selectedMaterialId) {
            addToast("Please enter text or select a file/material.", "error");
            return;
        }
        setLoading(true);
        setResult(null);

        try {
            let fileData: FileData | undefined = undefined;
            if (uploadedFile) {
                fileData = { mimeType: uploadedFile.mimeType, data: uploadedFile.data };
            } else if (selectedMaterialId) {
                const mat = materials.find(m => m.id === selectedMaterialId);
                if (mat) {
                    const match = mat.content.match(/^data:(.*);base64,(.*)$/);
                    if (match) fileData = { mimeType: match[1], data: match[2] };
                }
            }

            let res;
            if (activeTool === 'SUMMARY') res = await GeminiService.summarize(inputText, fileData);
            if (activeTool === 'FLASHCARD') res = await GeminiService.generateFlashcards(inputText, fileData);
            if (activeTool === 'QA') {
                const config: QAConfig = {
                    fillInBlanks: qaSettings.fillInBlanks.enabled ? qaSettings.fillInBlanks.count : 0,
                    mcq: qaSettings.mcq.enabled ? qaSettings.mcq.count : 0,
                    short2: qaSettings.short2.enabled ? qaSettings.short2.count : 0,
                    short5: qaSettings.short5.enabled ? qaSettings.short5.count : 0,
                    long10: qaSettings.long10.enabled ? qaSettings.long10.count : 0,
                    long15: qaSettings.long15.enabled ? qaSettings.long15.count : 0,
                };
                if (Object.values(config).every(v => v === 0)) {
                    addToast("Please select at least one question type.", "error");
                    setLoading(false);
                    return;
                }
                res = await GeminiService.generateQA(inputText, fileData, config);
            }
            if (activeTool === 'MINDMAP' || activeTool === 'VOICE_FLOW') res = await GeminiService.generateMindMap(inputText, fileData);
            if (activeTool === 'PROJECT_TRACKER') {
                const schema = {
                    type: Type.OBJECT,
                    properties: {
                        contributors: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    percentage: { type: Type.NUMBER },
                                    task: { type: Type.STRING }
                                }
                            }
                        }
                    }
                };
                const json = await GeminiService.generateStructuredJSON(`Analyze contribution: ${inputText}`, schema, fileData);
                res = json.contributors;
            }
            if (activeTool === 'BIBLIO') {
                 const prompt = `Generate citation in APA and MLA for: ${inputText}`;
                 res = await GeminiService.generateStructuredJSON(prompt, { type: Type.OBJECT, properties: { apa: { type: Type.STRING }, mla: { type: Type.STRING } }}, fileData);
            }

            setResult(res);
            addToast(t.generatedSuccess || "Content generated!", "success");
            
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                type: activeTool as any,
                title: activeTool + ' - ' + new Date().toLocaleTimeString(),
                content: res,
                createdAt: Date.now()
            };
            StorageService.addHistoryItem('STUDENT', newItem);
            setHistory(prev => [newItem, ...prev]);
        } catch (e: any) {
            console.error(e);
            addToast(e.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHistory = (id: string) => {
        StorageService.deleteHistoryItem('STUDENT', id);
        setHistory(prev => prev.filter(h => h.id !== id));
        addToast("Item deleted", "info");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-300">
            <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" onClick={() => onNavigate?.('dashboard')} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <h2 className="text-2xl font-bold text-text">{t.aiTools}</h2>
                </div>
                
                <Card>
                    <div className="flex gap-2 mb-6 border-b border-border pb-4 overflow-x-auto">
                        {['SUMMARY', 'FLASHCARD', 'QA', 'MINDMAP', 'PROJECT_TRACKER', 'BIBLIO', 'VOICE_FLOW'].map((k) => (
                            <button 
                                key={k}
                                onClick={() => { setActiveTool(k as any); setResult(null); setInputText(''); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTool === k ? 'bg-primary text-white shadow-md' : 'bg-surface text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                {k === 'PROJECT_TRACKER' ? 'Group Project' : k === 'BIBLIO' ? 'Citation' : k === 'VOICE_FLOW' ? 'Voice 2 Flow' : t[k.toLowerCase()] || k}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {/* Source Selection Area */}
                        <div className="p-4 bg-background border border-border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted">Input Source</span>
                                {(uploadedFile || selectedMaterialId) && <Badge variant="success">Source Active</Badge>}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                     <div className="relative">
                                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                                         <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => fileInputRef.current?.click()}>
                                             <Upload className="w-3 h-3 mr-2" /> Upload File (PDF/Image)
                                         </Button>
                                     </div>
                                </div>
                                <div className="space-y-2">
                                     <Select value={selectedMaterialId} onChange={(e) => { setSelectedMaterialId(e.target.value); if (e.target.value) setUploadedFile(null); }} className="w-full text-xs py-1.5 h-8">
                                         <option value="">Select Saved Material</option>
                                         {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                     </Select>
                                </div>
                            </div>

                            {uploadedFile && (
                                <div className="flex items-center justify-between p-2 bg-primary/10 rounded border border-primary/20">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileIcon className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-xs text-text truncate">{uploadedFile.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <button onClick={handleSaveMaterial} className="text-primary hover:text-primary-hover" title="Save to Materials"><Save className="w-4 h-4" /></button>
                                         <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-muted hover:text-red-500"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {activeTool === 'VOICE_FLOW' && (
                             <div className="flex justify-center py-4">
                                 <button onClick={toggleRecording} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-primary-hover'}`}>
                                     <Mic className="w-8 h-8 text-white" />
                                 </button>
                             </div>
                        )}

                        {activeTool === 'QA' && (
                            <div className="p-4 bg-background border border-border rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings2 className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-text">Configure Question Types</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'fillInBlanks', label: t.fillInBlanks || 'Fill in Blanks', marks: '1m' },
                                        { id: 'mcq', label: 'Multiple Choice', marks: '1m' },
                                        { id: 'short2', label: 'Short Answer', marks: '2m' },
                                        { id: 'short5', label: 'Medium Answer', marks: '5m' },
                                        { id: 'long10', label: 'Long Answer', marks: '10m' },
                                        { id: 'long15', label: 'Essay', marks: '15m' }
                                    ].map((type) => {
                                        const key = type.id as keyof typeof qaSettings;
                                        const setting = qaSettings[key];
                                        return (
                                            <div key={key} className="flex items-center justify-between p-2 border border-border rounded bg-surface/50">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" id={`check-${key}`} checked={setting.enabled} onChange={(e) => setQaSettings(prev => ({...prev, [key]: { ...prev[key], enabled: e.target.checked }}))} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                                                    <label htmlFor={`check-${key}`} className="text-sm text-text cursor-pointer select-none">{type.label} ({type.marks})</label>
                                                </div>
                                                {setting.enabled && <input type="number" min="1" max="20" value={setting.count} onChange={(e) => setQaSettings(prev => ({...prev, [key]: { ...prev[key], count: parseInt(e.target.value) || 1 }}))} className="w-12 px-1 py-1 text-xs border border-border rounded bg-background text-text text-center focus:outline-none focus:border-primary" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <Textarea rows={4} placeholder={`${t.pasteText || 'Paste text'} or describe file...`} value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full" />
                        <div className="flex justify-end">
                            <Button onClick={handleGenerate} loading={loading}><Zap className="w-4 h-4 mr-2" /> {t.generate}</Button>
                        </div>
                    </div>
                </Card>

                {result && (
                    <Card title={t.result} className="border-primary/50 animate-in fade-in slide-in-from-bottom-4">
                         <div className="whitespace-pre-wrap text-sm">
                            {activeTool === 'FLASHCARD' ? (
                                <FlashcardViewer cards={result} />
                            ) : activeTool === 'MINDMAP' || activeTool === 'VOICE_FLOW' ? (
                                <MermaidChart chart={result} />
                            ) : activeTool === 'QA' ? (
                                <QAResultViewer data={result} />
                            ) : activeTool === 'PROJECT_TRACKER' ? (
                                <ProjectTrackerViewer data={result} />
                            ) : activeTool === 'BIBLIO' ? (
                                <CitationViewer data={result} />
                            ) : (
                                typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                            )}
                         </div>
                    </Card>
                )}
            </div>

            <div className="space-y-4 overflow-y-auto h-full pl-2">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-text">{t.history}</h3>
                    <span className="text-xs text-muted">{history.length} {t.items}</span>
                </div>
                {history.map((item) => (
                    <div key={item.id} className="bg-surface border border-border rounded-lg p-3 group hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium line-clamp-1 text-text">{item.title}</h4>
                            <button onClick={() => handleDeleteHistory(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                            <Button variant="secondary" size="sm" className="h-6 text-xs px-2" onClick={() => setResult(item.content)}>{t.view}</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const StudentExams: React.FC<StudentViewProps & { onNavigate?: (view: string) => void }> = ({ lang, onNavigate }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'TAKE'>('LIST');
    const [exams, setExams] = useState<HistoryItem[]>([]);
    const [activeExam, setActiveExam] = useState<HistoryItem | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [evaluation, setEvaluation] = useState<any>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [flatQuestions, setFlatQuestions] = useState<any[]>([]);

    // Creation State
    const [topic, setTopic] = useState('');
    const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [qaSettings, setQaSettings] = useState({
        fillInBlanks: { enabled: false, count: 5 }, // 1 Mark
        mcq: { enabled: true, count: 5 }, // 1 Mark
        short2: { enabled: true, count: 3 }, // 2 Marks
        short5: { enabled: true, count: 2 }, // 5 Marks
        long10: { enabled: true, count: 1 }, // 10 Marks
        long15: { enabled: false, count: 1 }, // 15 Marks
    });
    
    const { addToast } = useToast();
    const t = translations[lang] || translations['en'];

    useEffect(() => {
        const history = StorageService.getHistory('STUDENT');
        setExams(history.filter(h => h.type === 'QA'));
    }, [viewMode]); // Reload on view change

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             const reader = new FileReader();
             reader.onload = (evt) => {
                 const result = evt.target?.result as string;
                 const match = result.match(/^data:(.*);base64,(.*)$/);
                 if (match) setUploadedFile({ name: file.name, mimeType: match[1], data: match[2] });
             };
             reader.readAsDataURL(file);
        }
    };

    const handleGenerateExam = async () => {
        if (!topic && !uploadedFile) {
            addToast("Please enter a topic or upload a file.", "error");
            return;
        }
        setIsGenerating(true);
        try {
            const config: QAConfig = {
                fillInBlanks: qaSettings.fillInBlanks.enabled ? qaSettings.fillInBlanks.count : 0,
                mcq: qaSettings.mcq.enabled ? qaSettings.mcq.count : 0,
                short2: qaSettings.short2.enabled ? qaSettings.short2.count : 0,
                short5: qaSettings.short5.enabled ? qaSettings.short5.count : 0,
                long10: qaSettings.long10.enabled ? qaSettings.long10.count : 0,
                long15: qaSettings.long15.enabled ? qaSettings.long15.count : 0,
            };

            const fileData = uploadedFile ? { mimeType: uploadedFile.mimeType, data: uploadedFile.data } : undefined;
            const res = await GeminiService.generateQA(topic, fileData, config);
            
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                type: 'QA',
                title: topic ? `Exam: ${topic.slice(0, 30)}...` : `Exam from ${uploadedFile?.name}`,
                content: res,
                createdAt: Date.now()
            };
            StorageService.addHistoryItem('STUDENT', newItem);
            setExams(prev => [newItem, ...prev]);
            addToast("Exam generated successfully!", "success");
            startExam(newItem); // Auto-start
        } catch (e: any) {
            addToast("Failed to generate exam: " + e.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const startExam = (exam: HistoryItem) => {
        const q = exam.content;
        const flat: any[] = [];
        let idx = 0;
        const addQuestions = (items: any[], type: string, maxMarks: number) => {
             if (items) items.forEach((item: any) => flat.push({ ...item, id: idx++, type, maxMarks }));
        };
        addQuestions(q.fillInTheBlanks, 'Fill In Blank', 1);
        addQuestions(q.mcq, 'MCQ', 1);
        addQuestions(q.questions2Marks, 'Short (2 Marks)', 2);
        addQuestions(q.questions5Marks, 'Short (5 Marks)', 5);
        addQuestions(q.questions10Marks, 'Long (10 Marks)', 10);
        addQuestions(q.questions15Marks, 'Long (15 Marks)', 15);

        setFlatQuestions(flat);
        setActiveExam(exam);
        setAnswers({});
        setEvaluation(null);
        setViewMode('TAKE');
    };

    const handleSubmit = async () => {
        if (!activeExam) return;
        setIsEvaluating(true);
        const payload = flatQuestions.map((q, i) => ({
            question: q.question,
            type: q.type,
            maxMarks: q.maxMarks,
            originalAnswer: q.answer || q.correctAnswer || '',
            userAnswer: answers[i] || ''
        }));

        try {
            const result = await GeminiService.evaluateExam(payload);
            setEvaluation(result);
        } catch (e) {
            console.error(e);
            addToast("Evaluation failed", "error");
        } finally {
            setIsEvaluating(false);
        }
    };

    if (viewMode === 'TAKE' && activeExam) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text">{activeExam.title}</h2>
                    <Button variant="secondary" onClick={() => setViewMode('LIST')}>Back to List</Button>
                </div>

                {!evaluation ? (
                    <Card className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            {flatQuestions.map((q, i) => (
                                <div key={i} className="space-y-2 pb-6 border-b border-border last:border-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="font-medium text-text text-lg">
                                            <span className="text-muted mr-2">{i+1}.</span>
                                            {q.question}
                                        </h3>
                                        <Badge>{q.maxMarks} Marks</Badge>
                                    </div>

                                    {q.type === 'MCQ' ? (
                                        <div className="space-y-2 mt-2">
                                            {q.options?.map((opt: string, optIdx: number) => (
                                                <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[i] === opt ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:bg-surface'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name={`q-${i}`} 
                                                        value={opt}
                                                        checked={answers[i] === opt}
                                                        onChange={(e) => setAnswers(prev => ({...prev, [i]: e.target.value}))}
                                                        className="w-4 h-4 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-text">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <Textarea 
                                            rows={q.type.includes('Long') ? 6 : 2}
                                            placeholder="Type your answer here..."
                                            value={answers[i] || ''}
                                            onChange={(e) => setAnswers(prev => ({...prev, [i]: e.target.value}))}
                                            className="bg-background w-full"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSubmit} loading={isEvaluating} size="lg">Submit Exam & Evaluate</Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-text">Evaluation Result</h3>
                                    <p className="text-muted mt-1">{evaluation.feedback}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-primary">{evaluation.totalScore} <span className="text-xl text-muted">/ {evaluation.maxScore}</span></div>
                                    <Badge variant={evaluation.totalScore/evaluation.maxScore > 0.7 ? 'success' : 'warning'}>
                                        {Math.round((evaluation.totalScore/evaluation.maxScore) * 100)}% Score
                                    </Badge>
                                </div>
                            </div>
                        </Card>

                        <div className="grid gap-4">
                            {evaluation.results?.map((res: any, i: number) => {
                                const q = flatQuestions[res.questionIndex]; 
                                return (
                                    <Card key={i} className={`border-l-4 ${res.marksAwarded === q.maxMarks ? 'border-l-green-500' : res.marksAwarded > 0 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-text w-3/4">{q.question}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${res.marksAwarded === q.maxMarks ? 'text-green-500' : 'text-text'}`}>{res.marksAwarded}/{q.maxMarks}</span>
                                                {res.isCorrect ? <CheckCircle className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-red-500"/>}
                                            </div>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                                            <div className="p-3 bg-red-500/5 rounded border border-red-500/10">
                                                <p className="font-semibold text-red-400 mb-1">Your Answer:</p>
                                                <p className="text-text/80">{answers[res.questionIndex] || "No answer provided"}</p>
                                            </div>
                                            <div className="p-3 bg-green-500/5 rounded border border-green-500/10">
                                                <p className="font-semibold text-green-400 mb-1">Expected Answer / Fact:</p>
                                                <p className="text-text/80">{q.answer || q.correctAnswer}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 p-3 bg-blue-500/5 rounded text-sm text-blue-300">
                                            <strong>AI Feedback:</strong> {res.feedback}
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                        <div className="flex justify-center pt-6 gap-4">
                             <Button onClick={() => setViewMode('LIST')}>Back to Exams</Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (viewMode === 'CREATE') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" onClick={() => setViewMode('LIST')} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <h2 className="text-2xl font-bold text-text">Generate New Exam</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <div className="space-y-6">
                            <div>
                                <Label>Source Material</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="p-4 border border-dashed border-border rounded-lg bg-surface hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
                                        <Upload className="w-8 h-8 mx-auto text-primary mb-2" />
                                        <p className="text-sm font-medium">Upload PDF / Image</p>
                                        {uploadedFile && <p className="text-xs text-green-500 mt-1">{uploadedFile.name}</p>}
                                    </div>
                                    <div className="relative">
                                        <Textarea placeholder="Or paste text / topic here..." value={topic} onChange={e => setTopic(e.target.value)} className="h-full min-h-[120px]" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Question Configuration</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-surface p-4 rounded-lg border border-border">
                                    {[
                                        { id: 'fillInBlanks', label: 'Fill in Blanks', marks: '1 Mark' },
                                        { id: 'mcq', label: 'Multiple Choice', marks: '1 Mark' },
                                        { id: 'short2', label: 'Short Answer', marks: '2 Marks' },
                                        { id: 'short5', label: 'Medium Answer', marks: '5 Marks' },
                                        { id: 'long10', label: 'Long Answer', marks: '10 Marks' },
                                        { id: 'long15', label: 'Essay Answer', marks: '15 Marks' }
                                    ].map((type) => {
                                        const key = type.id as keyof typeof qaSettings;
                                        const setting = qaSettings[key];
                                        return (
                                            <div key={key} className="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={setting.enabled} onChange={(e) => setQaSettings(prev => ({ ...prev, [key]: { ...prev[key], enabled: e.target.checked } }))} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium">{type.label}</p>
                                                        <p className="text-xs text-muted">{type.marks}</p>
                                                    </div>
                                                </div>
                                                {setting.enabled && <input type="number" min="1" max="20" value={setting.count} onChange={(e) => setQaSettings(prev => ({ ...prev, [key]: { ...prev[key], count: parseInt(e.target.value) || 1 } }))} className="w-16 p-1 text-center text-sm border border-border rounded bg-background" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <Button size="lg" className="w-full" onClick={handleGenerateExam} loading={isGenerating}>
                                <Zap className="w-4 h-4 mr-2" /> Generate Exam & Start
                            </Button>
                        </div>
                    </Card>
                    
                    <div className="space-y-4">
                        <Card className="bg-primary/5 border-primary/10">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Target className="w-5 h-5 text-primary"/> Exam Tips</h3>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Uploading clear images helps AI read better.</li>
                                <li>• Combine 1-mark and 10-mark questions for a balanced paper.</li>
                                <li>• You can evaluate your answers immediately after generation.</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Default LIST view
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => onNavigate?.('dashboard')} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Dashboard
                    </Button>
                    <h2 className="text-2xl font-bold text-text">Practice Exams</h2>
                </div>
                <Button onClick={() => setViewMode('CREATE')}><Plus className="w-4 h-4 mr-2" /> Create New Exam</Button>
            </div>
            
            <p className="text-muted">Generate custom exams from your study materials or take previous ones.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.length > 0 ? exams.map((exam) => (
                     <Card key={exam.id} className="hover:border-primary transition-colors cursor-pointer group flex flex-col justify-between" onClick={() => startExam(exam)}>
                         <div>
                             <div className="flex items-center gap-2 mb-2">
                                 <FileQuestion className="w-5 h-5 text-primary" />
                                 <h3 className="font-semibold text-text line-clamp-1">{exam.title}</h3>
                             </div>
                             <p className="text-sm text-muted">Created {new Date(exam.createdAt).toLocaleDateString()}</p>
                         </div>
                         <Button className="w-full mt-4" variant="secondary" onClick={(e) => { e.stopPropagation(); startExam(exam); }}>Take Again</Button>
                     </Card>
                )) : (
                    <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
                        <FileQuestion className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-text mb-2">No Exams Found</h3>
                        <p className="text-muted mb-6">Create your first AI-generated exam to test your knowledge.</p>
                        <Button size="lg" onClick={() => setViewMode('CREATE')}>
                            <Plus className="w-4 h-4 mr-2" /> Create Exam
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};