import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all students
export const fetchStudents = createAsyncThunk(
    'portalStudents/fetchStudents',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.classId) queryParams.append('classId', params.classId);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

            const url = `/portal/students${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
        }
    }
);

// Fetch single student
export const fetchStudentById = createAsyncThunk(
    'portalStudents/fetchStudentById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/portal/students/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch student');
        }
    }
);

// Create student
export const createStudent = createAsyncThunk(
    'portalStudents/createStudent',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/students', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create student');
        }
    }
);

// Update student
export const updateStudent = createAsyncThunk(
    'portalStudents/updateStudent',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/students/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update student');
        }
    }
);

// Set student status
export const setStudentStatus = createAsyncThunk(
    'portalStudents/setStudentStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/portal/students/${id}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Delete student
export const deleteStudent = createAsyncThunk(
    'portalStudents/deleteStudent',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/students/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
        }
    }
);

const portalStudentsSlice = createSlice({
    name: 'portalStudents',
    initialState: {
        students: [],
        selectedStudent: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedStudent: (state) => {
            state.selectedStudent = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Students
            .addCase(fetchStudents.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.students = action.payload;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Student By ID
            .addCase(fetchStudentById.fulfilled, (state, action) => {
                state.selectedStudent = action.payload;
            })
            // Create Student
            .addCase(createStudent.fulfilled, (state, action) => {
                state.students.unshift(action.payload);
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update Student
            .addCase(updateStudent.fulfilled, (state, action) => {
                const index = state.students.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
                if (state.selectedStudent?._id === action.payload._id) {
                    state.selectedStudent = action.payload;
                }
            })
            // Set Status
            .addCase(setStudentStatus.fulfilled, (state, action) => {
                const index = state.students.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
            })
            // Delete Student
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.students = state.students.filter(s => s._id !== action.payload);
            });
    },
});

export const { clearError, clearSelectedStudent } = portalStudentsSlice.actions;

export const selectPortalStudents = (state) => state.portalStudents.students;
export const selectSelectedStudent = (state) => state.portalStudents.selectedStudent;
export const selectPortalStudentsLoading = (state) => state.portalStudents.isLoading;
export const selectPortalStudentsError = (state) => state.portalStudents.error;

export default portalStudentsSlice.reducer;
