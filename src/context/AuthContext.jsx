import React, { createContext, useState, useContext, useEffect } from 'react';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/session`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.authenticated) {
                setUser(data.user);
                setAuthenticated(true);
            } else {
                setUser(null);
                setAuthenticated(false);
            }
        } catch (error) {
            // Backend unreachable — restore demo session if present
            const stored = localStorage.getItem('demoUser');
            if (stored && localStorage.getItem('isAuthenticated') === 'true') {
                try {
                    setUser(JSON.parse(stored));
                    setAuthenticated(true);
                } catch (_) {
                    setUser(null);
                    setAuthenticated(false);
                }
            } else {
                setUser(null);
                setAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        // ── Demo bypass (no backend required) ────────────────────────────────
        const DEMO_EMAIL    = 'admin@bus.com';
        const DEMO_PASSWORD = 'password';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setAuthenticated(true);
                // Keep localStorage for backward compatibility
                localStorage.setItem('isAuthenticated', 'true');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            // Backend unreachable — fall back to demo credentials
            if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
                const demoUser = {
                    id:    'demo-001',
                    email: DEMO_EMAIL,
                    name:  'Admin (Demo)',
                    role:  'admin',
                };
                setUser(demoUser);
                setAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('demoUser', JSON.stringify(demoUser));
                return { success: true };
            }
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
        }
    };

    const value = {
        user,
        authenticated,
        loading,
        login,
        logout,
        checkSession
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
