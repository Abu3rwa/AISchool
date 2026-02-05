import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import {
    signup,
    selectAuthError,
    selectAuthLoading,
    selectIsAuthenticated,
    clearError,
} from '../../store/slices/authSlice';

const SignupPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);

    const [providerName, setProviderName] = useState('');
    const [managerFirstName, setManagerFirstName] = useState('');
    const [managerLastName, setManagerLastName] = useState('');
    const [managerEmail, setManagerEmail] = useState('');
    const [managerPassword, setManagerPassword] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        dispatch(
            signup({
                provider: {
                    name: providerName,
                },
                manager: {
                    firstName: managerFirstName,
                    lastName: managerLastName,
                    email: managerEmail,
                    password: managerPassword,
                },
            })
        );
    };

    return (
        <Container className="py-5" style={{ maxWidth: 640 }}>
            <Card>
                <Card.Body className="p-4">
                    <h3 className="mb-1">Create Provider Manager</h3>
                    <div className="text-muted mb-4">Creates your provider and your first manager login.</div>

                    {authError ? <Alert variant="danger">{authError}</Alert> : null}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="providerName">
                            <Form.Label>Provider name</Form.Label>
                            <Form.Control
                                value={providerName}
                                onChange={(e) => setProviderName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="managerFirstName">
                            <Form.Label>First name</Form.Label>
                            <Form.Control
                                value={managerFirstName}
                                onChange={(e) => setManagerFirstName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="managerLastName">
                            <Form.Label>Last name</Form.Label>
                            <Form.Control
                                value={managerLastName}
                                onChange={(e) => setManagerLastName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="managerEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={managerEmail}
                                onChange={(e) => setManagerEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="managerPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={managerPassword}
                                onChange={(e) => setManagerPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </Form.Group>

                        <Button type="submit" className="w-100" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </Form>

                    <div className="mt-3 text-center">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login">Sign in</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SignupPage;
