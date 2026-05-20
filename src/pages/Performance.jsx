import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const TOOLTIP_STYLE = {
    contentStyle: { backgroundColor: '#202020', border: '1px solid #404040', borderRadius: '10px', color: '#fff' },
    labelStyle:   { color: '#a0a0a0' },
    cursor:       { fill: 'rgba(255,255,255,0.02)' },
};

const Performance = () => {
    const [performanceData] = useState([
        { time: '6:00',  onTime: 95, delayed: 5  },
        { time: '9:00',  onTime: 88, delayed: 12 },
        { time: '12:00', onTime: 92, delayed: 8  },
        { time: '15:00', onTime: 85, delayed: 15 },
        { time: '18:00', onTime: 78, delayed: 22 },
        { time: '21:00', onTime: 90, delayed: 10 },
    ]);

    const stats = [
        { label: 'On-Time Rate',     value: '89%',   icon: CheckCircle, color: 'text-[#22C55E]', iconBg: 'bg-[#22C55E]/10' },
        { label: 'Avg Delay',        value: '8 min',  icon: Clock,       color: 'text-[#6366F1]',  iconBg: 'bg-[#6366F1]/10'  },
        { label: 'Fleet Efficiency', value: '94%',    icon: Activity,    color: 'text-[#6366F1]',    iconBg: 'bg-[#6366F1]/10'    },
        { label: 'Daily Trend',      value: '+5.2%',  icon: TrendingUp,  color: 'text-[#22C55E]', iconBg: 'bg-[#22C55E]/10' },
    ];

    return (
        <div className="h-full overflow-y-auto pt-6 space-y-6">

            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Performance Metrics</h1>
                <p style={{ color: '#9CA3AF' }}>Track fleet performance and efficiency</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>{stat.label}</p>
                            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Chart */}
            <div className="card">
                <h2 className="text-base font-semibold text-white mb-5">
                    Daily Performance Trend
                </h2>
                <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={performanceData}>
                        <defs>
                            <linearGradient id="onTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="delayed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                        <XAxis dataKey="time"  stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis                 stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                        <Area type="monotone" dataKey="onTime"  stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#onTime)" />
                        <Area type="monotone" dataKey="delayed" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#delayed)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default Performance;
