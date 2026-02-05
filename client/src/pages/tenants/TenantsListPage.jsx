import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table } from 'react-bootstrap';
import {
    createTenant,
    updateTenant,
    deleteTenant,
    fetchTenants,
    selectTenants,
    selectTenantsError,
    selectTenantsLoading,
    updateTenantStatus,
} from '../../store/slices/tenantSlice';

const TenantsListPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const tenants = useSelector(selectTenants);
    const isLoading = useSelector(selectTenantsLoading);
    const error = useSelector(selectTenantsError);

    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [tenantName, setTenantName] = useState('');
    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editPlan, setEditPlan] = useState('free');

    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState('');

    useEffect(() => {
        dispatch(fetchTenants());
    }, [dispatch]);

    const filteredTenants = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return tenants;
        return tenants.filter((t) => {
            const name = (t.name || '').toLowerCase();
            const slug = (t.slug || '').toLowerCase();
            return name.includes(q) || slug.includes(q);
        });
    }, [tenants, search]);

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

    const handleCreate = (e) => {
        e.preventDefault();
        dispatch(
            createTenant({
                tenant: { name: tenantName },
                adminUserData: {
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    email: adminEmail,
                },
            })
        );
        setTenantName('');
        setAdminFirstName('');
        setAdminLastName('');
        setAdminEmail('');
        setShowCreate(false);
    };

    const openEdit = (tenant) => {
        setEditId(tenant._id);
        setEditName(tenant.name || '');
        setEditSlug(tenant.slug || '');
        setEditPlan(tenant.subscriptionPlan || 'free');
        setShowEdit(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        dispatch(
            updateTenant({
                id: editId,
                updates: {
                    name: editName,
                    slug: editSlug,
                    subscriptionPlan: editPlan,
                },
            })
        );
        setShowEdit(false);
    };

    const openDelete = (tenant) => {
        setDeleteId(tenant._id);
        setDeleteName(tenant.name || '');
        setShowDelete(true);
    };

    const confirmDelete = () => {
        dispatch(deleteTenant(deleteId));
        setShowDelete(false);
    };

    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Tenants</h3>
                <div className="d-flex gap-2">
                    <Button
                        variant={showCreate ? 'secondary' : 'primary'}
                        onClick={() => setShowCreate((v) => !v)}
                    >
                        {showCreate ? 'Close' : 'Add Tenant'}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchTenants())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            {showCreate ? (
                <Card className="mb-3">
                    <Card.Body>
                        <Form onSubmit={handleCreate}>
                            <div className="fw-semibold mb-2">Create tenant</div>

                            <Form.Group className="mb-2" controlId="tenantName">
                                <Form.Label className="text-muted">Tenant name</Form.Label>
                                <Form.Control value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
                            </Form.Group>

                            <div className="fw-semibold mt-3 mb-2">First school admin</div>

                            <div className="d-grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <Form.Group controlId="adminFirstName">
                                    <Form.Label className="text-muted">First name</Form.Label>
                                    <Form.Control value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} required />
                                </Form.Group>

                                <Form.Group controlId="adminLastName">
                                    <Form.Label className="text-muted">Last name</Form.Label>
                                    <Form.Control value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)} required />
                                </Form.Group>
                            </div>

                            <Form.Group className="mt-2 mb-3" controlId="adminEmail">
                                <Form.Label className="text-muted">Email</Form.Label>
                                <Form.Control type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <Button type="submit" disabled={isLoading}>Create</Button>
                                <Button type="button" variant="outline-secondary" onClick={() => setShowCreate(false)} disabled={isLoading}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            ) : null}

            <Card>
                <Card.Body>
                    <Form.Group className="mb-3" controlId="search">
                        <Form.Control
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tenants by name or slug..."
                        />
                    </Form.Group>

                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Plan</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-muted">No tenants</td>
                                </tr>
                            ) : (
                                filteredTenants.map((t) => (
                                    <tr key={t._id}>
                                        <td>
                                            <Button
                                                variant="link"
                                                className="p-0"
                                                onClick={() => navigate(`/tenants/${t._id}`)}
                                            >
                                                {t.name}
                                            </Button>
                                        </td>
                                        <td className="text-muted">{t.slug}</td>
                                        <td>{t.subscriptionPlan || 'free'}</td>
                                        <td>
                                            <Badge bg={statusVariant(t.status)}>{t.status}</Badge>
                                        </td>
                                        <td className="text-muted">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <div className="d-flex gap-2 flex-wrap align-items-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => openEdit(t)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-success"
                                                    onClick={() => dispatch(updateTenantStatus({ id: t._id, status: 'active' }))}
                                                >
                                                    Active
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => dispatch(updateTenantStatus({ id: t._id, status: 'inactive' }))}
                                                >
                                                    Inactive
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => dispatch(updateTenantStatus({ id: t._id, status: 'suspended' }))}
                                                >
                                                    Suspend
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => openDelete(t)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit tenant</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitEdit}>
                    <Modal.Body>
                        <Form.Group className="mb-2" controlId="editName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control value={editName} onChange={(e) => setEditName(e.target.value)} required />
                        </Form.Group>

                        <Form.Group className="mb-2" controlId="editSlug">
                            <Form.Label>Slug</Form.Label>
                            <Form.Control value={editSlug} onChange={(e) => setEditSlug(e.target.value)} required />
                        </Form.Group>

                        <Form.Group className="mb-2" controlId="editPlan">
                            <Form.Label>Plan</Form.Label>
                            <Form.Select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}>
                                <option value="free">free</option>
                                <option value="basic">basic</option>
                                <option value="premium">premium</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => setShowEdit(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete tenant</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Delete <strong>{deleteName}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" variant="secondary" onClick={() => setShowDelete(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={confirmDelete} disabled={isLoading}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TenantsListPage;
