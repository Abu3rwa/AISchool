import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    activeModal: null,
    modalData: null,
    toast: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        toggleMobileSidebar: (state) => {
            state.sidebarMobileOpen = !state.sidebarMobileOpen;
        },
        closeMobileSidebar: (state) => {
            state.sidebarMobileOpen = false;
        },
        openModal: (state, action) => {
            state.activeModal = action.payload.modal;
            state.modalData = action.payload.data || null;
        },
        closeModal: (state) => {
            state.activeModal = null;
            state.modalData = null;
        },
        showToast: (state, action) => {
            state.toast = {
                id: Date.now(),
                type: action.payload.type || 'info',
                message: action.payload.message,
                duration: action.payload.duration || 5000,
            };
        },
        hideToast: (state) => {
            state.toast = null;
        },
    },
});

export const {
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileSidebar,
    closeMobileSidebar,
    openModal,
    closeModal,
    showToast,
    hideToast,
} = uiSlice.actions;

// Selectors
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectSidebarMobileOpen = (state) => state.ui.sidebarMobileOpen;
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectModalData = (state) => state.ui.modalData;
export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;
