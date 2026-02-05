import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTenantMetrics = createAsyncThunk(
    'tenantMetrics/fetch',
    async ({ tenantId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/provider/tenants/${tenantId}/metrics`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant metrics');
        }
    }
);

const initialState = {
    metrics: null,
    loading: false,
    error: null,
};

const tenantMetricsSlice = createSlice({
    name: 'tenantMetrics',
    initialState,
    reducers: {
        clearTenantMetrics: (state) => {
            state.metrics = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTenantMetrics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.metrics = action.payload;
            })
            .addCase(fetchTenantMetrics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearTenantMetrics } = tenantMetricsSlice.actions;

export const selectTenantMetrics = (state) => state.tenantMetrics.metrics;
export const selectTenantMetricsLoading = (state) => state.tenantMetrics.loading;
export const selectTenantMetricsError = (state) => state.tenantMetrics.error;

export default tenantMetricsSlice.reducer;
