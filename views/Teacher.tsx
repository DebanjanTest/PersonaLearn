import React, { useState, useRef, useEffect } from 'react';
import { 
    Users, FileText, Calendar, PlusCircle, Upload, Settings2, 
    Save, X, Check, File as FileIcon, Printer, Clock, 
    GraduationCap, BookOpen, BarChart3, Edit3, Trash2,
    TrendingUp, Image as ImageIcon, Sparkles, Bell, AlertTriangle, Award, Target
} from 'lucide-react';
import { Card, Button, Input, Select, Label, Textarea, Badge } from '../components/ui/Components';
import { GeminiService, QAConfig } from '../services/geminiService';
import { useToast } from '../App';
import { translations } from '../utils/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface TeacherViewProps {
    lang: string;
    activeTab?: string;
    onNavigate?: (tab: string) => void;
}

const AttendanceTracker: React.FC = () => {
    const [students, setStudents] = useState([
        { id: 1, name: 'Aarav Patel', roll: '101', status: 'PRESENT', notes: '' },
        { id: 2, name: 'Aditi Sharma', roll: '102', status: 'PRESENT', notes: '' },
        { id: 3, name: 'Vihaan Gupta', roll: '103', status: 'ABSENT', notes: 'Sick Leave' },
        { id: 4, name: 'Ananya Singh', roll: '104', status: 'PRESENT', notes: '' },
        { id: 5, name: 'Ishaan Kumar', roll: '105', status: 'PRESENT', notes: '' },
        { id: 6, name: 'Saanvi Reddy', roll: '106', status: 'PRESENT', notes: '' },
        { id: 7, name: 'Reyansh Joshi', roll: '107', status: 'ABSENT', notes: '' },
    ]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const { addToast } = useToast();

    const toggleStatus = (id: number) => {
        setStudents(prev => prev.map(s => 
            s.id === id ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : s
        ));
    };

    const updateNote = (id: number, note: string) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, notes: note } : s));
    };

    const handleSave = () => {
        addToast("Attendance and notes saved successfully.", "success");
    }

    const stats = {
        present: students.filter(s => s.status === 'PRESENT').length,
        total: students.length,
        percentage: Math.round((students.filter(s => s.status === 'PRESENT').length / students.length) * 100)
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-auto" />
                    <Badge variant="info">Class 10-A</Badge>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{stats.percentage}%</span>
                    <span className="text-xs text-muted block">Attendance Rate</span>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-black/5 dark:bg-white/5 border-b border-border">
                        <tr>
                            <th className="p-4 text-left font-medium text-muted">Roll</th>
                            <th className="p-4 text-left font-medium text-muted">Student Name</th>
                            <th className="p-4 text-center font-medium text-muted">Status</th>
                            <th className="p-4 text-left font-medium text-muted">Notes (Optional)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {students.map(s => (
                            <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-muted">{s.roll}</td>
                                <td className="p-4 font-medium">{s.name}</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => toggleStatus(s.id)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                            s.status === 'PRESENT' 
                                            ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 ring-1 ring-green-500/30' 
                                            : 'bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-1 ring-red-500/30'
                                        }`}
                                    >
                                        {s.status}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <Input 
                                        value={s.notes} 
                                        onChange={e => updateNote(s.id, e.target.value)} 
                                        placeholder="Add note for this student..." 
                                        className="h-9 text-xs"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Attendance Log</Button>
            </div>
        </div>
    );
};

const AdvancedExamCreator: React.FC<{ lang: string }> = ({ lang }) => {
    const { addToast } = useToast();
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('10');
    const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, mimeType: string} | null>(null);
    const [logoFile, setLogoFile] = useState<string | null>(null);
    const [schoolName, setSchoolName] = useState('St. Xavier\'s High School');
    const [examDuration, setExamDuration] = useState('2 Hours');
    
    const [qaSettings, setQaSettings] = useState({
        fillInBlanks: { enabled: false, count: 5 },
        mcq: { enabled: true, count: 10 },
        short2: { enabled: true, count: 5 },
        short5: { enabled: true, count: 4 },
        long10: { enabled: true, count: 2 },
        long15: { enabled: false, count: 1 },
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             const reader = new FileReader();
             reader.onload = (evt) => setLogoFile(evt.target?.result as string);
             reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!topic && !uploadedFile) return addToast("Please enter a topic or upload a study material.", "error");
        setLoading(true);

        const config: QAConfig = {
            fillInBlanks: qaSettings.fillInBlanks.enabled ? qaSettings.fillInBlanks.count : 0,
            mcq: qaSettings.mcq.enabled ? qaSettings.mcq.count : 0,
            short2: qaSettings.short2.enabled ? qaSettings.short2.count : 0,
            short5: qaSettings.short5.enabled ? qaSettings.short5.count : 0,
            long10: qaSettings.long10.enabled ? qaSettings.long10.count : 0,
            long15: qaSettings.long15.enabled ? qaSettings.long15.count : 0,
        };

        try {
            const res = await GeminiService.generatePaper(
                topic, grade, uploadedFile ? { mimeType: uploadedFile.mimeType, data: uploadedFile.data } : undefined, config
            );
            setResult(res);
            addToast("Paper Generated Successfully", "success");
        } catch (e) {
            addToast("Failed to generate paper", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-1 space-y-6">
                <Card title="Paper Settings">
                    <div className="space-y-5">
                        <div className="space-y-3 pb-4 border-b border-border">
                            <Label>School Branding</Label>
                            <Input placeholder="Institution Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
                            <div className="flex gap-2 items-center">
                                {logoFile ? (
                                    <div className="relative w-12 h-12 border rounded bg-white flex items-center justify-center overflow-hidden group">
                                        <img src={logoFile} alt="Logo" className="w-full h-full object-contain" />
                                        <button onClick={() => setLogoFile(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => logoInputRef.current?.click()} className="w-12 h-12 border border-dashed rounded flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-colors"><ImageIcon className="w-5 h-5" /></button>
                                )}
                                <div className="flex-1">
                                     <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                     <p className="text-xs text-muted">Upload School Logo (Optional)</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Grade</Label>
                                <Select value={grade} onChange={e => setGrade(e.target.value)}>
                                    {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Class {g}</option>)}
                                </Select>
                            </div>
                            <div>
                                <Label>Duration</Label>
                                <Input value={examDuration} onChange={e => setExamDuration(e.target.value)} />
                            </div>
                        </div>
                        <div className="p-3 bg-background border border-border rounded-lg">
                            <Label className="mb-2">Source Material</Label>
                            {uploadedFile ? (
                                <div className="flex items-center justify-between p-2 bg-primary/10 rounded border border-primary/20">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileIcon className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-xs text-text truncate">{uploadedFile.name}</span>
                                    </div>
                                    <button onClick={() => setUploadedFile(null)} className="text-muted hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
                                    <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => fileInputRef.current?.click()}><Upload className="w-3 h-3 mr-2" /> Upload PDF/Image</Button>
                                    <Textarea placeholder="Or Enter Topic..." rows={2} value={topic} onChange={e => setTopic(e.target.value)} className="text-xs" />
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-background border border-border rounded-lg space-y-3">
                            <Label className="flex items-center gap-2"><Settings2 className="w-3 h-3" /> Structure & Marks</Label>
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                {[
                                    { id: 'fillInBlanks', label: 'Fill in Blanks', marks: '1' }, { id: 'mcq', label: 'MCQs', marks: '1' },
                                    { id: 'short2', label: 'Very Short', marks: '2' }, { id: 'short5', label: 'Short', marks: '5' },
                                    { id: 'long10', label: 'Long', marks: '10' }, { id: 'long15', label: 'Essay', marks: '15' }
                                ].map((type) => {
                                    const key = type.id as keyof typeof qaSettings;
                                    const setting = qaSettings[key];
                                    return (
                                        <div key={key} className="flex items-center justify-between text-xs p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                                             <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={setting.enabled} onChange={(e) => setQaSettings(prev => ({ ...prev, [key]: { ...prev[key], enabled: e.target.checked } }))} className="rounded text-primary focus:ring-primary w-3.5 h-3.5" />
                                                <span className={setting.enabled ? 'text-text' : 'text-muted'}>{type.label} ({type.marks}m)</span>
                                             </div>
                                             {setting.enabled && <input type="number" min="1" max="50" value={setting.count} onChange={(e) => setQaSettings(prev => ({ ...prev, [key]: { ...prev[key], count: parseInt(e.target.value) || 1 } }))} className="w-10 px-1 py-0.5 border rounded text-center bg-surface text-xs" />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <Button onClick={handleGenerate} loading={loading} className="w-full">Generate Exam Paper</Button>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="h-full min-h-[700px] flex flex-col bg-white text-black relative shadow-xl overflow-hidden print:shadow-none">
                    {result ? (
                        <div className="flex-1 p-10 font-serif overflow-y-auto">
                            <div className="border-b-2 border-black pb-6 mb-8">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    {logoFile && <img src={logoFile} alt="School Logo" className="h-16 w-16 object-contain" />}
                                    <div className="text-center">
                                        <h1 className="text-3xl font-bold uppercase tracking-wide text-black">{schoolName}</h1>
                                        <p className="text-sm font-semibold mt-1 text-gray-700">Mid-Term Examination 2024</p>
                                    </div>
                                </div>
                                <div className="flex justify-between font-bold text-sm border-t border-b border-black py-3 px-2 mt-4 bg-gray-50">
                                    <div className="flex flex-col gap-1"><span>Subject: {topic || "General Assessment"}</span><span>Grade: Class {grade}</span></div>
                                    <div className="flex flex-col gap-1 text-right"><span>Time: {examDuration}</span><span>Max Marks: {result.maxMarks || 100}</span></div>
                                </div>
                                <div className="mt-4 text-xs"><strong>Instructions:</strong><ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-700">{result.instructions?.map((inst: string, i: number) => <li key={i}>{inst}</li>) || <li>All questions are compulsory.</li>}</ul></div>
                            </div>
                            <div className="space-y-8">
                                {result.sections?.map((section: any, idx: number) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-end border-b border-gray-400 mb-4 pb-1"><h3 className="font-bold text-lg uppercase">{section.name}</h3><span className="font-bold text-sm text-gray-600">{section.questions.length * section.marksPerQuestion} Marks</span></div>
                                        <div className="space-y-4 pl-2">
                                            {section.questions.map((q: any, qIdx: number) => (
                                                <div key={qIdx} className="break-inside-avoid">
                                                    <div className="flex gap-3">
                                                        <span className="font-bold text-sm w-6">{qIdx + 1}.</span>
                                                        <div className="flex-1"><p className="text-sm leading-relaxed">{q.question}</p>{q.options && <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 ml-2 text-sm">{q.options.map((opt: string, oI: number) => <div key={oI} className="flex gap-2"><span className="font-medium text-gray-600">({String.fromCharCode(97+oI)})</span><span>{opt}</span></div>)}</div>}</div>
                                                        <span className="font-bold text-xs text-gray-500 whitespace-nowrap ml-2">[{section.marksPerQuestion}]</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                             <div className="p-6 bg-white rounded-full shadow-sm mb-4"><FileText className="w-12 h-12 text-gray-300" /></div>
                             <p className="font-medium text-gray-500">Paper Preview</p>
                        </div>
                    )}
                    {result && <div className="absolute top-4 right-4 print:hidden flex gap-2"><Button size="sm" variant="secondary" onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-black border-gray-300"><Printer className="w-4 h-4 mr-2" /> Print / PDF</Button></div>}
                </Card>
            </div>
            <style>{`@media print { body * { visibility: hidden; } .bg-white, .bg-white * { visibility: visible; } .bg-white { position: fixed; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 20px; overflow: visible; z-index: 9999; } .print\\:hidden { display: none !important; } }`}</style>
        </div>
    );
};

const PerformanceAnalytics: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = () => {
        if (!file) return;
        setLoading(true);
        // Mock data logic simulating AI analysis
        const mockData = [
            { name: '0-40%', value: 3, fill: '#ef4444' }, 
            { name: '41-60%', value: 12, fill: '#f97316' },
            { name: '61-80%', value: 24, fill: '#eab308' }, 
            { name: '81-90%', value: 15, fill: '#84cc16' },
            { name: '91-100%', value: 8, fill: '#22c55e' },
        ];
        setTimeout(() => { setChartData(mockData); setLoading(false); }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header / Intro */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">Performance Analytics</h2>
                    <p className="text-muted">Upload grade sheets to visualize class performance and identify at-risk students.</p>
                </div>
                {chartData.length > 0 && (
                    <Button variant="secondary" onClick={() => { setFile(null); setChartData([]); }}>
                        <Upload className="w-4 h-4 mr-2" /> Upload New Sheet
                    </Button>
                )}
            </div>

            {chartData.length === 0 ? (
                <Card className="border-dashed border-2 border-border p-12 flex flex-col items-center justify-center text-center bg-surface/50 hover:bg-surface transition-colors">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload CSV or Excel Sheet</h3>
                    <p className="text-muted max-w-sm mb-6">Supported formats: .csv, .xls, .xlsx. Ensure columns for "Roll No", "Name", and "Score" exist.</p>
                    <div className="relative">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" accept=".csv,.xls,.xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <Button className="pointer-events-none">{file ? file.name : "Select File"}</Button>
                    </div>
                    {file && (
                        <div className="mt-4 w-full max-w-xs">
                            <Button onClick={handleAnalyze} loading={loading} className="w-full" variant="primary">Analyze Data</Button>
                        </div>
                    )}
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Summary Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="flex flex-col justify-center border-l-4 border-l-blue-500">
                            <span className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Class Average</span>
                            <span className="text-3xl font-bold">72.5%</span>
                        </Card>
                        <Card className="flex flex-col justify-center border-l-4 border-l-green-500">
                            <span className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Pass Rate</span>
                            <span className="text-3xl font-bold">94%</span>
                        </Card>
                        <Card className="flex flex-col justify-center border-l-4 border-l-yellow-500">
                            <span className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Highest Score</span>
                            <span className="text-3xl font-bold">98%</span>
                        </Card>
                        <Card className="flex flex-col justify-center border-l-4 border-l-purple-500">
                            <span className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Standard Dev</span>
                            <span className="text-3xl font-bold">±8.2</span>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <Card className="lg:col-span-2 min-h-[400px]" title="Score Distribution">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Insights Column */}
                        <div className="space-y-4">
                            <Card className="bg-red-500/10 border-red-500/20">
                                <h4 className="font-bold text-red-600 flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5" /> At Risk Students
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between items-center pb-2 border-b border-red-500/10">
                                        <span>Rohan G. (Roll 103)</span>
                                        <Badge variant="warning">32%</Badge>
                                    </li>
                                    <li className="flex justify-between items-center pb-2 border-b border-red-500/10">
                                        <span>Priya M. (Roll 142)</span>
                                        <Badge variant="warning">38%</Badge>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span>Samir K. (Roll 115)</span>
                                        <Badge variant="warning">39%</Badge>
                                    </li>
                                </ul>
                                <Button size="sm" variant="danger" className="w-full mt-4 text-xs">Schedule Remedial Class</Button>
                            </Card>

                            <Card className="bg-green-500/10 border-green-500/20">
                                <h4 className="font-bold text-green-600 flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5" /> Top Performers
                                </h4>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    Aditi Sharma (Roll 102) topped with 98%. <br/>
                                    5 students scored above 90%.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const TeacherDashboard: React.FC<TeacherViewProps> = ({ lang, activeTab, onNavigate }) => {
    const t = translations[lang] || translations['en'];
    const [tab, setTab] = useState(activeTab || 'dashboard');

    useEffect(() => { if (activeTab) setTab(activeTab); }, [activeTab]);
    const handleNavigate = (newTab: string) => { setTab(newTab); if (onNavigate) onNavigate(newTab); };

    const data = [
        { name: 'Mon', active: 85, avg: 70 },
        { name: 'Tue', active: 90, avg: 75 },
        { name: 'Wed', active: 92, avg: 72 },
        { name: 'Thu', active: 88, avg: 78 },
        { name: 'Fri', active: 85, avg: 80 },
    ];

    const renderContent = () => {
        switch (tab) {
            case 'EXAM_CREATOR': return <AdvancedExamCreator lang={lang} />;
            case 'CLASSROOM': return <AttendanceTracker />;
            case 'PERFORMANCE': return <PerformanceAnalytics />;
            default: return (
                <div className="space-y-8 animate-in fade-in">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-800 p-8 shadow-2xl">
                        <div className="relative z-10 flex justify-between items-end">
                             <div className="text-white space-y-2">
                                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                                     <Sparkles className="w-4 h-4" />
                                     <span className="text-xs font-medium">Good Morning, Professor</span>
                                 </div>
                                 <h1 className="text-3xl md:text-4xl font-bold">Ready to inspire today?</h1>
                                 <p className="text-emerald-100 max-w-lg">You have 2 classes and 1 staff meeting scheduled. Your recent physics exam paper has been generated.</p>
                                 <div className="flex gap-3 pt-4">
                                     <Button onClick={() => handleNavigate('CLASSROOM')} className="bg-white text-emerald-800 hover:bg-emerald-50 border-0">Start Attendance</Button>
                                     <Button onClick={() => handleNavigate('EXAM_CREATOR')} className="bg-emerald-500/30 text-white hover:bg-emerald-500/40 border-0 backdrop-blur-sm">Create Exam</Button>
                                 </div>
                             </div>
                             <div className="hidden md:block opacity-80">
                                 <GraduationCap className="w-48 h-48 text-white/10 absolute -bottom-10 -right-10" />
                                 <BookOpen className="w-32 h-32 text-white/10 absolute top-10 right-20" />
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="space-y-4 lg:col-span-1">
                             <Card className="flex items-center gap-4 border-l-4 border-l-blue-500 hover:scale-[1.02] transition-transform">
                                 <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"><Users className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                                 <div><p className="text-sm text-muted">Total Students</p><h3 className="text-2xl font-bold">142</h3></div>
                             </Card>
                             <Card className="flex items-center gap-4 border-l-4 border-l-purple-500 hover:scale-[1.02] transition-transform">
                                 <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full"><FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
                                 <div><p className="text-sm text-muted">Papers Created</p><h3 className="text-2xl font-bold">28</h3></div>
                             </Card>
                             <Card className="flex items-center gap-4 border-l-4 border-l-orange-500 hover:scale-[1.02] transition-transform">
                                 <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full"><Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div>
                                 <div><p className="text-sm text-muted">Pending Reviews</p><h3 className="text-2xl font-bold">3</h3></div>
                             </Card>
                        </div>

                        {/* Chart */}
                        <div className="lg:col-span-2">
                            <Card title="Class Engagement Trends" className="h-full min-h-[300px]">
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="active" stroke="rgb(var(--color-primary))" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Today's Schedule">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-l-2 border-l-emerald-500 bg-emerald-500/5">
                                    <div className="text-center w-16 bg-surface rounded p-1 border border-border shadow-sm">
                                        <span className="block text-xs font-bold text-muted">09:00</span>
                                        <span className="block text-xs text-muted">AM</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Physics Lecture</h4>
                                        <p className="text-sm text-muted">Class 10-A • Room 302</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-l-2 border-l-blue-500">
                                    <div className="text-center w-16 bg-surface rounded p-1 border border-border shadow-sm">
                                        <span className="block text-xs font-bold text-muted">11:30</span>
                                        <span className="block text-xs text-muted">AM</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Chemistry Lab</h4>
                                        <p className="text-sm text-muted">Class 11-B • Lab 2</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-l-2 border-l-purple-500">
                                    <div className="text-center w-16 bg-surface rounded p-1 border border-border shadow-sm">
                                        <span className="block text-xs font-bold text-muted">02:00</span>
                                        <span className="block text-xs text-muted">PM</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Staff Meeting</h4>
                                        <p className="text-sm text-muted">Conference Hall</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <Card title="Recent Activity">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><FileText className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-sm font-medium">Physics Quiz Generated</p>
                                        <span className="text-xs text-muted">2 hours ago</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-full"><Check className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-sm font-medium">Attendance Logged (10-A)</p>
                                        <span className="text-xs text-muted">4 hours ago</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full"><Bell className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-sm font-medium">Exam Schedule Updated</p>
                                        <span className="text-xs text-muted">Yesterday</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-border pb-1">
                <button onClick={() => handleNavigate('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all border-b-2 ${tab === 'dashboard' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}><BarChart3 className="w-4 h-4" /> Dashboard</button>
                <button onClick={() => handleNavigate('EXAM_CREATOR')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all border-b-2 ${tab === 'EXAM_CREATOR' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}><FileText className="w-4 h-4" /> Exam Creator</button>
                <button onClick={() => handleNavigate('CLASSROOM')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all border-b-2 ${tab === 'CLASSROOM' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}><Users className="w-4 h-4" /> Classroom</button>
                <button onClick={() => handleNavigate('PERFORMANCE')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all border-b-2 ${tab === 'PERFORMANCE' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}><TrendingUp className="w-4 h-4" /> Performance</button>
            </div>
            <div className="min-h-[600px]">{renderContent()}</div>
        </div>
    );
};