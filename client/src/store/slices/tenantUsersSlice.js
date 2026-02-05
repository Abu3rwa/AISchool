import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTenantUsers = createAsyncThunk(
    'tenantUsers/fetchAll',
    async ({ tenantId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/provider/tenants/${tenantId}/users`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant users');
        }
    }
);

export const createTenantUser = createAsyncThunk(
    'tenantUsers/create',
    async ({ tenantId, userData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/provider/tenants/${tenantId}/users`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

export const updateTenantUserStatus = createAsyncThunk(
    'tenantUsers/updateStatus',
    async ({ tenantId, userId, isActive }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/provider/tenants/${tenantId}/users/${userId}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
        }
    }
);

const initialState = {
    users: [],
    loading: false,
    error: null,
};

const tenantUsersSlice = createSlice({
    name: 'tenantUsers',
    initialState,
    reducers: {
        clearTenantUsers: (state) => {
            state.users = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTenantUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchTenantUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createTenantUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTenantUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = [action.payload, ...state.users];
            })
            .addCase(createTenantUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Status
            .addCase(updateTenantUserStatus.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            });
    },
});

export const { clearTenantUsers } = tenantUsersSlice.actions;

export const selectTenantUsers = (state) => state.tenantUsers.users;
export const selectTenantUsersLoading = (state) => state.tenantUsers.loading;
export const selectTenantUsersError = (state) => state.tenantUsers.error;

export default tenantUsersSlice.reducer;
