import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchClasses,
    createClass,
    updateClass,
    setClassStatus,
    deleteClass,
    selectPortalClasses,
    selectPortalClassesLoading,
    selectPortalClassesError,
} from '../../../store/slices/portalClassesSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const ClassesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectSchoolUser);
    const classes = useSelector(selectPortalClasses);
    const isLoading = useSelector(selectPortalClassesLoading);
    const error = useSelector(selectPortalClassesError);

    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        gradeLevel: '',
        section: '',
        academicYear: '',
        room: '',
    });

    // Check if user is admin
    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    const filteredClasses = useMemo(() => {
        if (!search.trim()) return classes;
        const q = search.toLowerCase();
        return classes.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.gradeLevel?.toLowerCase().includes(q) ||
            c.section?.toLowerCase().includes(q)
        );
    }, [classes, search]);

    const resetForm = () => {
        setFormData({
            name: '',
            gradeLevel: '',
            section: '',
            academicYear: '',
            room: '',
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (cls) => {
        setSelectedClass(cls);
        setFormData({
            name: cls.name || '',
            gradeLevel: cls.gradeLevel || '',
            section: cls.section || '',
            academicYear: cls.academicYear || '',
            room: cls.room || '',
        });
        setShowEdit(true);
    };

    const openDelete = (cls) => {
        setSelectedClass(cls);
        setShowDelete(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        dispatch(createClass(formData));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateClass({ id: selectedClass._id, data: formData }));
        setShowEdit(false);
    };

    const handleDelete = () => {
        dispatch(deleteClass(selectedClass._id));
        setShowDelete(false);
    };

    const handleStatusToggle = (cls) => {
        dispatch(setClassStatus({ id: cls._id, isActive: !cls.isActive }));
    };

    return (
        <Container className="py-4" style={{ maxWidth: 1100 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Classes</h3>
                <div className="d-flex gap-2">
                    {isAdmin && (
                        <Button variant="primary" onClick={openCreate}>
                            Add Class
                        </Button>
                    )}
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchClasses())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <Form.Control
                        placeholder="Search classes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-3"
                        style={{ maxWidth: 300 }}
                    />

                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Grade Level</th>
                                    <th>Section</th>
                                    <th>Academic Year</th>
                                    <th>Room</th>
                                    <th>Students</th>
                                    <th>Status</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 8 : 7} className="text-muted text-center">
                                            No classes found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClasses.map(c => (
                                        <tr key={c._id}>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    className="p-0 fw-medium"
                                                    onClick={() => navigate(`/portal/classes/${c._id}`)}
                                                >
                                                    {c.name}
                                                </Button>
                                            </td>
                                            <td>{c.gradeLevel || '-'}</td>
                                            <td>{c.section || '-'}</td>
                                            <td>{c.academicYear || '-'}</td>
                                            <td>{c.room || '-'}</td>
                                            <td>
                                                <Badge bg="info">{c.studentCount || 0}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg={c.isActive ? 'success' : 'secondary'}>
                                                    {c.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button size="sm" variant="outline-primary" onClick={() => openEdit(c)}>
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={c.isActive ? 'outline-secondary' : 'outline-success'}
                                                            onClick={() => handleStatusToggle(c)}
                                                        >
                                                            {c.isActive ? 'Deactivate' : 'Activate'}
                                                        </Button>
                                                        <Button size="sm" variant="outline-danger" onClick={() => openDelete(c)}>
                                                            Delete
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
                    <Modal.Title>Add Class</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Class Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Grade 10A"
                                required
                            />
                        </Form.Group>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Grade Level</Form.Label>
                                <Form.Control
                                    value={formData.gradeLevel}
                                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                                    placeholder="e.g., 10"
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Section</Form.Label>
                                <Form.Control
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    placeholder="e.g., A"
                                />
                            </Form.Group>
                        </div>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Academic Year</Form.Label>
                                <Form.Control
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    placeholder="e.g., 2025-2026"
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Room</Form.Label>
                                <Form.Control
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                    placeholder="e.g., Room 101"
                                />
                            </Form.Group>
                        </div>
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
                    <Modal.Title>Edit Class</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdit}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Class Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Grade Level</Form.Label>
                                <Form.Control
                                    value={formData.gradeLevel}
                                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Section</Form.Label>
                                <Form.Control
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Academic Year</Form.Label>
                                <Form.Control
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Room</Form.Label>
                                <Form.Control
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
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

            {/* Delete Modal */}
            <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <strong>{selectedClass?.name}</strong>?</p>
                    <Alert variant="warning" className="mb-0">
                        Students in this class will become unassigned. Teacher assignments will be removed.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ClassesPage;
