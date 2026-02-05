import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Badge, Card, Form, Modal, Alert } from 'react-bootstrap';
import {
    fetchTenantUsers,
    createTenantUser,
    updateTenantUserStatus,
    selectTenantUsers,
    selectTenantUsersLoading,
    selectTenantUsersError,
    clearTenantUsers
} from '../../../store/slices/tenantUsersSlice';

import {
    fetchTenantRoles,
    selectTenantRoles
} from '../../../store/slices/tenantRolesSlice';

const SchoolUsersPage = () => {
    const { id: tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const users = useSelector(selectTenantUsers);
    const isLoading = useSelector(selectTenantUsersLoading);
    const error = useSelector(selectTenantUsersError);
    const roles = useSelector(selectTenantRoles);

    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantUsers({ tenantId }));
            dispatch(fetchTenantRoles({ tenantId }));
        }
        return () => {
            dispatch(clearTenantUsers());
        };
    }, [dispatch, tenantId]);

    const handleCreate = async (e) => {
        e.preventDefault();

        // Find role object if needed, or just send ID
        // The controller expects roleIds array
        if (!selectedRole) return;

        const result = await dispatch(createTenantUser({
            tenantId,
            userData: {
                firstName,
                lastName,
                email,
                password,
                roleIds: [selectedRole]
            }
        }));

        if (createTenantUser.fulfilled.match(result)) {
            setShowCreate(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setSelectedRole('');
        }
    };

    const toggleStatus = (user) => {
        const newStatus = !user.isActive;
        dispatch(updateTenantUserStatus({
            tenantId,
            userId: user._id,
            isActive: newStatus
        }));
    };

    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 className="mb-1">School Users</h3>
                    <div className="text-muted">Manage users for tenant {tenantId}</div>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate(`/tenants/${tenantId}`)}>
                        Back to Overview
                    </Button>
                    <Button variant="primary" onClick={() => setShowCreate(true)}>
                        Create User
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Table responsive hover className="mb-0">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && !isLoading ? (
                            <tr><td colSpan="5" className="text-center text-muted">No users found</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.roles?.map(r => (
                                            <Badge key={r._id || r} bg="info" className="me-1">
                                                {typeof r === 'object' ? r.name : 'Role'}
                                            </Badge>
                                        ))}
                                    </td>
                                    <td>
                                        <Badge bg={user.isActive ? 'success' : 'secondary'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant={user.isActive ? "outline-warning" : "outline-success"}
                                            onClick={() => toggleStatus(user)}
                                            disabled={isLoading}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {isLoading && (
                            <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showCreate} onHide={() => setShowCreate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New User</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <div className="d-flex gap-2">
                            <Form.Group className="mb-3 flex-grow-1">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 flex-grow-1">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={selectedRole}
                                onChange={e => setSelectedRole(e.target.value)}
                                required
                            >
                                <option value="">Select Role...</option>
                                {roles.map(r => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default SchoolUsersPage;
