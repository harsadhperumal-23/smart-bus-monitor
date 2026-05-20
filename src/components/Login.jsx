import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/operations');
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } catch (error) {
            setError('Network error. Please check if the backend server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#161616', position: 'relative' }}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div style={{ position: 'absolute', top: '25%', left: '25%', width: 384, height: 384, background: 'rgba(59,130,246,0.05)', borderRadius: '50%', filter: 'blur(80px)', animation: 'pulse 4s ease-in-out infinite' }}></div>
                <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: 384, height: 384, background: 'rgba(16,185,129,0.05)', borderRadius: '50%', filter: 'blur(80px)', animation: 'pulse 4s ease-in-out infinite', animationDelay: '1.5s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                {/* Glassmorphic Login Card */}
                <div style={{ background: '#202020', border: '1px solid #404040', borderRadius: 16, padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl mb-4"
                        >
                            <Bus className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">Smart Bus Monitor</h1>
                        <p className="text-slate-400">Enterprise Dashboard v3.0</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#161616', border: '1px solid #404040', borderRadius: 8, color: '#ffffff', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s' }}
                                    placeholder="admin@bus.com"
                                    required
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#404040'}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#161616', border: '1px solid #404040', borderRadius: 8, color: '#ffffff', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s' }}
                                    placeholder="••••••••"
                                    required
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#404040'}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>

                    {/* Demo Credentials */}
                    <div style={{ marginTop: 20, padding: '12px 16px', background: '#161616', borderRadius: 8, border: '1px solid #333' }}>
                        <p className="text-xs text-slate-400 text-center">
                            <strong className="text-slate-300">Demo Credentials:</strong><br />
                            Email: admin@bus.com<br />
                            Password: password
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    © 2024 Smart Bus Monitor. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
