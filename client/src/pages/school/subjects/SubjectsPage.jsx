import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchSubjects,
    createSubject,
    updateSubject,
    setSubjectStatus,
    deleteSubject,
    selectPortalSubjects,
    selectPortalSubjectsLoading,
    selectPortalSubjectsError,
} from '../../../store/slices/portalSubjectsSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const SubjectsPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const subjects = useSelector(selectPortalSubjects);
    const isLoading = useSelector(selectPortalSubjectsLoading);
    const error = useSelector(selectPortalSubjectsError);

    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
    });

    // Check if user is admin
    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchSubjects());
    }, [dispatch]);

    const filteredSubjects = useMemo(() => {
        if (!search.trim()) return subjects;
        const q = search.toLowerCase();
        return subjects.filter(s =>
            s.name?.toLowerCase().includes(q) ||
            s.code?.toLowerCase().includes(q)
        );
    }, [subjects, search]);

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (subject) => {
        setSelectedSubject(subject);
        setFormData({
            name: subject.name || '',
            code: subject.code || '',
        });
        setShowEdit(true);
    };

    const openDelete = (subject) => {
        setSelectedSubject(subject);
        setShowDelete(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        dispatch(createSubject(formData));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateSubject({ id: selectedSubject._id, data: formData }));
        setShowEdit(false);
    };

    const handleDelete = () => {
        dispatch(deleteSubject(selectedSubject._id));
        setShowDelete(false);
    };

    const handleStatusToggle = (subject) => {
        dispatch(setSubjectStatus({ id: subject._id, isActive: !subject.isActive }));
    };

    return (
        <Container className="py-4" style={{ maxWidth: 900 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Subjects</h3>
                <div className="d-flex gap-2">
                    {isAdmin && (
                        <Button variant="primary" onClick={openCreate}>
                            Add Subject
                        </Button>
                    )}
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchSubjects())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <Form.Control
                        placeholder="Search subjects..."
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
                                    <th>Code</th>
                                    <th>Status</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3} className="text-muted text-center">
                                            No subjects found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubjects.map(s => (
                                        <tr key={s._id}>
                                            <td className="fw-medium">{s.name}</td>
                                            <td className="text-muted">{s.code || '-'}</td>
                                            <td>
                                                <Badge bg={s.isActive !== false ? 'success' : 'secondary'}>
                                                    {s.isActive !== false ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button size="sm" variant="outline-primary" onClick={() => openEdit(s)}>
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={s.isActive !== false ? 'outline-secondary' : 'outline-success'}
                                                            onClick={() => handleStatusToggle(s)}
                                                        >
                                                            {s.isActive !== false ? 'Deactivate' : 'Activate'}
                                                        </Button>
                                                        <Button size="sm" variant="outline-danger" onClick={() => openDelete(s)}>
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
                    <Modal.Title>Add Subject</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Subject Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mathematics"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Subject Code</Form.Label>
                            <Form.Control
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., MATH101"
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
                    <Modal.Title>Edit Subject</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdit}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Subject Name *</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Subject Code</Form.Label>
                            <Form.Control
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </Form.Group>
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
                    <Modal.Title>Delete Subject</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <strong>{selectedSubject?.name}</strong>?</p>
                    <Alert variant="warning" className="mb-0">
                        This will remove all teacher assignments for this subject.
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

export default SubjectsPage;
