import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Activity, Wifi, Sun, Moon,
    User, Settings, ChevronDown, Clock, CheckCircle,
    AlertTriangle, XCircle, Bus, BarChart3, Armchair, FileText, Navigation,
    Bell, Shield, Zap, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentBusData } from '../services/mockDataService';
import Tooltip from './Tooltip';

const Header = React.memo(() => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const [latency, setLatency] = useState(24);
    const [systemStatus, setSystemStatus] = useState('operational');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [notifCount] = useState(3);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Navigation Items
    const adminNavItems = [
        { path: '/operations', icon: Activity, label: 'Trip Monitor' },
        { path: '/performance', icon: BarChart3, label: 'Performance' },
        { path: '/analytics', icon: Armchair, label: 'Analytics' },
        { path: '/driver-tracker', icon: Navigation, label: 'Driver Tracker' },
        { path: '/access-logs', icon: FileText, label: 'Access Logs' },
    ];

    const customerNavItems = [
        { path: '/customer/dashboard', icon: Activity, label: 'Trip View' },
    ];

    const navItems = user?.role === 'CUSTOMER' ? customerNavItems : adminNavItems;

    useEffect(() => {
        const timer = setInterval(() => setSessionTime(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const tick = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const formatSessionTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    useEffect(() => {
        const updateData = () => {
            const data = getCurrentBusData();
            setLatency(data.latency);
            setLastUpdated(new Date());
            if (data.latency > 100) setSystemStatus('critical');
            else if (data.latency > 50) setSystemStatus('degraded');
            else setSystemStatus('operational');
        };
        updateData();
        const interval = setInterval(updateData, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isDropdownOpen, isMobileMenuOpen]);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        await logout();
        navigate('/');
    };

    const getSystemStatusConfig = () => {
        switch (systemStatus) {
            case 'operational': return { color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', label: 'All Systems Live', dot: '#10b981' };
            case 'degraded': return { color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)', label: 'Degraded', dot: '#f59e0b' };
            case 'critical': return { color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', label: 'Critical', dot: '#ef4444' };
            default: return { color: '#6b7280', bgColor: 'rgba(107,114,128,0.1)', borderColor: 'rgba(107,114,128,0.2)', label: 'Unknown', dot: '#6b7280' };
        }
    };

    const statusConfig = getSystemStatusConfig();
    const userInitial = (user?.username || 'A').charAt(0).toUpperCase();

    return (
        <>
            <header
                id="main-header"
                role="banner"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 60,
                    paddingLeft: 16,
                    paddingRight: 16,
                    background: '#202020',
                    borderBottom: '1px solid #404040',
                    position: 'relative',
                    zIndex: 50,
                }}
            >
                {/* ── LEFT: Logo + Desktop Nav ─── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: '100%', minWidth: 0 }}>

                    {/* Logo Block */}
                    <div id="logo-block" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.25)', flexShrink: 0,
                        }}>
                            <Bus size={17} color="#ffffff" strokeWidth={2.2} />
                        </div>
                        <div className="hide-xs">
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, lineHeight: 1 }}>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', fontFamily: 'Inter, sans-serif' }}>SmartBus</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>FLEET OPS</span>
                            </div>
                            <div style={{ fontSize: 9.5, fontWeight: 600, color: '#666666', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>Admin Console</div>
                        </div>
                    </div>

                    {/* Divider — desktop only */}
                    <div className="hidden-mobile" style={{ width: 1, height: 26, background: '#404040', flexShrink: 0 }} />

                    {/* Desktop Navigation */}
                    <nav
                        id="main-nav"
                        className="hidden-mobile"
                        style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2, overflowX: 'auto' }}
                        aria-label="Main navigation"
                    >
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
                            >
                                <item.icon size={13} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* ── RIGHT: Status + avatar + hamburger ─── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

                    {/* Live clock — desktop only */}
                    <div id="live-clock" className="hidden-tablet" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, background: '#2a2a2a', border: '1px solid #404040' }}>
                        <Clock size={11} color="#666666" />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#a0a0a0', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.03em' }}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>

                    {/* System status chip — tablet+ */}
                    <div id="system-status-chip" className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, background: statusConfig.bgColor, border: `1px solid ${statusConfig.borderColor}`, cursor: 'default' }}>
                        <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: statusConfig.dot, opacity: 0.4, animation: 'pulse-ring 1.8s ease-in-out infinite' }} />
                            <span style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: statusConfig.dot }} />
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusConfig.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {statusConfig.label}
                        </span>
                    </div>

                    {/* Theme toggle */}
                    <button
                        id="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        style={{ width: 44, height: 44, borderRadius: 7, background: '#2a2a2a', border: '1px solid #404040', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#333333'}
                        onMouseLeave={e => e.currentTarget.style.background = '#2a2a2a'}
                    >
                        {isDark ? <Sun size={15} color="#a0a0a0" /> : <Moon size={15} color="#a0a0a0" />}
                    </button>

                    {/* Admin Avatar / Dropdown — desktop */}
                    <div id="admin-avatar-area" className="hidden-mobile" style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            id="admin-dropdown-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 8, cursor: 'pointer', background: isDropdownOpen ? '#2e2e2e' : '#2a2a2a', border: '1px solid #404040', transition: 'all 0.15s ease', minHeight: 44 }}
                            onMouseEnter={e => e.currentTarget.style.background = '#333333'}
                            onMouseLeave={e => { if (!isDropdownOpen) e.currentTarget.style.background = '#2a2a2a'; }}
                        >
                            <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(59,130,246,0.25)' }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>{userInitial}</span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{user?.username || 'Admin'}</p>
                                <p style={{ fontSize: 9, fontWeight: 600, color: '#666666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user?.role || 'ADMIN'}</p>
                            </div>
                            <ChevronDown size={12} color="#666666" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    id="admin-dropdown-menu"
                                    role="menu"
                                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 210, background: '#202020', borderRadius: 12, border: '1px solid #404040', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 60 }}
                                >
                                    <div style={{ padding: '13px 15px', background: '#252525', borderBottom: '1px solid #404040', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{userInitial}</span>
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Admin User'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                <Shield size={9} color="#3b82f6" />
                                                <span style={{ fontSize: 9.5, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.role || 'ADMIN'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '8px 15px', borderBottom: '1px solid #303030', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 10, color: '#666666', fontWeight: 500 }}>Session</span>
                                        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#a0a0a0' }}>{formatSessionTime(sessionTime)}</span>
                                    </div>
                                    <div style={{ padding: '6px 0' }}>
                                        {[
                                            { icon: User, label: 'Profile', action: () => { setIsDropdownOpen(false); navigate('/profile'); } },
                                            { icon: Settings, label: 'Settings', action: () => { setIsDropdownOpen(false); navigate('/settings'); } },
                                        ].map(({ icon: Icon, label, action }) => (
                                            <button key={label} onClick={action} role="menuitem" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#a0a0a0', transition: 'all 0.12s ease', textAlign: 'left' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#ffffff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a0a0a0'; }}>
                                                <Icon size={13} />{label}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ borderTop: '1px solid #303030', padding: '6px 0' }}>
                                        <button onClick={handleLogout} role="menuitem" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444', transition: 'all 0.12s ease', textAlign: 'left' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                            <LogOut size={13} />Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hamburger — mobile only */}
                    <button
                        id="mobile-menu-btn"
                        className="show-mobile"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Open navigation menu"
                        aria-expanded={isMobileMenuOpen}
                        style={{ width: 44, height: 44, borderRadius: 7, background: '#2a2a2a', border: '1px solid #404040', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                        {isMobileMenuOpen ? <X size={18} color="#a0a0a0" /> : <Menu size={18} color="#a0a0a0" />}
                    </button>
                </div>
            </header>

            {/* ── Mobile Drawer ─── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        id="mobile-nav-drawer"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ position: 'fixed', top: 60, left: 0, right: 0, background: '#202020', borderBottom: '1px solid #404040', zIndex: 49, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    >
                        {/* Nav links */}
                        <nav style={{ padding: '8px 12px' }} aria-label="Mobile navigation">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => isActive ? 'mobile-nav-link mobile-nav-link-active' : 'mobile-nav-link'}
                                >
                                    <item.icon size={16} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        {/* User info + logout */}
                        <div style={{ padding: '12px', borderTop: '1px solid #333' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{userInitial}</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{user?.username || 'Admin'}</p>
                                        <p style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'ADMIN'}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
                                    <LogOut size={14} />Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .nav-link {
                    display: flex; align-items: center; gap: 6px;
                    padding: 0 11px; height: 44px; border-radius: 7px;
                    font-size: 13px; font-weight: 600; color: #808080;
                    text-decoration: none; transition: all 0.15s ease;
                    white-space: nowrap; font-family: 'Inter', sans-serif;
                    border: 1px solid transparent;
                }
                .nav-link:hover { color: #ffffff; background: #2a2a2a; border-color: #404040; }
                .nav-link-active { color: #3b82f6 !important; background: rgba(59,130,246,0.1) !important; border-color: rgba(59,130,246,0.2) !important; }

                .mobile-nav-link {
                    display: flex; align-items: center; gap: 12px;
                    padding: 14px 12px; border-radius: 8px;
                    font-size: 15px; font-weight: 600; color: #a0a0a0;
                    text-decoration: none; transition: all 0.15s ease;
                    font-family: 'Inter', sans-serif; min-height: 44px;
                }
                .mobile-nav-link:hover { color: #ffffff; background: #2a2a2a; }
                .mobile-nav-link-active { color: #3b82f6; background: rgba(59,130,246,0.1); }

                @keyframes pulse-ring {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(2.2); opacity: 0; }
                }
                @media (max-width: 1024px) {
                    .hidden-tablet { display: none !important; }
                }
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                    #mobile-menu-btn { display: flex !important; }
                }
                @media (min-width: 769px) {
                    #mobile-nav-drawer { display: none !important; }
                    .hide-xs { display: block !important; }
                }
                @media (max-width: 360px) {
                    .hide-xs { display: none !important; }
                }
            `}</style>
        </>
    );
});

Header.displayName = 'Header';
export default Header;
