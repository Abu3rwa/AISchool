import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Login School User
export const schoolLogin = createAsyncThunk(
    'schoolAuth/login',
    async ({ email, password, slug }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', { email, password, slug });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Get School User Profile
export const getSchoolProfile = createAsyncThunk(
    'schoolAuth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
        }
    }
);

const getInitialState = () => {
    const token = localStorage.getItem('school_token');
    const user = localStorage.getItem('school_user');

    return {
        token: token || null,
        user: user ? JSON.parse(user) : null,
        isAuthenticated: !!token,
        isLoading: false,
        error: null,
    };
};

const schoolAuthSlice = createSlice({
    name: 'schoolAuth',
    initialState: getInitialState(),
    reducers: {
        schoolLogout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.error = null;

            localStorage.removeItem('school_token');
            localStorage.removeItem('school_user');
        },
        clearSchoolError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(schoolLogin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(schoolLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;

                localStorage.setItem('school_token', action.payload.token);
                localStorage.setItem('school_user', JSON.stringify(action.payload.user));
            })
            .addCase(schoolLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get Profile
            .addCase(getSchoolProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                localStorage.setItem('school_user', JSON.stringify(action.payload));
            })
            .addCase(getSchoolProfile.rejected, (state) => {
                // If profile fetch fails (e.g., token expired), logout
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                localStorage.removeItem('school_token');
                localStorage.removeItem('school_user');
            });
    },
});

export const { schoolLogout, clearSchoolError } = schoolAuthSlice.actions;

export const selectSchoolAuth = (state) => state.schoolAuth;
export const selectSchoolIsAuthenticated = (state) => state.schoolAuth.isAuthenticated;
export const selectSchoolUser = (state) => state.schoolAuth.user;
export const selectSchoolAuthLoading = (state) => state.schoolAuth.isLoading;
export const selectSchoolAuthError = (state) => state.schoolAuth.error;

export default schoolAuthSlice.reducer;
