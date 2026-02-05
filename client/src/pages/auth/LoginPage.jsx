import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Zap, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { login, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';
import { Button, Input } from '../../components/common';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Clear errors on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear field error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        dispatch(login({
            email: formData.email,
            password: formData.password,
        }));
    };

    // Demo login handler
    const handleDemoLogin = () => {
        dispatch(login({
            email: 'admin@educloud.com',
            password: 'demo_password_any',
        }));
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Zap size={32} />
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to access the Provider Dashboard</p>
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
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@example.com"
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
                            placeholder="Enter your password"
                            iconLeft={<Lock size={18} />}
                            iconRight={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                            error={errors.password}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="login-options">
                        <label className="login-remember">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                            />
                            Remember me
                        </label>
                        <a href="#forgot" className="login-forgot">Forgot password?</a>
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

                    <Button
                        type="button"
                        variant="ghost"
                        fullWidth
                        onClick={handleDemoLogin}
                        style={{ marginTop: 'var(--spacing-3)' }}
                    >
                        Continue as Demo User
                    </Button>
                </form>

                <div className="login-footer">
                    <p className="login-footer-text">
                        Protected by enterprise-grade security. Only authorized providers can access this dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
