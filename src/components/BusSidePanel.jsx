import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Bus, Users, Gauge, Navigation2, MapPin, Clock, AlertTriangle,
    User, CheckCircle, WifiOff, AlertCircle,
} from 'lucide-react';

// ── STATUS CONFIG ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    online: {
        color: '#22C55E',
        bg: 'rgba(34,197,94,0.1)',
        border: 'rgba(34,197,94,0.25)',
        icon: CheckCircle,
        label: 'ONLINE',
    },
    warning: {
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.1)',
        border: 'rgba(245,158,11,0.25)',
        icon: AlertCircle,
        label: 'WARNING',
    },
    offline: {
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.1)',
        border: 'rgba(239,68,68,0.25)',
        icon: WifiOff,
        label: 'OFFLINE',
    },
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
};

// ── STAT ROW ────────────────────────────────────────────────────────────────
const StatRow = ({ icon: Icon, label, value, accent }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid rgba(31,41,55,0.8)',
    }}>
        <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: accent ? `${accent}18` : 'rgba(99,102,241,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <Icon size={15} color={accent || '#6366f1'} />
        </div>
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>
                {label}
            </p>
            <p style={{ fontSize: 14, color: '#f9fafb', fontWeight: 700 }}>
                {value}
            </p>
        </div>
    </div>
);

// ── CAPACITY BAR ────────────────────────────────────────────────────────────
const CapacityBar = ({ passengers, capacity }) => {
    const pct = Math.min(100, Math.round((passengers / capacity) * 100));
    const barColor = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#22C55E';
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Occupancy
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>
                    {passengers} / {capacity} <span style={{ color: '#6b7280', fontWeight: 400 }}>({pct}%)</span>
                </span>
            </div>
            <div style={{ background: 'rgba(31,41,55,0.8)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: barColor, borderRadius: 6 }}
                />
            </div>
        </div>
    );
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * BusSidePanel
 * Props:
 *   bus    – bus object (from MULTI_BUS_DATA / fleet snapshot)
 *   onClose – () => void
 */
const BusSidePanel = ({ bus, onClose }) => {
    const cfg = bus ? (STATUS_CONFIG[bus.status] || STATUS_CONFIG.online) : null;
    const StatusIcon = cfg?.icon;

    return (
        <AnimatePresence>
            {bus && (
                <>
                    {/* Backdrop (mobile) */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 29,
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(2px)',
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: 320,
                            zIndex: 30,
                            background: '#0F172A',
                            borderLeft: '1px solid #1F2937',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                    >
                        {/* ── HEADER ── */}
                        <div style={{
                            padding: '20px 20px 16px',
                            borderBottom: '1px solid #1F2937',
                            position: 'sticky',
                            top: 0,
                            background: '#0F172A',
                            zIndex: 1,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {/* Bus icon circle */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: cfg.bg,
                                        border: `1px solid ${cfg.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Bus size={22} color={cfg.color} />
                                    </div>
                                    <div>
                                        <h2 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 17, margin: 0 }}>
                                            {bus.busId}
                                        </h2>
                                        <p style={{ color: '#6b7280', fontSize: 12, margin: '2px 0 0', fontWeight: 500 }}>
                                            {bus.route} · <span style={{ color: '#6366f1' }}>{bus.routeCode}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Close button */}
                                <button
                                    id={`bus-panel-close-${bus.busId}`}
                                    onClick={onClose}
                                    style={{
                                        background: 'rgba(31,41,55,0.8)',
                                        border: '1px solid #374151',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        padding: 6,
                                        color: '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.color = '#f9fafb'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31,41,55,0.8)'; e.currentTarget.style.color = '#9ca3af'; }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Status badge */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 14,
                                padding: '5px 12px',
                                borderRadius: 20,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                            }}>
                                <StatusIcon size={13} color={cfg.color} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: '0.07em' }}>
                                    {cfg.label}
                                </span>
                                {bus.status === 'online' && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{
                                            width: 6, height: 6,
                                            borderRadius: '50%',
                                            background: cfg.color,
                                            display: 'inline-block',
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ── BODY ── */}
                        <div style={{ flex: 1, padding: '16px 20px 24px', overflowY: 'auto' }}>

                            {/* Capacity Bar */}
                            <CapacityBar passengers={bus.passengers} capacity={bus.capacity} />

                            {/* Stat rows */}
                            <StatRow icon={Gauge}       label="Speed"       value={`${bus.speed} km/h`} />
                            <StatRow icon={Navigation2} label="Heading"     value={bus.heading !== undefined ? `${bus.heading}°` : 'N/A'} />
                            <StatRow icon={MapPin}      label="Next Stop"   value={bus.nextStop || '—'} />
                            <StatRow icon={Clock}       label="ETA"         value={bus.eta || '—'} accent="#6366f1" />
                            <StatRow
                                icon={User}
                                label="Driver"
                                value={bus.driver?.name || 'Unassigned'}
                                accent="#22C55E"
                            />
                            <StatRow
                                icon={Clock}
                                label="Last Updated"
                                value={getTimeAgo(bus.lastUpdated)}
                                accent={bus.status === 'offline' ? '#EF4444' : '#22C55E'}
                            />

                            {/* Alerts */}
                            {bus.alerts && bus.alerts.length > 0 && (
                                <div style={{ marginTop: 20 }}>
                                    <p style={{
                                        fontSize: 10, color: '#6b7280', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.07em',
                                        marginBottom: 10,
                                    }}>
                                        Active Alerts
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {bus.alerts.map((alert) => (
                                            <motion.div
                                                key={alert.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{
                                                    background: alert.severity === 'critical'
                                                        ? 'rgba(239,68,68,0.1)'
                                                        : 'rgba(245,158,11,0.1)',
                                                    border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                                    borderRadius: 10,
                                                    padding: '10px 12px',
                                                    display: 'flex',
                                                    gap: 10,
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <AlertTriangle
                                                    size={15}
                                                    color={alert.severity === 'critical' ? '#EF4444' : '#F59E0B'}
                                                    style={{ flexShrink: 0, marginTop: 1 }}
                                                />
                                                <div>
                                                    <p style={{ fontSize: 12, color: '#f9fafb', fontWeight: 600, margin: 0 }}>
                                                        {alert.message}
                                                    </p>
                                                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '3px 0 0' }}>
                                                        {alert.timestamp}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* GPS coords */}
                            <div style={{
                                marginTop: 20,
                                padding: '10px 14px',
                                background: 'rgba(17,24,39,0.8)',
                                border: '1px solid #1F2937',
                                borderRadius: 10,
                            }}>
                                <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                    GPS Coordinates
                                </p>
                                <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', margin: 0 }}>
                                    {bus.gpsLocation.lat.toFixed(5)}, {bus.gpsLocation.lng.toFixed(5)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BusSidePanel;
