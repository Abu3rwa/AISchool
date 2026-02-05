import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchTeachers,
    createTeacher,
    updateTeacher,
    setTeacherStatus,
    resetTeacherPassword,
    deleteTeacher,
    clearTempPassword,
    selectPortalTeachers,
    selectTempPassword,
    selectPortalTeachersLoading,
    selectPortalTeachersError,
} from '../../../store/slices/portalTeachersSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const TeachersPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const teachers = useSelector(selectPortalTeachers);
    const tempPassword = useSelector(selectTempPassword);
    const isLoading = useSelector(selectPortalTeachersLoading);
    const error = useSelector(selectPortalTeachersError);

    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    });

    // Check if user is admin
    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchTeachers());
    }, [dispatch]);

    // Show password modal when temp password is set
    useEffect(() => {
        if (tempPassword) {
            setShowPassword(true);
        }
    }, [tempPassword]);

    const filteredTeachers = useMemo(() => {
        if (!search.trim()) return teachers;
        const q = search.toLowerCase();
        return teachers.filter(t =>
            `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
            t.email?.toLowerCase().includes(q)
        );
    }, [teachers, search]);

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setFormData({
            firstName: teacher.firstName || '',
            lastName: teacher.lastName || '',
            email: teacher.email || '',
            phoneNumber: teacher.phoneNumber || '',
        });
        setShowEdit(true);
    };

    const openDelete = (teacher) => {
        setSelectedTeacher(teacher);
        setShowDelete(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        dispatch(createTeacher(formData));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        const { firstName, lastName, phoneNumber } = formData;
        dispatch(updateTeacher({ id: selectedTeacher._id, data: { firstName, lastName, phoneNumber } }));
        setShowEdit(false);
    };

    const handleDelete = () => {
        dispatch(deleteTeacher(selectedTeacher._id));
        setShowDelete(false);
    };

    const handleStatusToggle = (teacher) => {
        dispatch(setTeacherStatus({ id: teacher._id, isActive: !teacher.isActive }));
    };

    const handleResetPassword = (teacher) => {
        setSelectedTeacher(teacher);
        dispatch(resetTeacherPassword(teacher._id));
    };

    const closePasswordModal = () => {
        setShowPassword(false);
        dispatch(clearTempPassword());
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(tempPassword);
    };

    if (!isAdmin) {
        return (
            <Container className="py-4">
                <Alert variant="warning">Only administrators can manage teachers.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ maxWidth: 1100 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Teachers</h3>
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={openCreate}>
                        Add Teacher
                    </Button>
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchTeachers())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <Form.Control
                        placeholder="Search by name or email..."
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
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-muted text-center">
                                            No teachers found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map(t => (
                                        <tr key={t._id}>
                                            <td className="fw-medium">{t.firstName} {t.lastName}</td>
                                            <td className="text-muted">{t.email}</td>
                                            <td>{t.phoneNumber || '-'}</td>
                                            <td>
                                                <Badge bg={t.isActive ? 'success' : 'secondary'}>
                                                    {t.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1 flex-wrap">
                                                    <Button size="sm" variant="outline-primary" onClick={() => openEdit(t)}>
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline-warning" onClick={() => handleResetPassword(t)}>
                                                        Reset Password
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={t.isActive ? 'outline-secondary' : 'outline-success'}
                                                        onClick={() => handleStatusToggle(t)}
                                                    >
                                                        {t.isActive ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    <Button size="sm" variant="outline-danger" onClick={() => openDelete(t)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
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
                    <Modal.Title>Add Teacher</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <div className="row g-2">
                            <Form.Group className="col-6">
                                <Form.Label>First Name *</Form.Label>
                                <Form.Control
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Last Name *</Form.Label>
                                <Form.Control
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </div>
                        <Form.Group className="mt-2">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </Form.Group>
                        <Alert variant="info" className="mt-3 mb-0">
                            A temporary password will be generated and shown once after creation.
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button type="submit">Create Teacher</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Teacher</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdit}>
                    <Modal.Body>
                        <div className="row g-2">
                            <Form.Group className="col-6">
                                <Form.Label>First Name *</Form.Label>
                                <Form.Control
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Last Name *</Form.Label>
                                <Form.Control
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </div>
                        <Form.Group className="mt-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                disabled
                                className="bg-light"
                            />
                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                    <Modal.Title>Delete Teacher</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <strong>{selectedTeacher?.firstName} {selectedTeacher?.lastName}</strong>?</p>
                    <Alert variant="warning" className="mb-0">
                        This will also remove all their class-subject assignments.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Temp Password Modal */}
            <Modal show={showPassword} onHide={closePasswordModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Temporary Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning" className="mb-3">
                        <strong>Important:</strong> This password will only be shown once. Make sure to copy it now.
                    </Alert>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Control
                            value={tempPassword || ''}
                            readOnly
                            className="font-monospace"
                        />
                        <Button variant="outline-primary" onClick={copyToClipboard}>
                            Copy
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={closePasswordModal}>Done</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TeachersPage;
