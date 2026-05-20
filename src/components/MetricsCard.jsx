import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

// ─── Sub-components ──────────────────────────────────────────────────────────

const TrendBadge = React.memo(({ trend, trendValue }) => {
    if (trend === 'up') {
        return (
            <span className="badge badge-success flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                {trendValue}
            </span>
        );
    }
    if (trend === 'down') {
        return (
            <span className="badge badge-danger flex-shrink-0">
                <TrendingDown className="w-3 h-3" />
                {trendValue}
            </span>
        );
    }
    return (
        <span className="badge badge-neutral flex-shrink-0">
            <Minus className="w-3 h-3" />
            {trendValue}
        </span>
    );
});
TrendBadge.displayName = 'TrendBadge';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const MetricsSkeleton = () => (
    <div className="card relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
        <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1F2937] animate-pulse" />
            <div className="w-12 h-5 rounded-lg bg-[#1F2937] animate-pulse" />
        </div>
        <div className="w-16 h-4 rounded bg-[#1F2937] animate-pulse mb-2" />
        <div className="w-24 h-8 rounded bg-[#1F2937] animate-pulse" />
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const MetricsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    accent = 'indigo',
    sparklineData = [],
    isLoading = false
}) => {
    // Memoize the accent pill colors
    const accentColors = useMemo(() => {
        const colors = {
            indigo:  'bg-indigo-500/10 text-indigo-400',
            emerald: 'bg-[#22C55E]/10 text-[#22C55E]',
            red:     'bg-[#EF4444]/10 text-[#EF4444]',
            slate:   'bg-[#1F2937] text-[#9CA3AF]'
        };
        return colors[accent] || colors.slate;
    }, [accent]);

    const sparklineColor = useMemo(() => {
        const colors = {
            indigo:  '#6366F1',
            emerald: '#22C55E',
            red:     '#EF4444',
            slate:   '#9CA3AF'
        };
        return colors[accent] || colors.slate;
    }, [accent]);

    if (isLoading) return <MetricsSkeleton />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="card flex flex-col justify-between"
        >
            {/* ── Row 1: Icon + Trend ─────────────────────────────────── */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accentColors}`}>
                    {Icon && <Icon className="w-5 h-5" />}
                </div>

                {trendValue && (
                    <TrendBadge trend={trend} trendValue={trendValue} />
                )}
            </div>

            {/* ── Row 2: Value + Title ────────────────────────────────── */}
            <div className="min-w-0 flex-1 flex flex-col justify-end">
                <p className="label truncate mb-1" title={title}>
                    {title}
                </p>
                <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-3xl stat-number truncate">
                        {value}
                    </h3>

                    {/* ── Optional Sparkline ────────────────────────────── */}
                    {sparklineData && sparklineData.length > 0 && (
                        <div className="w-20 h-8 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sparklineData}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={sparklineColor}
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(MetricsCard);
