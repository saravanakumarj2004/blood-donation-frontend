import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authAPI = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login/', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register/', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    updateProfile: async (userId, data) => {
        const response = await api.post('/profile/update/', { userId, data });
        return response.data;
    }
};

export const donorAPI = {
    getStats: async (userId) => {
        const response = await api.get(`/donor/stats/?userId=${userId}`);
        return response.data;
    },
    getHistory: async (userId) => {
        const response = await api.get(`/donor/history/?userId=${userId}`);
        return response.data;
    },
    donate: async (data) => {
        const response = await api.post('/donor/history/', data);
        return response.data;
    },
    getUrgentRequests: async () => {
        const response = await api.get('/donor/active-requests/');
        return response.data;
    },
    getHospitals: async () => {
        const response = await api.get('/donor/hospitals/');
        return response.data;
    },
    respondToAlert: async (data) => {
        const response = await api.post('/donor/respond-alert/', data);
        return response.data;
    },
    getNotifications: async (userId) => {
        const response = await api.get(`/notifications/?userId=${userId}`);
        return response.data;
    },
    updateNotificationStatus: async (id, status) => {
        const response = await api.put('/notifications/', { id, status });
        return response.data;
    }
};

export const adminAPI = {
    getStats: async () => {
        const response = await api.get('/admin/stats/');
        return response.data;
    },
    getUsers: async (role) => {
        const response = await api.get(`/admin/users/?role=${role}`);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/?id=${id}`);
        return response.data;
    },
    getAlerts: async () => {
        const response = await api.get('/admin/alerts/');
        return response.data;
    },
    searchDonors: async (bloodGroup, eligibleOnly = false) => {
        let url = `/admin/search-donors/?bloodGroup=${encodeURIComponent(bloodGroup || '')}`;
        if (eligibleOnly) url += '&eligibleOnly=true';
        const response = await api.get(url);
        return response.data;
    },
    getGlobalInventory: async () => {
        const response = await api.get('/admin/inventory/');
        return response.data;
    },
    notifyDonors: async (notifications) => {
        const response = await api.post('/notifications/', { notifications });
        return response.data;
    },
    getDonationHistory: async () => {
        const response = await api.get('/admin/history/');
        return response.data;
    },
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics/');
        return response.data;
    }
};

export const hospitalAPI = {
    getInventory: async (userId) => {
        const response = await api.get(`/hospital/inventory/?userId=${userId}`);
        return response.data;
    },
    updateInventory: async (data) => {
        const response = await api.post('/hospital/inventory/', data);
        return response.data;
    },
    getRequests: async (userId) => {
        const response = await api.get(`/hospital/requests/?userId=${userId}`);
        return response.data;
    },
    createRequest: async (data) => {
        const response = await api.post('/hospital/requests/', data);
        return response.data;
    },
    updateRequestStatus: async (data) => {
        const response = await api.put('/hospital/requests/', data);
        return response.data;
    },
    searchBlood: async (bloodGroup, lat, lng) => {
        let url = `/hospital/search/?bloodGroup=${encodeURIComponent(bloodGroup)}`;
        if (lat && lng) {
            url += `&lat=${lat}&lng=${lng}`;
        }
        const response = await api.get(url);
        return response.data;
    },
    getAppointments: async (userId) => {
        const response = await api.get(`/hospital/appointments/?userId=${userId}`);
        return response.data;
    },
    updateAppointment: async (data) => {
        const response = await api.post('/hospital/appointments/', data);
        return response.data;
    }
};

export default api;
