import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line 
} from 'recharts';

interface ChartProps {
    data: any[];
    theme?: 'light' | 'dark';
}

export const StudyActivityChart: React.FC<ChartProps> = ({ data, theme = 'dark' }) => {
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#A1A1AA' : '#71717A'; // Muted color
    const gridColor = isDark ? '#3F3F46' : '#E4E4E7'; // Border color
    const tooltipBg = isDark ? '#2A2A2A' : '#FFFFFF';
    const tooltipColor = isDark ? '#F0F2F5' : '#18181B';

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke={axisColor} tick={{fill: axisColor}} tickLine={false} axisLine={false} />
                    <YAxis stroke={axisColor} tick={{fill: axisColor}} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}`, color: tooltipColor, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ color: tooltipColor }}
                        cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                    />
                    <Bar dataKey="value" fill="#29ABE2" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const EnrollmentTrendChart: React.FC<ChartProps> = ({ data, theme = 'dark' }) => {
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#A1A1AA' : '#71717A';
    const gridColor = isDark ? '#3F3F46' : '#E4E4E7';
    const tooltipBg = isDark ? '#2A2A2A' : '#FFFFFF';
    const tooltipColor = isDark ? '#F0F2F5' : '#18181B';

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke={axisColor} tick={{fill: axisColor}} tickLine={false} axisLine={false} />
                    <YAxis stroke={axisColor} tick={{fill: axisColor}} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}`, color: tooltipColor, borderRadius: '8px' }} 
                        itemStyle={{ color: tooltipColor }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#39FF14" strokeWidth={3} dot={{r: 4, fill: '#39FF14'}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};