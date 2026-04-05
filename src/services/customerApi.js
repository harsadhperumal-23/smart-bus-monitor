import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

// Create axios instance with credentials
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Customer API Service
 * All endpoints for customer/passenger users
 */

export const customerApi = {
    /**
     * Get current trip information
     */
    getTripInfo: async () => {
        const response = await api.get('/customer/trip-info');
        return response.data;
    },

    /**
     * Get seat availability count
     */
    getSeatAvailability: async () => {
        const response = await api.get('/customer/seat-availability');
        return response.data;
    },

    /**
     * Get live bus status
     */
    getLiveStatus: async () => {
        const response = await api.get('/customer/live-status');
        return response.data;
    },

    /**
     * Get read-only seat map
     */
    getSeatMap: async () => {
        const response = await api.get('/customer/seat-map');
        return response.data;
    }
};

export default customerApi;
