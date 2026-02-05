import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchGradeTypes,
    createGradeType,
    updateGradeType,
    deleteGradeType,
    selectPortalGradeTypes,
    selectPortalGradeTypesLoading,
    selectPortalGradeTypesError,
} from '../../../store/slices/portalGradeTypesSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const GradeTypesPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const gradeTypes = useSelector(selectPortalGradeTypes);
    const isLoading = useSelector(selectPortalGradeTypesLoading);
    const error = useSelector(selectPortalGradeTypesError);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({ name: '', weight: '', maxScore: '100' });

    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchGradeTypes());
    }, [dispatch]);

    const resetForm = () => {
        setFormData({ name: '', weight: '', maxScore: '100' });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (type) => {
        setSelectedType(type);
        setFormData({
            name: type.name || '',
            weight: type.weight ? (type.weight * 100).toString() : '',
            maxScore: type.maxScore?.toString() || '100',
        });
        setShowEdit(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            weight: formData.weight ? parseFloat(formData.weight) / 100 : null,
            maxScore: parseInt(formData.maxScore) || 100,
        };
        dispatch(createGradeType(data));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            weight: formData.weight ? parseFloat(formData.weight) / 100 : null,
            maxScore: parseInt(formData.maxScore) || 100,
        };
        dispatch(updateGradeType({ id: selectedType._id, data }));
        setShowEdit(false);
    };

    const handleToggleActive = (type) => {
        dispatch(updateGradeType({ id: type._id, data: { isActive: !type.isActive } }));
    };

    const handleDelete = (type) => {
        if (window.confirm(`Deactivate "${type.name}"?`)) {
            dispatch(deleteGradeType(type._id));
        }
    };

    const totalWeight = gradeTypes
        .filter(t => t.isActive && t.weight)
        .reduce((sum, t) => sum + t.weight, 0);

    return (
        <Container className="py-4" style={{ maxWidth: 900 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Grade Types</h3>
                {isAdmin && (
                    <Button variant="primary" onClick={openCreate}>
                        Add Grade Type
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {totalWeight > 0 && (
                <Alert variant={Math.abs(totalWeight - 1) < 0.01 ? 'success' : 'warning'}>
                    Total weight: <strong>{(totalWeight * 100).toFixed(0)}%</strong>
                    {Math.abs(totalWeight - 1) >= 0.01 && ' (should equal 100%)'}
                </Alert>
            )}

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
                                    <th>Weight</th>
                                    <th>Max Score</th>
                                    <th>Status</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {gradeTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 5 : 4} className="text-muted text-center">
                                            No grade types found
                                        </td>
                                    </tr>
                                ) : (
                                    gradeTypes.map(t => (
                                        <tr key={t._id} className={!t.isActive ? 'text-muted' : ''}>
                                            <td className="fw-medium">{t.name}</td>
                                            <td>{t.weight ? `${(t.weight * 100).toFixed(0)}%` : '-'}</td>
                                            <td>{t.maxScore}</td>
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
                    <Modal.Title>Add Grade Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Classwork, Test, Exam"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Weight (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="100"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                placeholder="e.g., 20 for 20%"
                            />
                            <Form.Text className="text-muted">
                                Percentage weight for final grade calculation
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Default Max Score</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.maxScore}
                                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                            />
                        </Form.Group>
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
                    <Modal.Title>Edit Grade Type</Modal.Title>
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
                            <Form.Label>Weight (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="100"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Default Max Score</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.maxScore}
                                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                            />
                        </Form.Group>
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

export default GradeTypesPage;
