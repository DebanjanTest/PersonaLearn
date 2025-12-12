import React from 'react';
import { Building2, TrendingUp, Users } from 'lucide-react';
import { Card } from '../components/ui/Components';
import { EnrollmentTrendChart } from '../components/Charts';
import { translations } from '../utils/translations';

export const InstitutionDashboard: React.FC<{ lang: string; theme?: 'light' | 'dark' }> = ({ lang, theme = 'dark' }) => {
    const t = translations[lang] || translations['en'];

    const trendData = [
        { name: '2020', value: 1200 }, { name: '2021', value: 1350 },
        { name: '2022', value: 1280 }, { name: '2023', value: 1500 },
        { name: '2024', value: 1650 }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Card className="flex items-center gap-4 bg-gradient-to-br from-purple-900/40 to-surface border-purple-500/20 hover:scale-[1.02] transition-transform">
                    <div className="p-3 bg-white/10 text-white rounded-xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted/80">{t.totalEnrollment}</p>
                        <h3 className="text-2xl font-bold text-text">1,650</h3>
                    </div>
                </Card>
                 <Card className="flex items-center gap-4 bg-gradient-to-br from-blue-900/40 to-surface border-blue-500/20 hover:scale-[1.02] transition-transform">
                    <div className="p-3 bg-white/10 text-white rounded-xl">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted/80">{t.activeDepartments}</p>
                        <h3 className="text-2xl font-bold text-text">12</h3>
                    </div>
                </Card>
                 <Card className="flex items-center gap-4 bg-gradient-to-br from-green-900/40 to-surface border-green-500/20 hover:scale-[1.02] transition-transform">
                    <div className="p-3 bg-white/10 text-white rounded-xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted/80">{t.avgGPA}</p>
                        <h3 className="text-2xl font-bold text-text">3.45</h3>
                    </div>
                </Card>
            </div>

            <Card title={t.enrollmentTrends}>
                <EnrollmentTrendChart data={trendData} theme={theme} />
            </Card>

            <Card title={t.systemActivities}>
                <div className="space-y-0 divider-y divide-border">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex justify-between py-3 border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                            <div>
                                <p className="text-sm font-medium text-text">{t.examScheduled} Physics 101</p>
                                <p className="text-xs text-muted">{t.prof} John Doe • Engineering {t.dept}</p>
                            </div>
                            <span className="text-xs text-muted">2 hours {t.ago}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};