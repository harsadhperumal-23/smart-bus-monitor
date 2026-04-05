/**
 * Centralized API service for all backend communication
 */

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Authentication APIs
export const authAPI = {
    login: (email, password) =>
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    logout: () =>
        apiCall('/auth/logout', { method: 'POST' }),

    getSession: () =>
        apiCall('/auth/session')
};

// Bus APIs
export const busAPI = {
    getStatus: () =>
        apiCall('/bus/status'),

    getSeats: (busId) =>
        apiCall(`/bus/seats${busId ? `?busId=${busId}` : ''}`),

    pushSnapshot: (data) =>
        apiCall('/bus/snapshot', {
            method: 'POST',
            body: JSON.stringify(data)
        })
};

// Analytics APIs
export const analyticsAPI = {
    getAnalytics: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/analytics${queryString ? `?${queryString}` : ''}`);
    },

    getPerformance: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/analytics/performance${queryString ? `?${queryString}` : ''}`);
    },

    getAlerts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/analytics/alerts${queryString ? `?${queryString}` : ''}`);
    }
};

// Access Logs APIs (Admin only)
export const accessLogsAPI = {
    getLogs: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/access-logs${queryString ? `?${queryString}` : ''}`);
    },

    getStats: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/access-logs/stats${queryString ? `?${queryString}` : ''}`);
    },

    exportCSV: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return fetch(`${API_BASE_URL}/access-logs/export${queryString ? `?${queryString}` : ''}`, {
            credentials: 'include'
        });
    }
};

// Seed API (Development only)
export const seedAPI = {
    seedAll: () =>
        apiCall('/seed/all', { method: 'POST' })
};

export default {
    auth: authAPI,
    bus: busAPI,
    analytics: analyticsAPI,
    accessLogs: accessLogsAPI,
    seed: seedAPI
};
