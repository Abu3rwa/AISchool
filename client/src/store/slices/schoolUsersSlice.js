import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all users
export const fetchUsers = createAsyncThunk(
    'schoolUsers/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Create user
export const createUser = createAsyncThunk(
    'schoolUsers/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

// Update user
export const updateUser = createAsyncThunk(
    'schoolUsers/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

// Delete user
export const deleteUser = createAsyncThunk(
    'schoolUsers/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

// Fetch roles (needed for creating users)
export const fetchRoles = createAsyncThunk(
    'schoolUsers/fetchRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/roles');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
        }
    }
);

const schoolUsersSlice = createSlice({
    name: 'schoolUsers',
    initialState: {
        users: [],
        roles: [],
        isLoading: false,
        error: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create User
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.unshift(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update User
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u._id !== action.payload);
            })
            // Fetch Roles
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.roles = action.payload;
            });
    },
});

export const { clearError } = schoolUsersSlice.actions;

export const selectSchoolUsers = (state) => state.schoolUsers.users;
export const selectSchoolRoles = (state) => state.schoolUsers.roles;
export const selectSchoolUsersLoading = (state) => state.schoolUsers.isLoading;
export const selectSchoolUsersError = (state) => state.schoolUsers.error;

export default schoolUsersSlice.reducer;
