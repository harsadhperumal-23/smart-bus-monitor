import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    TrendingUp, TrendingDown, Minus,
    Users, BarChart2, UserCheck, AlertTriangle,
    Package, Bus, Activity, RefreshCw, Zap,
} from 'lucide-react';
import { generateAIInsights } from '../services/mockDataService';

// ── Icon resolver ──────────────────────────────────────────────────────────────
const ICON_MAP = {
    Users,
    TrendingUp,
    TrendingDown,
    BarChart2,
    UserCheck,
    AlertTriangle,
    Package,
    Bus,
    Activity,
    Zap,
};

// ── Category config (color only — no gradients) ────────────────────────────────
const CATEGORY_CONFIG = {
    Occupancy:  { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.2)'  },
    Efficiency: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)'   },
    Fleet:      { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.2)'  },
    Driver:     { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)'   },
    Alert:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'  },
    Safety:     { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)'   },
    Capacity:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'  },
    System:     { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)'   },
};

const FALLBACK_CONFIG = { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' };

// ── Trend indicator ────────────────────────────────────────────────────────────
const TrendBadge = ({ trend }) => {
    if (trend === 'up')      return <TrendingUp  size={12} color="#22C55E" />;
    if (trend === 'down')    return <TrendingDown size={12} color="#EF4444" />;
    return <Minus size={12} color="#6b7280" />;
};

// ── Single insight card ────────────────────────────────────────────────────────
const InsightCard = ({ insight, index }) => {
    const cfg    = CATEGORY_CONFIG[insight.category] || FALLBACK_CONFIG;
    const Icon   = ICON_MAP[insight.icon] || Activity;

    return (
        <motion.div
            layout
            key={insight.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -6 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
            transition={{ delay: index * 0.05, duration: 0.22, ease: 'easeOut', scale: { duration: 0.18 } }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#202020', border: '1px solid #404040', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', cursor: 'default' }}
        >
            {/* Icon bubble */}
            <div style={{
                width:           36,
                height:          36,
                borderRadius:    9,
                background:      cfg.bg,
                border:          `1px solid ${cfg.border}`,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                flexShrink:      0,
            }}>
                <Icon size={16} color={cfg.color} />
            </div>

            {/* Text body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Category + metric row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{
                        fontSize:       10,
                        fontWeight:     700,
                        color:          cfg.color,
                        textTransform:  'uppercase',
                        letterSpacing:  '0.07em',
                    }}>
                        {insight.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TrendBadge trend={insight.trend} />
                        <span style={{
                            fontSize:   12,
                            fontWeight: 800,
                            color:      insight.trend === 'up'
                                ? '#22C55E'
                                : insight.trend === 'down'
                                    ? '#EF4444'
                                    : '#6b7280',
                            letterSpacing: '-0.01em',
                        }}>
                            {insight.metric}
                        </span>
                    </div>
                </div>

                {/* Message */}
                <p style={{
                    fontSize:   13,
                    fontWeight: 500,
                    color:      '#d1d5db',
                    lineHeight: 1.5,
                    margin:     0,
                }}>
                    {insight.message}
                </p>
            </div>
        </motion.div>
    );
};

// ── AIInsightsPanel ────────────────────────────────────────────────────────────
/**
 * AIInsightsPanel
 *
 * Props (all optional):
 *   className  – additional class on wrapper
 *   style      – additional inline style on wrapper
 *   refreshMs  – auto-refresh interval in ms (default 5000)
 *   title      – panel title (default 'AI Insights')
 */
const AIInsightsPanel = ({
    className = '',
    style     = {},
    refreshMs = 5000,
    title     = 'AI Insights',
}) => {
    const [insights,   setInsights]   = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [spinning,   setSpinning]   = useState(false);

    const refresh = (manual = false) => {
        if (manual) {
            setSpinning(true);
            setTimeout(() => setSpinning(false), 500);
        }
        setInsights(generateAIInsights());
        setLastUpdate(new Date());
    };

    // initial load
    useEffect(() => { refresh(); }, []); // eslint-disable-line

    // auto-refresh
    useEffect(() => {
        const id = setInterval(() => refresh(), refreshMs);
        return () => clearInterval(id);
    }, [refreshMs]); // eslint-disable-line

    const timeAgo = (date) => {
        if (!date) return '';
        const s = Math.floor((Date.now() - date) / 1000);
        if (s < 5)  return 'just now';
        if (s < 60) return `${s}s ago`;
        return `${Math.floor(s / 60)}m ago`;
    };

    return (
        <div
            id="ai-insights-panel"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#202020', border: '1px solid #404040', borderRadius: 12, overflow: 'hidden', ...style }}
        >
            {/* ── Header ── */}
            <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '14px 16px 12px',
                borderBottom:   '1px solid #404040',
                background:     '#1a1a1a',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Icon */}
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={15} color="#818cf8" />
                    </div>

                    <div>
                        <h3 style={{
                            fontSize:      13,
                            fontWeight:    800,
                            color:         '#f9fafb',
                            margin:        0,
                            letterSpacing: '-0.01em',
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            fontSize:      10,
                            color:         '#4b5563',
                            margin:        '1px 0 0',
                            fontWeight:    600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            {insights.length} insight{insights.length !== 1 ? 's' : ''} · updated {timeAgo(lastUpdate)}
                        </p>
                    </div>
                </div>

                {/* Refresh button */}
                <button
                    id="ai-insights-refresh"
                    onClick={() => refresh(true)}
                    title="Refresh insights"
                    style={{
                        background:     '#2a2a2a',
                        border:         '1px solid #404040',
                        borderRadius:   7,
                        padding:        6,
                        cursor:         'pointer',
                        color:          '#808080',
                        display:        'flex',
                        alignItems:     'center',
                        transition:     'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                    <motion.div
                        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                    >
                        <RefreshCw size={13} />
                    </motion.div>
                </button>
            </div>

            {/* ── Card list ── */}
            <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence mode="popLayout">
                    {insights.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign:  'center',
                                padding:    '28px 0',
                                color:      '#374151',
                                fontSize:   13,
                                fontWeight: 600,
                            }}
                        >
                            Loading insights…
                        </motion.div>
                    ) : (
                        insights.map((insight, i) => (
                            <InsightCard key={insight.id} insight={insight} index={i} />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div style={{
                padding:        '8px 16px',
                borderTop:      '1px solid #404040',
                background:     '#1a1a1a',
                display:        'flex',
                alignItems:     'center',
                gap:            6,
            }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }}
                />
                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>
                    Powered by fleet telemetry · auto-refreshes every {refreshMs / 1000}s
                </span>
            </div>
        </div>
    );
};

export default AIInsightsPanel;
