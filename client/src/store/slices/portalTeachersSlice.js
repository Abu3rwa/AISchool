import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all teachers
export const fetchTeachers = createAsyncThunk(
    'portalTeachers/fetchTeachers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/teachers');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch teachers');
        }
    }
);

// Fetch single teacher
export const fetchTeacherById = createAsyncThunk(
    'portalTeachers/fetchTeacherById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/portal/teachers/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch teacher');
        }
    }
);

// Create teacher
export const createTeacher = createAsyncThunk(
    'portalTeachers/createTeacher',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/teachers', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create teacher');
        }
    }
);

// Update teacher
export const updateTeacher = createAsyncThunk(
    'portalTeachers/updateTeacher',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/teachers/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update teacher');
        }
    }
);

// Set teacher status
export const setTeacherStatus = createAsyncThunk(
    'portalTeachers/setTeacherStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/portal/teachers/${id}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Reset teacher password
export const resetTeacherPassword = createAsyncThunk(
    'portalTeachers/resetTeacherPassword',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/portal/teachers/${id}/reset-password`);
            return { id, tempPassword: response.data.tempPassword };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
        }
    }
);

// Delete teacher
export const deleteTeacher = createAsyncThunk(
    'portalTeachers/deleteTeacher',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/teachers/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete teacher');
        }
    }
);

const portalTeachersSlice = createSlice({
    name: 'portalTeachers',
    initialState: {
        teachers: [],
        selectedTeacher: null,
        tempPassword: null, // Shown once after create or reset
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedTeacher: (state) => {
            state.selectedTeacher = null;
        },
        clearTempPassword: (state) => {
            state.tempPassword = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Teachers
            .addCase(fetchTeachers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeachers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.teachers = action.payload;
            })
            .addCase(fetchTeachers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Teacher By ID
            .addCase(fetchTeacherById.fulfilled, (state, action) => {
                state.selectedTeacher = action.payload;
            })
            // Create Teacher
            .addCase(createTeacher.fulfilled, (state, action) => {
                const { tempPassword, ...teacher } = action.payload;
                state.teachers.unshift(teacher);
                state.tempPassword = tempPassword;
            })
            .addCase(createTeacher.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update Teacher
            .addCase(updateTeacher.fulfilled, (state, action) => {
                const index = state.teachers.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.teachers[index] = action.payload;
                }
                if (state.selectedTeacher?._id === action.payload._id) {
                    state.selectedTeacher = { ...state.selectedTeacher, ...action.payload };
                }
            })
            // Set Status
            .addCase(setTeacherStatus.fulfilled, (state, action) => {
                const index = state.teachers.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.teachers[index] = action.payload;
                }
            })
            // Reset Password
            .addCase(resetTeacherPassword.fulfilled, (state, action) => {
                state.tempPassword = action.payload.tempPassword;
            })
            // Delete Teacher
            .addCase(deleteTeacher.fulfilled, (state, action) => {
                state.teachers = state.teachers.filter(t => t._id !== action.payload);
            });
    },
});

export const { clearError, clearSelectedTeacher, clearTempPassword } = portalTeachersSlice.actions;

export const selectPortalTeachers = (state) => state.portalTeachers.teachers;
export const selectSelectedTeacher = (state) => state.portalTeachers.selectedTeacher;
export const selectTempPassword = (state) => state.portalTeachers.tempPassword;
export const selectPortalTeachersLoading = (state) => state.portalTeachers.isLoading;
export const selectPortalTeachersError = (state) => state.portalTeachers.error;

export default portalTeachersSlice.reducer;
