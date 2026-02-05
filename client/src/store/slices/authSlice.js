import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ============ ASYNC THUNKS ============

// Login
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/provider-auth/login', { email, password });
            return response.data;
        } catch (error) {
            const status = error.response?.status;
            if (status === 401) {
                return rejectWithValue('Invalid email or password. If you have not created a provider manager account yet, go to Sign up first.');
            }
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Signup (creates Provider + first ProviderUser manager)
export const signup = createAsyncThunk(
    'auth/signup',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/provider-auth/signup', payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Signup failed');
        }
    }
);

// Get profile
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/provider-auth/me');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
        }
    }
);

// ============ SLICE ============

const getInitialState = () => {
    const token = localStorage.getItem('provider_token');
    const user = localStorage.getItem('provider_user');

    return {
        token: token || null,
        user: user ? JSON.parse(user) : null,
        isAuthenticated: !!token,
        isLoading: false,
        error: null,
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        // For demo login or manual login
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.error = null;

            localStorage.setItem('provider_token', action.payload.token);
            localStorage.setItem('provider_user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.error = null;

            localStorage.removeItem('provider_token');
            localStorage.removeItem('provider_user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.providerUser || action.payload.user;

                localStorage.setItem('provider_token', action.payload.token);
                localStorage.setItem('provider_user', JSON.stringify(action.payload.providerUser || action.payload.user));
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Signup
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.providerUser;

                localStorage.setItem('provider_token', action.payload.token);
                localStorage.setItem('provider_user', JSON.stringify(action.payload.providerUser));
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get profile
            .addCase(getProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                localStorage.setItem('provider_user', JSON.stringify(action.payload));
            });
    },
});

export const { loginSuccess, logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
