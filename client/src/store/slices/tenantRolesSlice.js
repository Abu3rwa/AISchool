import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTenantRoles = createAsyncThunk(
    'tenantRoles/fetchAll',
    async ({ tenantId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/provider/tenants/${tenantId}/roles`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant roles');
        }
    }
);

export const updateRolePermissions = createAsyncThunk(
    'tenantRoles/updatePermissions',
    async ({ tenantId, roleId, permissions }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/provider/tenants/${tenantId}/roles/${roleId}`, { permissions });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update role permissions');
        }
    }
);

const initialState = {
    roles: [],
    loading: false,
    error: null,
};

const tenantRolesSlice = createSlice({
    name: 'tenantRoles',
    initialState,
    reducers: {
        clearTenantRoles: (state) => {
            state.roles = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTenantRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenantRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchTenantRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRolePermissions.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.roles.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.roles[index] = action.payload;
                }
            })
            .addCase(updateRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearTenantRoles } = tenantRolesSlice.actions;

export const selectTenantRoles = (state) => state.tenantRoles.roles;
export const selectTenantRolesLoading = (state) => state.tenantRoles.loading;
export const selectTenantRolesError = (state) => state.tenantRoles.error;

export default tenantRolesSlice.reducer;
