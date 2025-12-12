import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Card, Button, Select } from './ui/Components';
import { GeminiService } from '../services/geminiService';
import { translations } from '../utils/translations';

const CodePlayground: React.FC<{ lang: string }> = ({ lang }) => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang] || translations['en'];

  const handleRun = async () => {
    setLoading(true);
    try {
      const result = await GeminiService.runCode(code, language);
      setOutput(result);
    } catch (e) {
      setOutput('Error executing code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:h-[600px]">
      <Card className="flex flex-col p-0 overflow-hidden border-border bg-[#1e1e1e] h-[400px] lg:h-full">
        <div className="flex items-center justify-between p-3 border-b border-border bg-surface">
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-muted">{t.editor}</span>
                <div className="w-32">
                    <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="py-1 text-sm">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="cpp">C++</option>
                    </Select>
                </div>
            </div>
            <Button size="sm" onClick={handleRun} loading={loading} className="py-1 px-3 text-xs">
                <Play className="w-3 h-3 mr-1" /> {t.run}
            </Button>
        </div>
        <textarea 
            className="flex-1 w-full bg-[#1e1e1e] text-gray-300 font-mono p-4 resize-none focus:outline-none text-sm leading-relaxed"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
        />
      </Card>

      <Card className="flex flex-col p-0 overflow-hidden border-border bg-black/40 h-[300px] lg:h-full">
        <div className="flex items-center justify-between p-3 border-b border-border bg-surface/50">
            <span className="text-sm font-semibold text-muted">{t.output}</span>
            <Button variant="ghost" onClick={() => setOutput('')} className="py-1 px-2 text-xs">
                <RotateCcw className="w-3 h-3" />
            </Button>
        </div>
        <div className="flex-1 p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-y-auto">
            {output || <span className="text-gray-600 italic">// Output will appear here...</span>}
        </div>
      </Card>
    </div>
  );
};

export default CodePlayground;