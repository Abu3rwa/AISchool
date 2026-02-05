import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all assignments (ADMIN)
export const fetchAssignments = createAsyncThunk(
    'portalAssignments/fetchAssignments',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.classId) queryParams.append('classId', params.classId);
            if (params.teacherId) queryParams.append('teacherId', params.teacherId);
            if (params.subjectId) queryParams.append('subjectId', params.subjectId);

            const url = `/portal/class-subjects${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
        }
    }
);

// Create assignment
export const createAssignment = createAsyncThunk(
    'portalAssignments/createAssignment',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/class-subjects', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create assignment');
        }
    }
);

// Update assignment
export const updateAssignment = createAsyncThunk(
    'portalAssignments/updateAssignment',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/class-subjects/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update assignment');
        }
    }
);

// Delete assignment
export const deleteAssignment = createAsyncThunk(
    'portalAssignments/deleteAssignment',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/class-subjects/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete assignment');
        }
    }
);

// Teacher self-view: my assignments
export const fetchMyAssignments = createAsyncThunk(
    'portalAssignments/fetchMyAssignments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/my/assignments');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my assignments');
        }
    }
);

// Teacher self-view: my classes
export const fetchMyClasses = createAsyncThunk(
    'portalAssignments/fetchMyClasses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/my/classes');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my classes');
        }
    }
);

// Teacher self-view: my subjects
export const fetchMySubjects = createAsyncThunk(
    'portalAssignments/fetchMySubjects',
    async (classId, { rejectWithValue }) => {
        try {
            const url = classId ? `/portal/my/subjects?classId=${classId}` : '/portal/my/subjects';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my subjects');
        }
    }
);

const portalAssignmentsSlice = createSlice({
    name: 'portalAssignments',
    initialState: {
        assignments: [],
        myAssignments: [],
        myClasses: [],
        mySubjects: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Assignments
            .addCase(fetchAssignments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assignments = action.payload;
            })
            .addCase(fetchAssignments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Assignment
            .addCase(createAssignment.fulfilled, (state, action) => {
                state.assignments.unshift(action.payload);
            })
            .addCase(createAssignment.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update Assignment
            .addCase(updateAssignment.fulfilled, (state, action) => {
                const index = state.assignments.findIndex(a => a._id === action.payload._id);
                if (index !== -1) {
                    state.assignments[index] = action.payload;
                }
            })
            // Delete Assignment
            .addCase(deleteAssignment.fulfilled, (state, action) => {
                state.assignments = state.assignments.filter(a => a._id !== action.payload);
            })
            // My Assignments
            .addCase(fetchMyAssignments.fulfilled, (state, action) => {
                state.myAssignments = action.payload;
            })
            // My Classes
            .addCase(fetchMyClasses.fulfilled, (state, action) => {
                state.myClasses = action.payload;
            })
            // My Subjects
            .addCase(fetchMySubjects.fulfilled, (state, action) => {
                state.mySubjects = action.payload;
            });
    },
});

export const { clearError } = portalAssignmentsSlice.actions;

export const selectPortalAssignments = (state) => state.portalAssignments.assignments;
export const selectMyAssignments = (state) => state.portalAssignments.myAssignments;
export const selectMyClasses = (state) => state.portalAssignments.myClasses;
export const selectMySubjects = (state) => state.portalAssignments.mySubjects;
export const selectPortalAssignmentsLoading = (state) => state.portalAssignments.isLoading;
export const selectPortalAssignmentsError = (state) => state.portalAssignments.error;

export default portalAssignmentsSlice.reducer;
