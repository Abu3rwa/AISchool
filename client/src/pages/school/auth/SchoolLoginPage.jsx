import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { School, Mail, Lock, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import {
    schoolLogin,
    selectSchoolIsAuthenticated,
    selectSchoolAuthLoading,
    selectSchoolAuthError,
    clearSchoolError
} from '../../../store/slices/schoolAuthSlice';
import { Button, Input } from '../../../components/common';
// import '../auth/LoginPage.css'; // Reuse styles

const SchoolLoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(selectSchoolIsAuthenticated);
    const isLoading = useSelector(selectSchoolAuthLoading);
    const authError = useSelector(selectSchoolAuthError);

    const [formData, setFormData] = useState({
        slug: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/portal');
        }
    }, [isAuthenticated, navigate]);

    // Clear errors on unmount
    useEffect(() => {
        return () => {
            dispatch(clearSchoolError());
        };
    }, [dispatch]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.slug) newErrors.slug = 'School code is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        dispatch(schoolLogin(formData));
    };

    return (
        <div className="login-page" style={{ background: '#f0f2f5' }}>
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo" style={{ color: '#0d6efd' }}>
                        <School size={32} />
                    </div>
                    <h1 className="login-title">School Portal</h1>
                    <p className="login-subtitle">Sign in to your school account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {authError && (
                        <div className="login-error">
                            <AlertCircle size={18} />
                            {authError}
                        </div>
                    )}

                    <div className="login-field">
                        <Input
                            label="School Code"
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g. greenwood-academy"
                            iconLeft={<Building2 size={18} />}
                            error={errors.slug}
                            autoComplete="organization"
                        />
                    </div>

                    <div className="login-field">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="teacher@school.com"
                            iconLeft={<Mail size={18} />}
                            error={errors.email}
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-field">
                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            iconLeft={<Lock size={18} />}
                            iconRight={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                            error={errors.password}
                            autoComplete="current-password"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={isLoading}
                        className="login-submit"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="login-footer">
                    <p className="login-footer-text">
                        Protected area for school staff and students.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SchoolLoginPage;
