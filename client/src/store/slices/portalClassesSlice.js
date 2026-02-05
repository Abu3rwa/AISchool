import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all classes
export const fetchClasses = createAsyncThunk(
    'portalClasses/fetchClasses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

            const url = `/portal/classes${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
        }
    }
);

// Fetch single class with students and assignments
export const fetchClassById = createAsyncThunk(
    'portalClasses/fetchClassById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/portal/classes/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch class');
        }
    }
);

// Create class
export const createClass = createAsyncThunk(
    'portalClasses/createClass',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/classes', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create class');
        }
    }
);

// Update class
export const updateClass = createAsyncThunk(
    'portalClasses/updateClass',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/classes/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update class');
        }
    }
);

// Set class status
export const setClassStatus = createAsyncThunk(
    'portalClasses/setClassStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/portal/classes/${id}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Delete class
export const deleteClass = createAsyncThunk(
    'portalClasses/deleteClass',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/classes/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete class');
        }
    }
);

const portalClassesSlice = createSlice({
    name: 'portalClasses',
    initialState: {
        classes: [],
        selectedClass: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedClass: (state) => {
            state.selectedClass = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Classes
            .addCase(fetchClasses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classes = action.payload;
            })
            .addCase(fetchClasses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Class By ID
            .addCase(fetchClassById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClassById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedClass = action.payload;
            })
            .addCase(fetchClassById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Class
            .addCase(createClass.fulfilled, (state, action) => {
                state.classes.unshift(action.payload);
            })
            .addCase(createClass.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update Class
            .addCase(updateClass.fulfilled, (state, action) => {
                const index = state.classes.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.classes[index] = { ...state.classes[index], ...action.payload };
                }
                if (state.selectedClass?._id === action.payload._id) {
                    state.selectedClass = { ...state.selectedClass, ...action.payload };
                }
            })
            // Set Status
            .addCase(setClassStatus.fulfilled, (state, action) => {
                const index = state.classes.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.classes[index] = { ...state.classes[index], ...action.payload };
                }
            })
            // Delete Class
            .addCase(deleteClass.fulfilled, (state, action) => {
                state.classes = state.classes.filter(c => c._id !== action.payload);
            });
    },
});

export const { clearError, clearSelectedClass } = portalClassesSlice.actions;

export const selectPortalClasses = (state) => state.portalClasses.classes;
export const selectSelectedClass = (state) => state.portalClasses.selectedClass;
export const selectPortalClassesLoading = (state) => state.portalClasses.isLoading;
export const selectPortalClassesError = (state) => state.portalClasses.error;

export default portalClassesSlice.reducer;
