import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchTerms,
    createTerm,
    updateTerm,
    setCurrentTerm,
    selectPortalTerms,
    selectPortalTermsLoading,
    selectPortalTermsError,
} from '../../../store/slices/portalTermsSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const TermsPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const terms = useSelector(selectPortalTerms);
    const isLoading = useSelector(selectPortalTermsLoading);
    const error = useSelector(selectPortalTermsError);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        academicYear: '',
        isCurrent: false,
    });

    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchTerms());
    }, [dispatch]);

    const resetForm = () => {
        setFormData({
            name: '',
            startDate: '',
            endDate: '',
            academicYear: '',
            isCurrent: false,
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (term) => {
        setSelectedTerm(term);
        setFormData({
            name: term.name || '',
            startDate: term.startDate ? term.startDate.split('T')[0] : '',
            endDate: term.endDate ? term.endDate.split('T')[0] : '',
            academicYear: term.academicYear || '',
            isCurrent: term.isCurrent || false,
        });
        setShowEdit(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        dispatch(createTerm(formData));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateTerm({ id: selectedTerm._id, data: formData }));
        setShowEdit(false);
    };

    const handleSetCurrent = (term) => {
        dispatch(setCurrentTerm(term._id));
    };

    const handleToggleActive = (term) => {
        dispatch(updateTerm({ id: term._id, data: { isActive: !term.isActive } }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <Container className="py-4" style={{ maxWidth: 1000 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Academic Terms</h3>
                {isAdmin && (
                    <Button variant="primary" onClick={openCreate}>
                        Add Term
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Academic Year</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {terms.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="text-muted text-center">
                                            No terms found
                                        </td>
                                    </tr>
                                ) : (
                                    terms.map(t => (
                                        <tr key={t._id} className={!t.isActive ? 'text-muted' : ''}>
                                            <td className="fw-medium">
                                                {t.name}
                                                {t.isCurrent && (
                                                    <Badge bg="primary" className="ms-2">Current</Badge>
                                                )}
                                            </td>
                                            <td>{t.academicYear}</td>
                                            <td>{formatDate(t.startDate)}</td>
                                            <td>{formatDate(t.endDate)}</td>
                                            <td>
                                                <Badge bg={t.isActive ? 'success' : 'secondary'}>
                                                    {t.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button size="sm" variant="outline-primary" onClick={() => openEdit(t)}>
                                                            Edit
                                                        </Button>
                                                        {!t.isCurrent && t.isActive && (
                                                            <Button size="sm" variant="outline-info" onClick={() => handleSetCurrent(t)}>
                                                                Set Current
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant={t.isActive ? 'outline-secondary' : 'outline-success'}
                                                            onClick={() => handleToggleActive(t)}
                                                        >
                                                            {t.isActive ? 'Deactivate' : 'Activate'}
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Create Modal */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Term</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Term 1, Semester 1"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Academic Year *</Form.Label>
                            <Form.Control
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                placeholder="e.g., 2025-2026"
                                required
                            />
                        </Form.Group>
                        <div className="row g-2 mb-3">
                            <Form.Group className="col-6">
                                <Form.Label>Start Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>End Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </div>
                        <Form.Check
                            type="checkbox"
                            label="Set as current term"
                            checked={formData.isCurrent}
                            onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button type="submit">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Term</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Academic Year *</Form.Label>
                            <Form.Control
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <div className="row g-2 mb-3">
                            <Form.Group className="col-6">
                                <Form.Label>Start Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>End Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default TermsPage;
