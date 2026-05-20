import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bus, Activity, BarChart3, Armchair, FileText, MapPin, Clock, Users, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    // Customer Navigation
    const customerNavItems = [
        { path: '/customer/dashboard', icon: Activity, label: 'Dashboard', description: 'Trip overview' },
        { path: '/customer/dashboard', icon: MapPin, label: 'Trip Info', description: 'Route and stops' },
        { path: '/customer/dashboard', icon: Armchair, label: 'Seat Map', description: 'View available seats' },
        { path: '/customer/dashboard', icon: Clock, label: 'Live Status', description: 'Real-time updates' },
    ];

    // Admin Navigation
    const adminNavItems = [
        { path: '/operations', icon: Activity, label: 'Operations', description: 'Real-time bus monitoring' },
        { path: '/performance', icon: BarChart3, label: 'Performance', description: 'Performance metrics' },
        { path: '/analytics', icon: Armchair, label: 'Analytics', description: 'Analytics dashboard' },
        { path: '/driver-tracker', icon: Navigation, label: 'Driver Tracker', description: 'GPS tracking for drivers' },
        { path: '/access-logs', icon: FileText, label: 'Access Logs', description: 'System access logs (Admin only)' },
    ];

    const navItems = user?.role === 'CUSTOMER' ? customerNavItems : adminNavItems;

    return (
        <aside
            style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1a1a1a', borderRight: '1px solid #404040' }}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* ── Logo ───────────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, padding: '18px 20px', borderBottom: '1px solid #404040' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            width: 30, height: 30, background: '#3b82f6',
                            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}
                        aria-hidden="true"
                    >
                        <Bus style={{ width: 15, height: 15, color: '#ffffff' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, margin: 0 }}>
                            {user?.role === 'CUSTOMER' ? 'Bus Tracker' : 'Bus Monitor'}
                        </h1>
                        <p style={{ fontSize: 10, color: '#666666', lineHeight: 1, marginTop: 2 }}>
                            {user?.role === 'CUSTOMER' ? 'Passenger View' : 'Enterprise v3.0'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Navigation ─────────────────────────────────────────── */}
            <nav
                style={{ flex: 1, overflowY: 'auto', padding: '12px' }}
                aria-label="Primary navigation"
            >
                <p style={{ padding: '0 8px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555555', userSelect: 'none' }}>
                    {user?.role === 'CUSTOMER' ? 'Passenger' : 'Management'}
                </p>

                {navItems.map((item) => (
                    <NavLink
                        key={item.path + item.label}
                        to={item.path}
                        aria-label={item.description}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                            fontSize: 13, fontWeight: 600, textDecoration: 'none',
                            transition: 'all 0.15s ease',
                            background: isActive ? '#2a2a2a' : 'transparent',
                            color: isActive ? '#ffffff' : '#808080',
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon style={{ width: 15, height: 15, flexShrink: 0, color: isActive ? '#3b82f6' : '#555555', transition: 'color 0.15s ease' }} aria-hidden="true" />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* ── Footer status chip ─────────────────────────────────── */}
            <div style={{ flexShrink: 0, padding: '12px', borderTop: '1px solid #404040' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: '#202020', border: '1px solid #404040',
                }}>
                    <span
                        style={{ position: 'relative', flexShrink: 0, width: 8, height: 8 }}
                        role="status"
                        aria-label={user?.role === 'CUSTOMER' ? 'Trip on time' : 'System operational'}
                    >
                        <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s ease-in-out infinite', opacity: 0.5 }} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.role === 'CUSTOMER' ? 'On Time' : 'All Systems Operational'}
                        </p>
                        <p style={{ fontSize: 9, color: '#555555', lineHeight: 1, marginTop: 2 }}>
                            {user?.role === 'CUSTOMER' ? 'Trip Status' : 'System Status'}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
