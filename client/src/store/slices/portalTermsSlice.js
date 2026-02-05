import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all terms
export const fetchTerms = createAsyncThunk(
    'portalTerms/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/terms', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch terms');
        }
    }
);

// Fetch current term
export const fetchCurrentTerm = createAsyncThunk(
    'portalTerms/fetchCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/portal/terms/current');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'No current term set');
        }
    }
);

// Create term
export const createTerm = createAsyncThunk(
    'portalTerms/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/portal/terms', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create term');
        }
    }
);

// Update term
export const updateTerm = createAsyncThunk(
    'portalTerms/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/portal/terms/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update term');
        }
    }
);

// Set current term
export const setCurrentTerm = createAsyncThunk(
    'portalTerms/setCurrent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/portal/terms/${id}/current`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to set current term');
        }
    }
);

const portalTermsSlice = createSlice({
    name: 'portalTerms',
    initialState: {
        terms: [],
        currentTerm: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearTermsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTerms.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTerms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.terms = action.payload;
            })
            .addCase(fetchTerms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchCurrentTerm.fulfilled, (state, action) => {
                state.currentTerm = action.payload;
            })
            .addCase(createTerm.fulfilled, (state, action) => {
                state.terms.unshift(action.payload);
                if (action.payload.isCurrent) {
                    state.currentTerm = action.payload;
                    state.terms = state.terms.map(t => 
                        t._id !== action.payload._id ? { ...t, isCurrent: false } : t
                    );
                }
            })
            .addCase(updateTerm.fulfilled, (state, action) => {
                const index = state.terms.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.terms[index] = action.payload;
                }
            })
            .addCase(setCurrentTerm.fulfilled, (state, action) => {
                state.currentTerm = action.payload;
                state.terms = state.terms.map(t => ({
                    ...t,
                    isCurrent: t._id === action.payload._id
                }));
            });
    },
});

export const { clearTermsError } = portalTermsSlice.actions;

export const selectPortalTerms = (state) => state.portalTerms.terms;
export const selectPortalCurrentTerm = (state) => state.portalTerms.currentTerm;
export const selectPortalTermsLoading = (state) => state.portalTerms.isLoading;
export const selectPortalTermsError = (state) => state.portalTerms.error;

export default portalTermsSlice.reducer;
