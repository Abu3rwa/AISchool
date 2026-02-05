import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Modal, Table } from 'react-bootstrap';
import api from '../../utils/api';
import {
    clearCurrentTenant,
    fetchTenantById,
    selectCurrentTenant,
    selectTenantsError,
    selectTenantsLoading,
} from '../../store/slices/tenantSlice';

const TenantDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const tenant = useSelector(selectCurrentTenant);
    const isLoading = useSelector(selectTenantsLoading);
    const error = useSelector(selectTenantsError);

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTempPassword, setResetTempPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        if (!id) return;
        dispatch(fetchTenantById(id));

        return () => {
            dispatch(clearCurrentTenant());
        };
    }, [dispatch, id]);

    const handleResetAdminPassword = async () => {
        try {
            setIsResetting(true);
            setResetError('');
            setResetTempPassword('');

            const res = await api.post(`/provider/tenants/${id}/admin/reset-password`);
            setResetTempPassword(res.data?.tempPassword || '');
            setShowResetModal(true);
        } catch (e) {
            setResetError(e.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsResetting(false);
        }
    };

    const statusVariant = (status) => {
        switch (status) {
            case 'active':
                return 'success';

            case 'inactive':
                return 'secondary';
            case 'suspended':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 className="mb-1">Tenant Details</h3>
                    <div className="text-muted">{id}</div>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate('/tenants')}>Back</Button>
            </div>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            {!tenant && !isLoading ? (
                <Alert variant="warning">Tenant not found.</Alert>
            ) : null}

            {tenant ? (
                <>
                    <Card className="mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div>
                                    <div className="fw-semibold" style={{ fontSize: 18 }}>{tenant.name}</div>
                                    <div className="text-muted">{tenant.slug}</div>
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <Badge bg={statusVariant(tenant.status)}>{tenant.status}</Badge>
                                    <Badge bg="info">{tenant.subscriptionPlan || 'free'}</Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Body>
                            <div className="fw-semibold mb-2">Management</div>
                            <div className="d-flex gap-2 flex-wrap">
                                <Button variant="outline-primary" onClick={() => navigate(`/tenants/${id}/users`)}>Users</Button>
                                <Button variant="outline-primary" onClick={() => navigate(`/tenants/${id}/roles`)}>Roles & Permissions</Button>
                                <Button variant="outline-primary" onClick={() => navigate(`/tenants/${id}/metrics`)}>Usage Metrics</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Body>
                            <div className="fw-semibold mb-2">School Admin Credentials</div>
                            {tenant.adminUser ? (
                                <Table responsive bordered className="mb-0">
                                    <tbody>
                                        <tr>
                                            <th style={{ width: 220 }}>Admin Name</th>
                                            <td>{tenant.adminUser.firstName} {tenant.adminUser.lastName}</td>
                                        </tr>
                                        <tr>
                                            <th>Admin Email</th>
                                            <td>{tenant.adminUser.email}</td>
                                        </tr>
                                        <tr>
                                            <th>Password</th>
                                            <td className="text-muted">
                                                <em>Hidden for security. Use "Reset Password" if needed.</em>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="warning" className="mb-0">
                                    No Admin user found for this school.
                                </Alert>
                            )}

                            <div className="d-flex gap-2 flex-wrap mt-3">
                                <Button
                                    variant="outline-danger"
                                    onClick={handleResetAdminPassword}
                                    disabled={isResetting}
                                >
                                    Reset Password
                                </Button>
                                {resetError ? <div className="text-danger">{resetError}</div> : null}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <div className="fw-semibold mb-2">School information</div>

                            <Table responsive bordered className="mb-0">
                                <tbody>
                                    <tr>
                                        <th style={{ width: 220 }}>Name</th>
                                        <td>{tenant.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Slug</th>
                                        <td>{tenant.slug}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            <Badge bg={statusVariant(tenant.status)}>{tenant.status}</Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Plan</th>
                                        <td>{tenant.subscriptionPlan || 'free'}</td>
                                    </tr>
                                    <tr>
                                        <th>Timezone</th>
                                        <td>{tenant.settings?.timezone || 'UTC'}</td>
                                    </tr>
                                    <tr>
                                        <th>Currency</th>
                                        <td>{tenant.settings?.currency || 'USD'}</td>
                                    </tr>
                                    <tr>
                                        <th>Primary color</th>
                                        <td>{tenant.settings?.primaryColor || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th>Logo URL</th>
                                        <td className="text-break">{tenant.settings?.logoUrl || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th>Created</th>
                                        <td>{tenant.createdAt ? new Date(tenant.createdAt).toLocaleString() : '-'}</td>
                                    </tr>
                                    <tr>
                                        <th>Updated</th>
                                        <td>{tenant.updatedAt ? new Date(tenant.updatedAt).toLocaleString() : '-'}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </>
            ) : null}

            <Modal
                show={showResetModal}
                onHide={() => setShowResetModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>New temporary password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-2">
                        Copy this password now. For security, it will not be shown again.
                    </div>
                    <div className="p-2 bg-light border rounded" style={{ fontFamily: 'monospace' }}>
                        {resetTempPassword || '---'}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" variant="primary" onClick={() => setShowResetModal(false)}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TenantDetailsPage;