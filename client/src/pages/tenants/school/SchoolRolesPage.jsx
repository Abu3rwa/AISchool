import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Badge, Card, Modal, Form, Alert } from 'react-bootstrap';
import {
    fetchTenantRoles,
    updateRolePermissions,
    selectTenantRoles,
    selectTenantRolesLoading,
    selectTenantRolesError,
    clearTenantRoles
} from '../../../store/slices/tenantRolesSlice';

const SchoolRolesPage = () => {
    const { id: tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const roles = useSelector(selectTenantRoles);
    const isLoading = useSelector(selectTenantRolesLoading);
    const error = useSelector(selectTenantRolesError);

    const [editingRole, setEditingRole] = useState(null);
    const [editPermissions, setEditPermissions] = useState(''); // Text area for now

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantRoles({ tenantId }));
        }
        return () => {
            dispatch(clearTenantRoles());
        };
    }, [dispatch, tenantId]);

    const handleEditClick = (role) => {
        setEditingRole(role);
        setEditPermissions(role.permissions.join(', '));
    };

    const handleSavePermissions = async () => {
        if (!editingRole) return;

        // Parse comma separated
        const permissionsArray = editPermissions
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const result = await dispatch(updateRolePermissions({
            tenantId,
            roleId: editingRole._id,
            permissions: permissionsArray
        }));

        if (updateRolePermissions.fulfilled.match(result)) {
            setEditingRole(null);
        }
    };

    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 className="mb-1">School Roles</h3>
                    <div className="text-muted">Manage roles for tenant {tenantId}</div>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate(`/tenants/${tenantId}`)}>
                    Back to Overview
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Table responsive hover className="mb-0">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th>Permissions Count</th>
                            <th>Default?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length === 0 && !isLoading ? (
                            <tr><td colSpan="4" className="text-center text-muted">No roles found</td></tr>
                        ) : (
                            roles.map(role => (
                                <tr key={role._id}>
                                    <td className="fw-semibold">{role.name}</td>
                                    <td>
                                        <Badge bg="secondary">{role.permissions.length} permissions</Badge>
                                    </td>
                                    <td>
                                        {role.isDefault ? <Badge bg="light" text="dark">Default</Badge> : '-'}
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleEditClick(role)}
                                        >
                                            View / Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={!!editingRole} onHide={() => setEditingRole(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Role: {editingRole?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        Enter permissions separated by commas.
                    </Alert>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        value={editPermissions}
                        onChange={e => setEditPermissions(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditingRole(null)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSavePermissions} disabled={isLoading}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SchoolRolesPage;
