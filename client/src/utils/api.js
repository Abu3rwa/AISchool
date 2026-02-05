import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - adds auth token to every request and handles mocks for Demo
api.interceptors.request.use(
    async (config) => {
        // MOCK: Handle Demo Login
        // Check if we are logging in with demo credentials
        if (config.url === '/provider-auth/login' && config.data?.email === 'admin@educloud.com') {
            // Mock succesful response for any password if email matches default
            config.adapter = async () => {
                return {
                    data: {
                        token: 'demo-mock-token-12345',
                        user: {
                            id: '1',
                            name: 'Demo Provider Admin',
                            email: 'admin@educloud.com',
                            role: 'provider_admin'
                        }
                    },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                    request: {}
                };
            };
        }

        // MOCK: Handle Me endpoint for demo token
        const providerToken = localStorage.getItem('provider_token');
        if (config.url === '/provider-auth/me' && providerToken === 'demo-mock-token-12345') {
            config.adapter = async () => {
                return {
                    data: {
                        id: '1',
                        name: 'Demo Provider Admin',
                        email: 'admin@educloud.com',
                        role: 'provider_admin'
                    },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                    request: {}
                };
            };
        }

        // Determine which token to use based on the route
        // Portal routes use school_token, other routes use provider_token
        const isPortalRoute = config.url?.startsWith('/portal') || config.url?.startsWith('/auth');
        const schoolToken = localStorage.getItem('school_token');

        // Use school token for portal routes if available, otherwise fall back to provider token
        let token;
        if (isPortalRoute && schoolToken) {
            token = schoolToken;
        } else if (providerToken) {
            token = providerToken;
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired - clear storage and redirect
            // Don't redirect if we are already on login page
            const isPortalPath = window.location.pathname.startsWith('/portal');

            if (!window.location.pathname.includes('/login')) {
                if (isPortalPath) {
                    localStorage.removeItem('school_token');
                    localStorage.removeItem('school_user');
                    window.location.href = '/portal/login';
                } else {
                    localStorage.removeItem('provider_token');
                    localStorage.removeItem('provider_user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
