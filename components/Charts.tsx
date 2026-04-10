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
    const axisColor = isDark ? '#FFFFFF' : '#000000';
    const gridColor = isDark ? '#3F3F46' : '#000000';
    const tooltipBg = isDark ? '#18181B' : '#FFFFFF';
    const tooltipColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke={axisColor} tick={{fill: axisColor, fontWeight: 'bold'}} tickLine={true} axisLine={true} />
                    <YAxis stroke={axisColor} tick={{fill: axisColor, fontWeight: 'bold'}} tickLine={true} axisLine={true} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: `2px solid ${axisColor}`, color: tooltipColor, borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} 
                        itemStyle={{ color: tooltipColor, fontWeight: 'bold' }}
                        cursor={{fill: 'rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="value" fill="rgb(var(--color-primary))" stroke="#000" strokeWidth={2} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const EnrollmentTrendChart: React.FC<ChartProps> = ({ data, theme = 'dark' }) => {
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#FFFFFF' : '#000000';
    const gridColor = isDark ? '#3F3F46' : '#000000';
    const tooltipBg = isDark ? '#18181B' : '#FFFFFF';
    const tooltipColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke={axisColor} tick={{fill: axisColor, fontWeight: 'bold'}} tickLine={true} axisLine={true} />
                    <YAxis stroke={axisColor} tick={{fill: axisColor, fontWeight: 'bold'}} tickLine={true} axisLine={true} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: `2px solid ${axisColor}`, color: tooltipColor, borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} 
                        itemStyle={{ color: tooltipColor, fontWeight: 'bold' }}
                    />
                    <Line type="stepAfter" dataKey="value" stroke="rgb(var(--color-secondary))" strokeWidth={4} dot={{r: 6, fill: 'rgb(var(--color-secondary))', stroke: '#000', strokeWidth: 2}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};