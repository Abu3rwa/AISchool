import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ============ ASYNC THUNKS ============

// Fetch all tenants
export const fetchTenants = createAsyncThunk(
    'tenants/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/provider/tenants', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
        }
    }
);

// Fetch single tenant
export const fetchTenantById = createAsyncThunk(
    'tenants/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/provider/tenants/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant');
        }
    }
);

// Create tenant with first admin
export const createTenant = createAsyncThunk(
    'tenants/create',
    async ({ tenant, adminUserData }, { rejectWithValue }) => {
        try {
            const response = await api.post('/provider/tenants', { tenant, adminUserData });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create tenant');
        }
    }
);

// Update tenant
export const updateTenant = createAsyncThunk(
    'tenants/update',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/provider/tenants/${id}`, updates);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update tenant');
        }
    }
);

// Update tenant status
export const updateTenantStatus = createAsyncThunk(
    'tenants/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/provider/tenants/${id}/status`, { status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Delete tenant
export const deleteTenant = createAsyncThunk(
    'tenants/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/provider/tenants/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant');
        }
    }
);

// ============ SLICE ============

const initialState = {
    tenants: [],
    currentTenant: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    isLoading: false,
    error: null,
};

const tenantSlice = createSlice({
    name: 'tenants',
    initialState,
    reducers: {
        clearCurrentTenant: (state) => {
            state.currentTenant = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchTenants.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tenants = action.payload.tenants || action.payload;
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(fetchTenants.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch by ID
            .addCase(fetchTenantById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTenantById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentTenant = action.payload;
            })
            .addCase(fetchTenantById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createTenant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createTenant.fulfilled, (state, action) => {
                state.isLoading = false;
                const createdTenant = action.payload.tenant || action.payload;
                state.tenants = [createdTenant, ...state.tenants];
            })
            .addCase(createTenant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateTenant.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateTenant.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.tenants.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
                if (state.currentTenant?._id === action.payload._id) {
                    state.currentTenant = action.payload;
                }
            })
            .addCase(updateTenant.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update status
            .addCase(updateTenantStatus.fulfilled, (state, action) => {
                const index = state.tenants.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.tenants[index] = action.payload;
                }
                if (state.currentTenant?._id === action.payload._id) {
                    state.currentTenant = action.payload;
                }
            })
            // Delete
            .addCase(deleteTenant.fulfilled, (state, action) => {
                state.tenants = state.tenants.filter(t => t._id !== action.payload);
            });
    },
});

export const { clearCurrentTenant, clearError } = tenantSlice.actions;

// Selectors
export const selectTenants = (state) => state.tenants.tenants;
export const selectCurrentTenant = (state) => state.tenants.currentTenant;
export const selectTenantsPagination = (state) => state.tenants.pagination;
export const selectTenantsLoading = (state) => state.tenants.isLoading;
export const selectTenantsError = (state) => state.tenants.error;

export default tenantSlice.reducer;
