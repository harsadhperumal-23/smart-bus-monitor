import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, Filter, Search, Calendar,
    User, Activity, Globe, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { accessLogsAPI } from '../services/api';

const AccessLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await accessLogsAPI.getLogs(filters);
            setLogs(response.data.logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await accessLogsAPI.getStats({ days: 7 });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleExport = async () => {
        try {
            const response = await accessLogsAPI.exportCSV(filters);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting logs:', error);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('LOGIN')) return 'text-green-400 bg-green-500/10';
        if (action.includes('LOGOUT')) return 'text-red-400 bg-red-500/10';
        if (action.includes('VIEW')) return 'text-blue-400 bg-blue-500/10';
        return 'text-slate-400 bg-slate-500/10';
    };

    const getRoleColor = (role) => {
        if (role === 'ADMIN') return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        if (role === 'VIEWER') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="card p-8 text-center max-w-md">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p style={{ color: '#9CA3AF' }}>Only administrators can view access logs.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto space-y-6 max-w-[1600px] mx-auto w-full px-2 sm:px-6 pb-8 pt-6" id="main-content">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-2xl font-bold text-white mb-1">Access Logs</h1>
                <p style={{ color: '#9CA3AF' }}>Monitor all system access and user activities</p>
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
            >
                <Download className="w-4 h-4" />
                Export CSV
            </motion.button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl flex-shrink-0">
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Total Requests</p>
                            <p className="text-2xl font-bold font-mono text-white">{stats.totalRequests}</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl flex-shrink-0">
                            <User className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Unique Users</p>
                            <p className="text-2xl font-bold font-mono text-white">{stats.uniqueUsers}</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-3 bg-[#22C55E]/10 rounded-xl flex-shrink-0">
                            <Clock className="w-6 h-6 text-[#22C55E]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Period</p>
                            <p className="text-2xl font-bold font-mono text-white">{stats.period}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Action</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                            className="input"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="VIEW_BUS_STATUS">View Bus Status</option>
                            <option value="VIEW_SEATS">View Seats</option>
                            <option value="VIEW_ANALYTICS">View Analytics</option>
                            <option value="VIEW_ACCESS_LOGS">View Access Logs</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Start Date</label>
                        <input type="date" value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                            className="input" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>End Date</label>
                        <input type="date" value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                            className="input" />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ action: '', startDate: '', endDate: '', page: 1, limit: 20 })}
                            className="btn-ghost w-full"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-[#404040]" style={{ backgroundColor: '#1a1a1a' }}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Route
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    IP Address
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                        No logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <motion.tr
                                        key={log._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-[#2a2a2a] transition-colors duration-200"
                                    >
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-white font-medium">
                                            {log.username}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${getRoleColor(log.role)}`}>
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                                            {log.route}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                                            {log.ipAddress}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${log.statusCode >= 200 && log.statusCode < 300
                                                    ? 'text-green-400 bg-green-500/10'
                                                    : 'text-red-400 bg-red-500/10'
                                                }`}>
                                                {log.statusCode >= 200 && log.statusCode < 300 ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {log.statusCode}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.length > 0 && (
                    <div className="px-5 py-3 border-t border-[#404040] flex items-center justify-between" style={{ backgroundColor: '#1a1a1a' }}>
                        <div className="text-sm" style={{ color: '#9CA3AF' }}>Showing page {filters.page}</div>
                        <div className="flex gap-2">
                            <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1}
                                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={logs.length < filters.limit}
                                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessLogs;
