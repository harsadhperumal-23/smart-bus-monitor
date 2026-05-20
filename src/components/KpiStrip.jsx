import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, BarChart2, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getFleetSnapshot, MULTI_BUS_DATA } from '../services/mockDataService';

// ── KPI card config ──────────────────────────────────────────────────────────
const CARDS = [
    {
        id: 'active-buses',
        label: 'Active Buses',
        icon: Bus,
        accentLight: 'rgba(59,130,246,0.1)',
        accentBorder: 'rgba(59,130,246,0.2)',
        accentIcon: '#3b82f6',
        getValue: (buses) => {
            const active = buses.filter(b => b.status === 'online' || b.status === 'warning').length;
            return {
                value: active,
                sub: `of ${buses.length} total fleet`,
                trend: 'up',
                trendLabel: '+0 since last hour',
            };
        },
    },
    {
        id: 'total-passengers',
        label: 'Total Passengers',
        icon: Users,
        accentLight: 'rgba(16,185,129,0.1)',
        accentBorder: 'rgba(16,185,129,0.2)',
        accentIcon: '#10b981',
        getValue: (buses) => {
            const total = buses.reduce((s, b) => s + b.passengers, 0);
            const cap   = buses.reduce((s, b) => s + b.capacity, 0);
            return {
                value: total,
                sub: `of ${cap} total seats`,
                trend: 'up',
                trendLabel: 'Live count',
            };
        },
    },
    {
        id: 'avg-occupancy',
        label: 'Avg Occupancy',
        icon: BarChart2,
        accentLight: 'rgba(245,158,11,0.1)',
        accentBorder: 'rgba(245,158,11,0.2)',
        accentIcon: '#f59e0b',
        getValue: (buses) => {
            if (!buses.length) return { value: '0%', sub: 'no data', trend: 'neutral', trendLabel: '-' };
            const avg = Math.round(
                buses.reduce((s, b) => s + (b.passengers / b.capacity) * 100, 0) / buses.length
            );
            const valueColor = avg > 90 ? '#ef4444' : avg > 70 ? '#f59e0b' : '#10b981';
            return {
                value: `${avg}%`,
                sub: 'fleet average load',
                trend: avg > 70 ? 'down' : 'up',
                trendLabel: avg > 90 ? 'Near full' : avg > 70 ? 'High load' : 'Normal',
                valueColor,
            };
        },
    },
    {
        id: 'delay-percent',
        label: 'Delay %',
        icon: Clock,
        accentLight: 'rgba(239,68,68,0.1)',
        accentBorder: 'rgba(239,68,68,0.2)',
        accentIcon: '#ef4444',
        getValue: (buses) => {
            const delayed = buses.filter(b => b.status === 'offline').length;
            const pct = buses.length ? Math.round((delayed / buses.length) * 100) : 0;
            return {
                value: `${pct}%`,
                sub: `${delayed} bus${delayed !== 1 ? 'es' : ''} delayed`,
                trend: pct > 20 ? 'down' : 'neutral',
                trendLabel: pct > 20 ? 'Above threshold' : 'On target',
            };
        },
    },
];

// ── Trend icon ───────────────────────────────────────────────────────────────
const TrendIcon = ({ trend }) => {
    if (trend === 'up')
        return <TrendingUp size={11} color="#10b981" strokeWidth={2.5} />;
    if (trend === 'down')
        return <TrendingDown size={11} color="#ef4444" strokeWidth={2.5} />;
    return <Minus size={11} color="#666666" strokeWidth={2.5} />;
};

// ── Animated number helper ───────────────────────────────────────────────────
const AnimatedValue = ({ value }) => (
    <motion.span
        key={value}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ display: 'inline-block' }}
    >
        {value}
    </motion.span>
);

// ── Progress bar sub-component ───────────────────────────────────────────────
const MiniBar = ({ pct = 0, color }) => (
    <div style={{
        height: 2, borderRadius: 2, background: '#2a2a2a',
        overflow: 'hidden', marginTop: 10,
    }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 2, background: color }}
        />
    </div>
);

// ── KpiStrip ─────────────────────────────────────────────────────────────────
const KpiStrip = () => {
    const [buses, setBuses] = useState(MULTI_BUS_DATA);

    useEffect(() => {
        const id = setInterval(() => setBuses(getFleetSnapshot()), 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div
            id="kpi-strip"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0,
                background: '#202020',
                borderBottom: '1px solid #404040',
            }}
        >
            {CARDS.map((card, i) => {
                const { value, sub, trend, trendLabel, valueColor } = card.getValue(buses);
                const Icon = card.icon;

                // derive numeric pct for mini progress bar
                const numericVal = parseFloat(String(value).replace('%', ''));
                const isPercent = String(value).includes('%');
                const barPct = isPercent ? numericVal : (numericVal / 10) * 100;

                return (
                    <motion.div
                        key={card.id}
                        id={`kpi-card-${card.id}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: i * 0.07,
                            duration: 0.25,
                        }}
                        style={{
                            padding: '13px 18px',
                            background: '#202020',
                            borderRight: i < CARDS.length - 1 ? '1px solid #404040' : 'none',
                            cursor: 'default',
                            position: 'relative',
                            transition: 'background 0.15s ease',
                        }}
                        whileHover={{ background: '#252525' }}
                    >
                        {/* Top row: icon bubble + label */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 7,
                                    background: card.accentLight,
                                    border: `1px solid ${card.accentBorder}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Icon size={13} color={card.accentIcon} strokeWidth={2.2} />
                                </div>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, color: '#666666',
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                    fontFamily: 'Inter, sans-serif',
                                }}>
                                    {card.label}
                                </span>
                            </div>

                            {/* Trend chip */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                padding: '2px 6px', borderRadius: 5,
                                background: trend === 'up'
                                    ? 'rgba(16,185,129,0.1)'
                                    : trend === 'down'
                                        ? 'rgba(239,68,68,0.1)'
                                        : 'rgba(102,102,102,0.1)',
                            }}>
                                <TrendIcon trend={trend} />
                                <span style={{
                                    fontSize: 9.5, fontWeight: 600,
                                    color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#666666',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {trendLabel}
                                </span>
                            </div>
                        </div>

                        {/* Big value */}
                        <p style={{
                            fontSize: 24, fontWeight: 800,
                            color: valueColor || '#ffffff',
                            lineHeight: 1.1, letterSpacing: '-0.03em',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            <AnimatedValue value={value} />
                        </p>

                        {/* Sub label */}
                        <p style={{
                            fontSize: 11, color: '#666666', fontWeight: 500, marginTop: 2,
                        }}>
                            {sub}
                        </p>

                        {/* Mini progress bar */}
                        <MiniBar pct={barPct} color={card.accentIcon} />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default KpiStrip;
