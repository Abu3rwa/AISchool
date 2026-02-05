import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all grade types
export const fetchGradeTypes = createAsyncThunk(
    'portalGradeTypes/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/grade-types');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch grade types');
        }
    }
);

// Create grade type
export const createGradeType = createAsyncThunk(
    'portalGradeTypes/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/grade-types', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create grade type');
        }
    }
);

// Update grade type
export const updateGradeType = createAsyncThunk(
    'portalGradeTypes/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/grade-types/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update grade type');
        }
    }
);

// Delete (deactivate) grade type
export const deleteGradeType = createAsyncThunk(
    'portalGradeTypes/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/portal/grade-types/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete grade type');
        }
    }
);

const portalGradeTypesSlice = createSlice({
    name: 'portalGradeTypes',
    initialState: {
        gradeTypes: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearGradeTypesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGradeTypes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchGradeTypes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.gradeTypes = action.payload;
            })
            .addCase(fetchGradeTypes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createGradeType.fulfilled, (state, action) => {
                state.gradeTypes.push(action.payload);
            })
            .addCase(updateGradeType.fulfilled, (state, action) => {
                const index = state.gradeTypes.findIndex(gt => gt._id === action.payload._id);
                if (index !== -1) {
                    state.gradeTypes[index] = action.payload;
                }
            })
            .addCase(deleteGradeType.fulfilled, (state, action) => {
                state.gradeTypes = state.gradeTypes.filter(gt => gt._id !== action.payload);
            });
    },
});

export const { clearGradeTypesError } = portalGradeTypesSlice.actions;

export const selectPortalGradeTypes = (state) => state.portalGradeTypes.gradeTypes;
export const selectPortalGradeTypesLoading = (state) => state.portalGradeTypes.isLoading;
export const selectPortalGradeTypesError = (state) => state.portalGradeTypes.error;

export default portalGradeTypesSlice.reducer;
