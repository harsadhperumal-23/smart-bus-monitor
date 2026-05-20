import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Star, Clock, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { getDriverRoster, DRIVER_ROSTER } from '../services/mockDataService';

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    on_duty: {
        label:    'On Duty',
        color:    '#22C55E',
        bg:       'rgba(34,197,94,0.1)',
        border:   'rgba(34,197,94,0.2)',
        dot:      true,   // animated pulse
    },
    on_break: {
        label:    'On Break',
        color:    '#F59E0B',
        bg:       'rgba(245,158,11,0.1)',
        border:   'rgba(245,158,11,0.2)',
        dot:      false,
    },
    offline: {
        label:    'Offline',
        color:    '#EF4444',
        bg:       'rgba(239,68,68,0.1)',
        border:   'rgba(239,68,68,0.2)',
        dot:      false,
    },
};

// ── TIME AGO ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
    if (!iso) return 'Unknown';
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 10)   return 'just now';
    if (s < 60)   return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
};

// ── STAR RATING ───────────────────────────────────────────────────────────────
const StarRating = ({ value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                size={11}
                fill={i <= Math.round(value) ? '#F59E0B' : 'transparent'}
                color={i <= Math.round(value) ? '#F59E0B' : '#374151'}
            />
        ))}
        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 2, fontWeight: 600 }}>
            {value.toFixed(1)}
        </span>
    </div>
);

// ── ONLINE INDICATOR ──────────────────────────────────────────────────────────
const OnlineIndicator = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
    return (
        <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
            {cfg.dot && (
                <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    style={{
                        position:     'absolute',
                        inset:        -3,
                        borderRadius: '50%',
                        background:   cfg.color,
                    }}
                />
            )}
            <div style={{
                width:        10,
                height:       10,
                borderRadius: '50%',
                background:   cfg.color,
                position:     'relative',
            }} />
        </div>
    );
};

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
    return (
        <span style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           5,
            fontSize:      10,
            fontWeight:    700,
            color:         cfg.color,
            background:    cfg.bg,
            border:        `1px solid ${cfg.border}`,
            padding:       '2px 8px',
            borderRadius:  20,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
        }}>
            <OnlineIndicator status={status} />
            {cfg.label}
        </span>
    );
};

// ── SINGLE DRIVER CARD ────────────────────────────────────────────────────────
const DriverCard = ({ driver, index, expanded, onToggle }) => {
    const cfg = STATUS_CONFIG[driver.status] || STATUS_CONFIG.offline;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
            transition={{ delay: index * 0.06, duration: 0.2, scale: { duration: 0.18 } }}
            className="bg-[#111827] border border-[#1F2937] rounded-xl"
            style={{ overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
            {/* ── Main row ── */}
            <div
                style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        12,
                    padding:    '12px 14px',
                    cursor:     'pointer',
                }}
                onClick={onToggle}
                id={`driver-card-${driver.id}`}
            >
                {/* Avatar */}
                <div style={{
                    width:           40,
                    height:          40,
                    borderRadius:    10,
                    background:      `${driver.avatarColor}20`,
                    border:          `1.5px solid ${driver.avatarColor}40`,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                    position:        'relative',
                }}>
                    <span style={{
                        fontSize:   12,
                        fontWeight: 800,
                        color:      driver.avatarColor,
                        letterSpacing: '0.03em',
                    }}>
                        {driver.avatarInitials}
                    </span>
                    {/* Online dot on avatar */}
                    <div style={{
                        position:     'absolute',
                        bottom:       -2,
                        right:        -2,
                        width:        10,
                        height:       10,
                        borderRadius: '50%',
                        background:   cfg.color,
                        border:       '2px solid #111827',
                    }} />
                </div>

                {/* Name + status */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize:     13,
                        fontWeight:   700,
                        color:        '#f9fafb',
                        margin:       0,
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {driver.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <StatusBadge status={driver.status} />
                    </div>
                </div>

                {/* Last active + chevron */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: 2 }}>
                        <Clock size={10} color="#4b5563" />
                        <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>
                            {timeAgo(driver.lastActive)}
                        </span>
                    </div>
                    <div style={{ color: '#4b5563', display: 'flex', justifyContent: 'flex-end' }}>
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>
            </div>

            {/* ── Expanded detail ── */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding:    '0 14px 14px',
                            borderTop:  '1px solid #1F2937',
                            paddingTop: 12,
                            display:    'flex',
                            flexDirection: 'column',
                            gap:        10,
                        }}>
                            {/* Bus + route */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 7,
                                    background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Bus size={13} color="#6366f1" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                        Assigned Bus
                                    </p>
                                    <p style={{ fontSize: 12, color: '#f9fafb', fontWeight: 700, margin: 0 }}>
                                        {driver.busId} · {driver.route}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 7,
                                    background: 'rgba(34,197,94,0.08)',
                                    border: '1px solid rgba(34,197,94,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Phone size={13} color="#22C55E" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                        Contact
                                    </p>
                                    <p style={{ fontSize: 12, color: '#f9fafb', fontWeight: 600, margin: 0 }}>
                                        {driver.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Shift + experience row */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{
                                    flex: 1,
                                    background: '#0A0A0A',
                                    border: '1px solid #1F2937',
                                    borderRadius: 8,
                                    padding: '7px 10px',
                                }}>
                                    <p style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, margin: '0 0 2px' }}>
                                        Shift
                                    </p>
                                    <p style={{ fontSize: 11, color: '#f9fafb', fontWeight: 700, margin: 0 }}>
                                        {driver.shifStart} – {driver.shiftEnd}
                                    </p>
                                </div>
                                <div style={{
                                    flex: 1,
                                    background: '#0A0A0A',
                                    border: '1px solid #1F2937',
                                    borderRadius: 8,
                                    padding: '7px 10px',
                                }}>
                                    <p style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, margin: '0 0 2px' }}>
                                        Experience
                                    </p>
                                    <p style={{ fontSize: 11, color: '#f9fafb', fontWeight: 700, margin: 0 }}>
                                        {driver.experience}
                                    </p>
                                </div>
                            </div>

                            {/* Rating */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Performance Rating
                                </span>
                                <StarRating value={driver.rating} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── DRIVER ACTIVITY CARD (LIST CONTAINER) ─────────────────────────────────────
/**
 * DriverActivityCard
 *
 * Props (all optional):
 *   drivers    – array of driver objects; defaults to getDriverRoster()
 *   refreshMs  – auto-refresh interval ms (default 5000)
 *   className  – extra class
 *   style      – extra inline style
 */
const DriverActivityCard = ({
    drivers:   driversProp,
    refreshMs = 5000,
    className = '',
    style     = {},
}) => {
    const [drivers,     setDrivers]     = useState(driversProp || DRIVER_ROSTER);
    const [expandedId,  setExpandedId]  = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // live refresh
    useEffect(() => {
        if (driversProp) return; // controlled externally
        const id = setInterval(() => {
            setDrivers(getDriverRoster());
            setLastRefresh(new Date());
        }, refreshMs);
        return () => clearInterval(id);
    }, [driversProp, refreshMs]);

    const onlineCount  = drivers.filter(d => d.status === 'on_duty').length;
    const breakCount   = drivers.filter(d => d.status === 'on_break').length;
    const offlineCount = drivers.filter(d => d.status === 'offline').length;

    const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

    return (
        <div
            id="driver-activity-card"
            className={`bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden ${className}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', ...style }}
        >
            {/* ── Header ── */}
            <div style={{
                padding:      '14px 16px 12px',
                borderBottom: '1px solid #1F2937',
                background:   '#0A0A0A',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 style={{
                        fontSize:      13,
                        fontWeight:    800,
                        color:         '#f9fafb',
                        margin:        0,
                        letterSpacing: '-0.01em',
                    }}>
                        Driver Activity
                    </h3>
                    <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>
                        {drivers.length} drivers
                    </span>
                </div>

                {/* Summary pills */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {onlineCount > 0 && (
                        <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: '#22C55E', background: 'rgba(34,197,94,0.1)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            padding: '2px 8px', borderRadius: 20,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            {onlineCount} On Duty
                        </span>
                    )}
                    {breakCount > 0 && (
                        <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: '#F59E0B', background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.2)',
                            padding: '2px 8px', borderRadius: 20,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            {breakCount} On Break
                        </span>
                    )}
                    {offlineCount > 0 && (
                        <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: '#EF4444', background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            padding: '2px 8px', borderRadius: 20,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            {offlineCount} Offline
                        </span>
                    )}
                </div>
            </div>

            {/* ── Driver list ── */}
            <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                    {drivers.map((driver, i) => (
                        <DriverCard
                            key={driver.id}
                            driver={driver}
                            index={i}
                            expanded={expandedId === driver.id}
                            onToggle={() => toggle(driver.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div style={{
                padding:        '7px 16px',
                borderTop:      '1px solid #1F2937',
                background:     '#0A0A0A',
                display:        'flex',
                alignItems:     'center',
                gap:            6,
            }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }}
                />
                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>
                    Live · updates every {refreshMs / 1000}s
                </span>
            </div>
        </div>
    );
};

export default DriverActivityCard;
