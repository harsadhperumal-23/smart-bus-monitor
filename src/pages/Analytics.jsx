import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { getOnTimePerformanceData, getRouteData } from '../services/mockDataService';
import AIInsightsPanel from '../components/AIInsightsPanel';

// Shared chart tooltip style
const TOOLTIP_STYLE = {
    contentStyle: { backgroundColor: '#202020', border: '1px solid #404040', borderRadius: '10px', color: '#fff' },
    labelStyle:   { color: '#a0a0a0' },
    cursor:       { fill: 'rgba(255,255,255,0.02)' },
};

const Analytics = () => {
    const [performanceData, setPerformanceData] = useState([]);
    const [routeData, setRouteData] = useState([]);

    useEffect(() => {
        setPerformanceData(getOnTimePerformanceData());
        setRouteData(getRouteData());
    }, []);

    return (
        <div className="h-full overflow-y-auto space-y-4 md:space-y-6 max-w-[1600px] mx-auto w-full px-3 sm:px-6 pb-8 pt-4 md:pt-6" id="main-content">

            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
                    <p style={{ color: '#9CA3AF' }} className="text-sm">Performance insights and trends</p>
                </div>
            </div>

            {/* AI Insights */}
            <AIInsightsPanel title="AI-Generated Insights" refreshMs={5000} />

            {/* Charts — 1 col mobile, 2 col large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* On-Time Performance */}
                <div className="card">
                    <h2 className="text-base font-semibold text-white mb-4">
                        24-Hour On-Time Performance
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                            <XAxis dataKey="hour" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip {...TOOLTIP_STYLE} />
                            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                            <Line type="monotone" dataKey="performance" stroke="#6366F1" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Route Performance */}
                <div className="card">
                    <h2 className="text-base font-semibold text-white mb-4">
                        Route Performance Comparison
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={routeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                            <XAxis dataKey="route" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip {...TOOLTIP_STYLE} />
                            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                            <Bar dataKey="efficiency" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revenue"    fill="#22C55E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
