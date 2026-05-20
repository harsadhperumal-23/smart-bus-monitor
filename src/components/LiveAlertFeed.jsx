import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, User, Package, AlertCircle, Info, AlertOctagon } from 'lucide-react';

const LiveAlertFeed = ({ alerts }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [alerts]);

    const getSeverity = (alert) => {
        if (alert.severity) {
            if (alert.severity === 'critical') return 'HIGH';
            if (alert.severity === 'warning') return 'MEDIUM';
            if (alert.severity === 'info') return 'LOW';
            return alert.severity.toUpperCase();
        }

        const message = alert.message?.toLowerCase() || '';
        const type = alert.type?.toLowerCase() || '';

        if (message.includes('critical') || message.includes('emergency') || message.includes('mismatch') || type === 'critical') {
            return 'HIGH';
        }
        if (message.includes('warning') || message.includes('alert') || type === 'luggage' || type === 'warning') {
            return 'MEDIUM';
        }
        return 'LOW';
    };

    const getSeverityConfig = (severity) => {
        switch (severity) {
            case 'HIGH':
                return {
                    icon: AlertOctagon,
                    iconColor: 'text-[#EF4444]',
                    bgColor: 'bg-[#EF4444]/10',
                    borderColor: 'border-[#EF4444]',
                    badgeColor: 'bg-[#EF4444] text-white',
                    label: 'HIGH'
                };
            case 'MEDIUM':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/30',
                    badgeColor: 'bg-yellow-500 text-slate-900',
                    label: 'MEDIUM'
                };
            case 'LOW':
            default:
                return {
                    icon: Info,
                    iconColor: 'text-blue-400',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/30',
                    badgeColor: 'bg-blue-500 text-white',
                    label: 'LOW'
                };
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'luggage': return Package;
            case 'passenger': return User;
            default: return AlertCircle;
        }
    };

    const severityCounts = alerts.reduce((acc, alert) => {
        const severity = getSeverity(alert);
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="card !p-0 h-full flex flex-col" role="region">
            <div className="flex items-center justify-between mb-0 p-4 border-b border-[#1F2937] bg-[#0A0A0A]">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 tracking-wide uppercase text-sm">Smart Alerts</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {severityCounts.HIGH > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 font-bold uppercase">{severityCounts.HIGH} High</span>}
                        {severityCounts.MEDIUM > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase">{severityCounts.MEDIUM} Medium</span>}
                        {severityCounts.LOW > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 font-bold uppercase">{severityCounts.LOW} Low</span>}
                    </div>
                </div>
                <div className="flex bg-[#111827] px-3 py-1.5 rounded-full border border-[#1F2937] items-center gap-2">
                    <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-ping absolute" />
                    <div className="w-2 h-2 bg-[#22C55E] rounded-full relative" />
                    <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin scrollbar-thumb-[#374151]">
                <AnimatePresence mode="popLayout">
                    {alerts.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-500 py-8">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-semibold">No active alerts</p>
                        </motion.div>
                    ) : (
                        alerts.map((alert) => {
                            const severity = getSeverity(alert);
                            const config = getSeverityConfig(severity);
                            const Icon = config.icon;
                            const TypeIcon = getAlertIcon(alert.type);

                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} cursor-pointer`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-2 rounded-lg bg-slate-900/50 ${config.iconColor}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-sm text-white font-bold leading-tight">
                                                    {alert.message}
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.badgeColor} font-black tracking-widest flex-shrink-0`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-2">
                                                <TypeIcon className="w-3 h-3" />
                                                <span>{alert.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveAlertFeed;

