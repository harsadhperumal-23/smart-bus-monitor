import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, AlertCircle, Info, CheckCircle,
    X, RefreshCw, Filter, Bell, BellOff, Trash2,
    Wifi, Package, User, Clock, Bus,
} from 'lucide-react';
import { generateSmartAlerts } from '../services/mockDataService';

// ── TYPE CONFIG ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    error: {
        label:       'Error',
        icon:        AlertCircle,
        color:       '#EF4444',
        bg:          'rgba(239,68,68,0.08)',
        border:      'rgba(239,68,68,0.22)',
        badgeBg:     'rgba(239,68,68,0.15)',
        badgeText:   '#EF4444',
        dotPulse:    true,
    },
    warning: {
        label:       'Warning',
        icon:        AlertTriangle,
        color:       '#F59E0B',
        bg:          'rgba(245,158,11,0.08)',
        border:      'rgba(245,158,11,0.22)',
        badgeBg:     'rgba(245,158,11,0.15)',
        badgeText:   '#F59E0B',
        dotPulse:    false,
    },
    info: {
        label:       'Info',
        icon:        Info,
        color:       '#6366f1',
        bg:          'rgba(99,102,241,0.08)',
        border:      'rgba(99,102,241,0.22)',
        badgeBg:     'rgba(99,102,241,0.15)',
        badgeText:   '#818cf8',
        dotPulse:    false,
    },
    success: {
        label:       'Success',
        icon:        CheckCircle,
        color:       '#22C55E',
        bg:          'rgba(34,197,94,0.08)',
        border:      'rgba(34,197,94,0.22)',
        badgeBg:     'rgba(34,197,94,0.15)',
        badgeText:   '#22C55E',
        dotPulse:    false,
    },
};

const CATEGORY_ICONS = {
    connection: Wifi,
    hardware:   AlertCircle,
    safety:     AlertTriangle,
    capacity:   User,
    luggage:    Package,
    schedule:   Clock,
    driver:     User,
    passenger:  User,
    system:     Bus,
};

const FILTER_TABS = ['all', 'error', 'warning', 'info', 'success'];

// ── TIME AGO ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
    const secs = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (secs < 5)   return 'just now';
    if (secs < 60)  return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
};

// ── COUNTDOWN RING ────────────────────────────────────────────────────────────
const CountdownRing = ({ seconds, total }) => {
    const r = 9;
    const circ = 2 * Math.PI * r;
    const progress = ((total - seconds) / total) * circ;
    return (
        <svg width={24} height={24} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={12} cy={12} r={r} fill="none" stroke="#1F2937" strokeWidth={2.5} />
            <circle
                cx={12} cy={12} r={r}
                fill="none"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray={circ}
                strokeDashoffset={progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
        </svg>
    );
};

// ── ALERT CARD ────────────────────────────────────────────────────────────────
const AlertCard = React.memo(({ alert, onDismiss }) => {
    const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info;
    const Icon = cfg.icon;
    const CatIcon = CATEGORY_ICONS[alert.category] || Info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 40,  scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, scale: { duration: 0.18 } }}
            style={{
                background:   cfg.bg,
                border:       `1px solid ${cfg.border}`,
                borderRadius: 12,
                padding:      '10px 12px',
                display:      'flex',
                gap:          10,
                alignItems:   'flex-start',
                position:     'relative',
                overflow:     'hidden',
                boxShadow:    '0 2px 8px rgba(0,0,0,0.2)',
            }}
        >
            {/* Left accent strip */}
            <div style={{
                position:     'absolute',
                left:         0, top: 0, bottom: 0,
                width:        3,
                background:   cfg.color,
                borderRadius: '12px 0 0 12px',
                opacity:      0.7,
            }} />

            {/* Icon */}
            <div style={{
                width:           32, height: 32,
                borderRadius:    8,
                background:      cfg.badgeBg,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                flexShrink:      0,
                marginLeft:      6,
            }}>
                <Icon size={15} color={cfg.color} />
            </div>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Top row: type badge + bus tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                        fontSize:       10,
                        fontWeight:     700,
                        letterSpacing:  '0.07em',
                        textTransform:  'uppercase',
                        color:          cfg.badgeText,
                        background:     cfg.badgeBg,
                        padding:        '1px 7px',
                        borderRadius:   20,
                    }}>
                        {cfg.label}
                    </span>
                    {alert.busId && (
                        <span style={{
                            fontSize:       10,
                            fontWeight:     600,
                            color:          '#6b7280',
                            background:     'rgba(31,41,55,0.8)',
                            padding:        '1px 6px',
                            borderRadius:   20,
                            letterSpacing:  '0.04em',
                        }}>
                            {alert.busId}
                        </span>
                    )}

                    {/* Dismiss */}
                    <button
                        id={`alert-dismiss-${alert.id}`}
                        onClick={() => onDismiss(alert.id)}
                        style={{
                            marginLeft:     'auto',
                            background:     'transparent',
                            border:         'none',
                            cursor:         'pointer',
                            color:          '#4b5563',
                            padding:        2,
                            display:        'flex',
                            alignItems:     'center',
                            borderRadius:   4,
                            flexShrink:     0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                        aria-label="Dismiss alert"
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* Message */}
                <p style={{
                    fontSize:   12,
                    fontWeight: 600,
                    color:      '#f1f5f9',
                    lineHeight: 1.4,
                    margin:     0,
                }}>
                    {alert.message}
                </p>

                {/* Footer: category + timestamp */}
                <div style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        8,
                    marginTop:  6,
                }}>
                    <CatIcon size={11} color="#6b7280" />
                    <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {alert.category}
                    </span>
                    <span style={{ fontSize: 10, color: '#374151', marginLeft: 'auto' }}>
                        {timeAgo(alert.timestamp)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
});

AlertCard.displayName = 'AlertCard';

// ── SMART ALERTS ──────────────────────────────────────────────────────────────
const REFRESH_INTERVAL = 5; // seconds

/**
 * SmartAlerts
 *
 * Props (all optional):
 *   className  – extra class on the root div
 *   style      – extra inline style on the root div
 *   maxHeight  – max-height of the scroll list (default '420px')
 */
const SmartAlerts = ({ className = '', style = {}, maxHeight = '420px' }) => {
    const [alerts,        setAlerts]        = useState([]);
    const [dismissed,     setDismissed]     = useState(new Set());
    const [activeFilter,  setActiveFilter]  = useState('all');
    const [muted,         setMuted]         = useState(false);
    const [countdown,     setCountdown]     = useState(REFRESH_INTERVAL);
    const [refreshing,    setRefreshing]    = useState(false);
    const [newCount,      setNewCount]      = useState(0);
    const scrollRef  = useRef(null);
    const prevIds    = useRef(new Set());

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchAlerts = useCallback((manual = false) => {
        if (manual) {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 600);
        }
        const fresh = generateSmartAlerts();
        setAlerts(fresh);
        // count genuinely new IDs
        const added = fresh.filter(a => !prevIds.current.has(a.id)).length;
        if (added > 0 && !muted) setNewCount(n => n + added);
        prevIds.current = new Set(fresh.map(a => a.id));
        setCountdown(REFRESH_INTERVAL);
    }, [muted]);

    // initial load
    useEffect(() => { fetchAlerts(); }, []); // eslint-disable-line

    // auto-refresh + countdown tick
    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { fetchAlerts(); return REFRESH_INTERVAL; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [fetchAlerts]);

    // scroll to top on new alerts
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [alerts.length]);

    // ── derived ──────────────────────────────────────────────────────────────
    const visible = alerts.filter(a =>
        !dismissed.has(a.id) &&
        (activeFilter === 'all' || a.type === activeFilter)
    );

    const counts = alerts.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
    }, {});

    const handleDismiss = (id) => setDismissed(prev => new Set([...prev, id]));
    const handleClearAll = () => setDismissed(new Set(alerts.map(a => a.id)));

    return (
        <div
            id="smart-alerts-panel"
            className={className}
            style={{
                display:        'flex',
                flexDirection:  'column',
                background:     '#0F172A',
                border:         '1px solid #1F2937',
                borderRadius:   16,
                overflow:       'hidden',
                fontFamily:     'Inter, system-ui, sans-serif',
                ...style,
            }}
        >
            {/* ── HEADER ── */}
            <div style={{
                padding:        '14px 16px 12px',
                borderBottom:   '1px solid #1F2937',
                background:     '#0A0A0A',
                flexShrink:     0,
            }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bell size={15} color="#EF4444" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f9fafb', margin: 0, letterSpacing: '-0.01em' }}>
                                Smart Alerts
                            </h3>
                            <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Fleet monitoring feed
                            </p>
                        </div>
                        {newCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                    background:    '#EF4444',
                                    color:         'white',
                                    fontSize:      10,
                                    fontWeight:    800,
                                    padding:       '1px 6px',
                                    borderRadius:  20,
                                    minWidth:      18,
                                    textAlign:     'center',
                                }}
                            >
                                +{newCount}
                            </motion.span>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Countdown ring */}
                        <div
                            title={`Auto-refreshes in ${countdown}s`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => { fetchAlerts(true); setNewCount(0); }}
                        >
                            <CountdownRing seconds={countdown} total={REFRESH_INTERVAL} />
                        </div>

                        {/* Manual refresh */}
                        <button
                            id="smart-alerts-refresh"
                            onClick={() => { fetchAlerts(true); setNewCount(0); }}
                            title="Refresh now"
                            style={{
                                background: 'rgba(31,41,55,0.8)',
                                border: '1px solid #374151',
                                borderRadius: 7,
                                padding: 5,
                                cursor: 'pointer',
                                color: '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#f9fafb'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                        >
                            <motion.div
                                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            >
                                <RefreshCw size={13} />
                            </motion.div>
                        </button>

                        {/* Mute */}
                        <button
                            id="smart-alerts-mute"
                            onClick={() => setMuted(m => !m)}
                            title={muted ? 'Unmute' : 'Mute'}
                            style={{
                                background: muted ? 'rgba(239,68,68,0.15)' : 'rgba(31,41,55,0.8)',
                                border: `1px solid ${muted ? 'rgba(239,68,68,0.3)' : '#374151'}`,
                                borderRadius: 7,
                                padding: 5,
                                cursor: 'pointer',
                                color: muted ? '#EF4444' : '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.15s',
                            }}
                        >
                            {muted ? <BellOff size={13} /> : <Bell size={13} />}
                        </button>

                        {/* Clear all */}
                        <button
                            id="smart-alerts-clear"
                            onClick={handleClearAll}
                            title="Clear all"
                            style={{
                                background: 'rgba(31,41,55,0.8)',
                                border: '1px solid #374151',
                                borderRadius: 7,
                                padding: 5,
                                cursor: 'pointer',
                                color: '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* Severity counts */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {Object.entries(counts).map(([type, count]) => {
                        const cfg = TYPE_CONFIG[type];
                        if (!cfg || count === 0) return null;
                        return (
                            <span
                                key={type}
                                style={{
                                    fontSize:      10,
                                    fontWeight:    700,
                                    color:         cfg.badgeText,
                                    background:    cfg.badgeBg,
                                    border:        `1px solid ${cfg.border}`,
                                    padding:       '2px 8px',
                                    borderRadius:  20,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                {count} {cfg.label}
                            </span>
                        );
                    })}
                </div>

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 4 }}>
                    {FILTER_TABS.map(tab => {
                        const isActive = activeFilter === tab;
                        const cfg      = TYPE_CONFIG[tab];
                        return (
                            <button
                                key={tab}
                                id={`smart-alerts-filter-${tab}`}
                                onClick={() => setActiveFilter(tab)}
                                style={{
                                    fontSize:       10,
                                    fontWeight:     700,
                                    padding:        '3px 10px',
                                    borderRadius:   20,
                                    border:         `1px solid ${isActive ? (cfg?.color || '#6366f1') : '#1F2937'}`,
                                    background:     isActive ? (cfg?.badgeBg || 'rgba(99,102,241,0.15)') : 'transparent',
                                    color:          isActive ? (cfg?.color || '#818cf8') : '#6b7280',
                                    cursor:         'pointer',
                                    textTransform:  'capitalize',
                                    transition:     'all 0.15s',
                                    letterSpacing:  '0.03em',
                                }}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── ALERT LIST ── */}
            <div
                ref={scrollRef}
                style={{
                    flex:        1,
                    overflowY:   'auto',
                    maxHeight:   maxHeight,
                    padding:     '10px 12px',
                    display:     'flex',
                    flexDirection: 'column',
                    gap:         8,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#1F2937 transparent',
                }}
            >
                <AnimatePresence mode="popLayout">
                    {visible.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{    opacity: 0 }}
                            style={{
                                display:        'flex',
                                flexDirection:  'column',
                                alignItems:     'center',
                                justifyContent: 'center',
                                padding:        '36px 0',
                                gap:            10,
                            }}
                        >
                            <CheckCircle size={32} color="#1F2937" />
                            <p style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                                {activeFilter === 'all' ? 'No active alerts' : `No ${activeFilter} alerts`}
                            </p>
                        </motion.div>
                    ) : (
                        visible.map(alert => (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                onDismiss={handleDismiss}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* ── FOOTER ── */}
            <div style={{
                padding:        '8px 16px',
                borderTop:      '1px solid #1F2937',
                background:     '#0A0A0A',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                flexShrink:     0,
            }}>
                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>
                    {visible.length} of {alerts.length} alerts shown
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }}
                    />
                    <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Live
                    </span>
                    <span style={{ fontSize: 10, color: '#374151' }}>· refreshes in {countdown}s</span>
                </div>
            </div>
        </div>
    );
};

export default SmartAlerts;
