import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all subjects
export const fetchSubjects = createAsyncThunk(
    'portalSubjects/fetchSubjects',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
            if (params.classId) queryParams.append('classId', params.classId);

            const url = `/portal/subjects${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
        }
    }
);

// Fetch single subject
export const fetchSubjectById = createAsyncThunk(
    'portalSubjects/fetchSubjectById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/portal/subjects/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch subject');
        }
    }
);

// Create subject
export const createSubject = createAsyncThunk(
    'portalSubjects/createSubject',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/subjects', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create subject');
        }
    }
);

// Update subject
export const updateSubject = createAsyncThunk(
    'portalSubjects/updateSubject',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/subjects/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
        }
    }
);

// Set subject status
export const setSubjectStatus = createAsyncThunk(
    'portalSubjects/setSubjectStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/portal/subjects/${id}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Delete subject
export const deleteSubject = createAsyncThunk(
    'portalSubjects/deleteSubject',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/subjects/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
        }
    }
);

const portalSubjectsSlice = createSlice({
    name: 'portalSubjects',
    initialState: {
        subjects: [],
        selectedSubject: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedSubject: (state) => {
            state.selectedSubject = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Subjects
            .addCase(fetchSubjects.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subjects = action.payload;
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Subject By ID
            .addCase(fetchSubjectById.fulfilled, (state, action) => {
                state.selectedSubject = action.payload;
            })
            // Create Subject
            .addCase(createSubject.fulfilled, (state, action) => {
                state.subjects.unshift(action.payload);
            })
            .addCase(createSubject.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update Subject
            .addCase(updateSubject.fulfilled, (state, action) => {
                const index = state.subjects.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.subjects[index] = action.payload;
                }
                if (state.selectedSubject?._id === action.payload._id) {
                    state.selectedSubject = action.payload;
                }
            })
            // Set Status
            .addCase(setSubjectStatus.fulfilled, (state, action) => {
                const index = state.subjects.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.subjects[index] = action.payload;
                }
            })
            // Delete Subject
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.subjects = state.subjects.filter(s => s._id !== action.payload);
            });
    },
});

export const { clearError, clearSelectedSubject } = portalSubjectsSlice.actions;

export const selectPortalSubjects = (state) => state.portalSubjects.subjects;
export const selectSelectedSubject = (state) => state.portalSubjects.selectedSubject;
export const selectPortalSubjectsLoading = (state) => state.portalSubjects.isLoading;
export const selectPortalSubjectsError = (state) => state.portalSubjects.error;

export default portalSubjectsSlice.reducer;
