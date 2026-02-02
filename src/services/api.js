import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('bloodDonationUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user?.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                console.error("Error parsing user token:", e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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
    },
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password/', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    verifySecurityAnswer: async (email, securityAnswer) => {
        try {
            const response = await api.post('/auth/forgot-password/', { email, securityAnswer });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    resetPasswordWithVerification: async (email, newPassword) => {
        try {
            const response = await api.post('/auth/forgot-password/', { email, newPassword, verified: true });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network Error' };
        }
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
    cancelAppointment: async (id, reason) => {
        const response = await api.put('/donor/history/', { id, status: 'Cancelled', reason });
        return response.data;
    },
    getUrgentRequests: async (userId) => {
        const url = userId ? `/donor/active-requests/?userId=${userId}` : '/donor/active-requests/';
        const response = await api.get(url);
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
    ignoreRequest: async (requestId, userId) => {
        const response = await api.post('/donor/ignore-request/', { requestId, userId });
        return response.data;
    },
    acceptRequest: async (requestId, userId) => {
        const response = await api.post('/donor/accept-request/', { requestId, userId });
        return response.data;
    },
    getNotifications: async (userId) => {
        const response = await api.get(`/notifications/?userId=${userId}`);
        return response.data;
    },
    updateNotificationStatus: async (id, status) => {
        const response = await api.put('/notifications/', { id, status });
        return response.data;
    },
    // New Feature: P2P
    createRequest: (data) => api.post('/donor/requests/', data).then(res => res.data),
    completeRequest: (requestId) => api.post('/donor/requests/complete/', { requestId }).then(res => res.data),
    cancelRequest: (requestId, userId) => api.post('/donor/requests/cancel/', { requestId, userId }).then(res => res.data),
    getActiveLocations: async () => { // New Endpoint
        const response = await api.get('/locations/active/');
        return response.data;
    },
    getMyRequests: async (userId) => {
        const response = await api.get(`/donor/my-requests/?userId=${userId}`);
        return response.data;
    },
    getDonorCount: async (cities, bloodGroup) => { // Updated to accept bloodGroup
        const params = new URLSearchParams();
        if (Array.isArray(cities)) {
            cities.forEach(c => params.append('city', c));
        } else {
            params.append('city', cities);
        }
        if (bloodGroup) params.append('bloodGroup', bloodGroup);

        const response = await api.get(`/locations/count/?${params.toString()}`);
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
    getRequests: async (userId, filter = 'all', search = '') => {
        const response = await api.get(`/hospital/requests/?userId=${userId}&filter=${filter}&search=${encodeURIComponent(search)}`);
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
    deleteRequest: async (requestId) => {
        const response = await api.delete(`/hospital/requests/?id=${requestId}`);
        return response.data;
    },
    searchBlood: async (bloodGroup, units, userId, lat, lng) => {
        let url = `/hospital/search/?bloodGroup=${encodeURIComponent(bloodGroup)}&units=${units}&userId=${userId}`;
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
    },
    // New Features
    getDonors: async (search = '') => {
        const response = await api.get(`/hospital/donors/?search=${encodeURIComponent(search)}`);
        return response.data;
    },
    // Search Eligible Donors for P2P Broadcast
    searchDonors: async (bloodGroup, city) => {
        const params = new URLSearchParams();
        if (bloodGroup) params.append('bloodGroup', bloodGroup);

        if (Array.isArray(city)) {
            city.forEach(c => params.append('city', c));
        } else if (city) {
            params.append('city', city);
        }

        const response = await api.get(`/hospital/donors/?${params.toString()}`);
        return response.data;
    },
    getReports: async () => {
        const response = await api.get('/hospital/reports/');
        return response.data;
    },
    dispatchBlood: async (data) => {
        const response = await api.post('/hospital/dispatch/', data);
        return response.data;
    },
    receiveBlood: async (data) => {
        const response = await api.post('/hospital/receive/', data);
        return response.data;
    },
    // Batch Management
    createBatch: async (data) => {
        const response = await api.post('/hospital/batches/', data);
        return response.data;
    },
    getBatches: async (hospitalId) => {
        const response = await api.get(`/hospital/batches/?hospitalId=${hospitalId}`);
        return response.data;
    },
    useBatchUnit: async (batchId, hospitalId, quantity = 1, patientId = null, referenceId = null, ward = null, doctorName = null, issueDateTime = null) => {
        const response = await api.post('/hospital/batches/action/', {
            batchId, hospitalId, action: 'use_unit', quantity,
            patientId, referenceId, ward, doctorName, issueDateTime
        });
        return response.data;
    },
    discardBatchUnit: async (batchId, hospitalId, quantity = 1) => {
        const response = await api.post('/hospital/batches/action/', { batchId, hospitalId, action: 'discard_unit', quantity });
        return response.data;
    },
    // Outgoing Batch Tracking
    getOutgoingBatches: async (hospitalId, type = null) => {
        let url = `/hospital/outgoing-batches/?hospitalId=${hospitalId}`;
        if (type) url += `&type=${type}`;
        const response = await api.get(url);
        return response.data;
    }
};

export default api;
