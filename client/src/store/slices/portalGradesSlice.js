import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch grades with filters
export const fetchGrades = createAsyncThunk(
    'portalGrades/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/grades', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch grades');
        }
    }
);

// Fetch grades by class
export const fetchGradesByClass = createAsyncThunk(
    'portalGrades/fetchByClass',
    async ({ classId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/portal/grades/by-class/${classId}`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch class grades');
        }
    }
);

// Fetch grades by student
export const fetchGradesByStudent = createAsyncThunk(
    'portalGrades/fetchByStudent',
    async ({ studentId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/portal/grades/by-student/${studentId}`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch student grades');
        }
    }
);

// Create single grade
export const createGrade = createAsyncThunk(
    'portalGrades/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/grades', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create grade');
        }
    }
);

// Bulk create grades
export const bulkCreateGrades = createAsyncThunk(
    'portalGrades/bulkCreate',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/grades/bulk', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create grades');
        }
    }
);

// Update grade
export const updateGrade = createAsyncThunk(
    'portalGrades/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/grades/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update grade');
        }
    }
);

// Publish/unpublish grade
export const publishGrade = createAsyncThunk(
    'portalGrades/publish',
    async ({ id, isPublished }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/portal/grades/${id}/publish`, { isPublished });
            return response.data.grade;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to publish grade');
        }
    }
);

// Delete grade
export const deleteGrade = createAsyncThunk(
    'portalGrades/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/grades/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete grade');
        }
    }
);

const portalGradesSlice = createSlice({
    name: 'portalGrades',
    initialState: {
        grades: [],
        isLoading: false,
        error: null,
        filters: {
            classId: '',
            subjectId: '',
            gradeTypeId: '',
            termId: '',
        },
    },
    reducers: {
        clearGradesError: (state) => {
            state.error = null;
        },
        setGradeFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearGradeFilters: (state) => {
            state.filters = { classId: '', subjectId: '', gradeTypeId: '', termId: '' };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGrades.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchGrades.fulfilled, (state, action) => {
                state.isLoading = false;
                state.grades = action.payload;
            })
            .addCase(fetchGrades.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchGradesByClass.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGradesByClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.grades = action.payload;
            })
            .addCase(fetchGradesByStudent.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGradesByStudent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.grades = action.payload;
            })
            .addCase(createGrade.fulfilled, (state, action) => {
                state.grades.unshift(action.payload);
            })
            .addCase(updateGrade.fulfilled, (state, action) => {
                const index = state.grades.findIndex(g => g._id === action.payload._id);
                if (index !== -1) {
                    state.grades[index] = action.payload;
                }
            })
            .addCase(publishGrade.fulfilled, (state, action) => {
                const index = state.grades.findIndex(g => g._id === action.payload._id);
                if (index !== -1) {
                    state.grades[index] = action.payload;
                }
            })
            .addCase(deleteGrade.fulfilled, (state, action) => {
                state.grades = state.grades.filter(g => g._id !== action.payload);
            });
    },
});

export const { clearGradesError, setGradeFilters, clearGradeFilters } = portalGradesSlice.actions;

export const selectPortalGrades = (state) => state.portalGrades.grades;
export const selectPortalGradesLoading = (state) => state.portalGrades.isLoading;
export const selectPortalGradesError = (state) => state.portalGrades.error;
export const selectPortalGradeFilters = (state) => state.portalGrades.filters;

export default portalGradesSlice.reducer;
