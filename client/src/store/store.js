import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

import uiReducer from './slices/uiSlice';
import tenantReducer from './slices/tenantSlice';
import tenantUsersReducer from './slices/tenantUsersSlice';
import tenantRolesReducer from './slices/tenantRolesSlice';
import tenantMetricsReducer from './slices/tenantMetricsSlice';
import schoolAuthReducer from './slices/schoolAuthSlice';
import schoolUsersReducer from './slices/schoolUsersSlice';

// Portal slices
import portalStudentsReducer from './slices/portalStudentsSlice';
import portalTeachersReducer from './slices/portalTeachersSlice';
import portalClassesReducer from './slices/portalClassesSlice';
import portalSubjectsReducer from './slices/portalSubjectsSlice';
import portalAssignmentsReducer from './slices/portalAssignmentsSlice';
import portalGradeTypesReducer from './slices/portalGradeTypesSlice';
import portalTermsReducer from './slices/portalTermsSlice';
import portalGradesReducer from './slices/portalGradesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,

        ui: uiReducer,
        tenants: tenantReducer,
        tenantUsers: tenantUsersReducer,
        tenantRoles: tenantRolesReducer,
        tenantMetrics: tenantMetricsReducer,
        schoolAuth: schoolAuthReducer,
        schoolUsers: schoolUsersReducer,

        // Portal reducers
        portalStudents: portalStudentsReducer,
        portalTeachers: portalTeachersReducer,
        portalClasses: portalClassesReducer,
        portalSubjects: portalSubjectsReducer,
        portalAssignments: portalAssignmentsReducer,
        portalGradeTypes: portalGradeTypesReducer,
        portalTerms: portalTermsReducer,
        portalGrades: portalGradesReducer,
    },
    devTools: import.meta.env.DEV,
});
