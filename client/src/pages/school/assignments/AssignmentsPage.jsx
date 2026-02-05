import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    selectPortalAssignments,
    selectPortalAssignmentsLoading,
    selectPortalAssignmentsError,
} from '../../../store/slices/portalAssignmentsSlice';
import {
    fetchClasses,
    selectPortalClasses,
} from '../../../store/slices/portalClassesSlice';
import {
    fetchSubjects,
    selectPortalSubjects,
} from '../../../store/slices/portalSubjectsSlice';
import {
    fetchTeachers,
    selectPortalTeachers,
} from '../../../store/slices/portalTeachersSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const AssignmentsPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const assignments = useSelector(selectPortalAssignments);
    const classes = useSelector(selectPortalClasses);
    const subjects = useSelector(selectPortalSubjects);
    const teachers = useSelector(selectPortalTeachers);
    const isLoading = useSelector(selectPortalAssignmentsLoading);
    const error = useSelector(selectPortalAssignmentsError);

    const [filterClass, setFilterClass] = useState('');
    const [filterTeacher, setFilterTeacher] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        teacherId: '',
    });

    // Check if user is admin
    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchAssignments());
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchTeachers());
    }, [dispatch]);

    const filteredAssignments = useMemo(() => {
        let result = assignments;
        if (filterClass) {
            result = result.filter(a => a.classId?._id === filterClass);
        }
        if (filterTeacher) {
            result = result.filter(a => a.teacherId?._id === filterTeacher);
        }
        return result;
    }, [assignments, filterClass, filterTeacher]);

    const resetForm = () => {
        setFormData({
            classId: '',
            subjectId: '',
            teacherId: '',
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (assignment) => {
        setSelectedAssignment(assignment);
        setFormData({
            classId: assignment.classId?._id || '',
            subjectId: assignment.subjectId?._id || '',
            teacherId: assignment.teacherId?._id || '',
        });
        setShowEdit(true);
    };

    const openDelete = (assignment) => {
        setSelectedAssignment(assignment);
        setShowDelete(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        dispatch(createAssignment(formData));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateAssignment({ id: selectedAssignment._id, data: { teacherId: formData.teacherId } }));
        setShowEdit(false);
    };

    const handleDelete = () => {
        dispatch(deleteAssignment(selectedAssignment._id));
        setShowDelete(false);
    };

    if (!isAdmin) {
        return (
            <Container className="py-4">
                <Alert variant="warning">Only administrators can manage class-subject assignments.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ maxWidth: 1100 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 className="mb-0">Class-Subject Assignments</h3>
                    <p className="text-muted mb-0">Assign teachers to teach specific subjects in classes</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={openCreate}>
                        New Assignment
                    </Button>
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchAssignments())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <div className="d-flex gap-2 mb-3">
                        <Form.Select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            style={{ maxWidth: 200 }}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </Form.Select>
                        <Form.Select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            style={{ maxWidth: 200 }}
                        >
                            <option value="">All Teachers</option>
                            {teachers.map(t => (
                                <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </Form.Select>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-muted text-center">
                                            No assignments found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssignments.map(a => (
                                        <tr key={a._id}>
                                            <td>
                                                <Badge bg="primary">{a.classId?.name || 'Unknown'}</Badge>
                                            </td>
                                            <td className="fw-medium">{a.subjectId?.name || 'Unknown'}</td>
                                            <td>
                                                {a.teacherId ? (
                                                    `${a.teacherId.firstName} ${a.teacherId.lastName}`
                                                ) : (
                                                    <span className="text-muted">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button size="sm" variant="outline-primary" onClick={() => openEdit(a)}>
                                                        Change Teacher
                                                    </Button>
                                                    <Button size="sm" variant="outline-danger" onClick={() => openDelete(a)}>
                                                        Remove
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
                    <Modal.Title>New Assignment</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Class *</Form.Label>
                            <Form.Select
                                value={formData.classId}
                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.filter(c => c.isActive).map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Subject *</Form.Label>
                            <Form.Select
                                value={formData.subjectId}
                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.filter(s => s.isActive !== false).map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Teacher *</Form.Label>
                            <Form.Select
                                value={formData.teacherId}
                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                required
                            >
                                <option value="">Select Teacher</option>
                                {teachers.filter(t => t.isActive).map(t => (
                                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button type="submit">Create Assignment</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Teacher</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdit}>
                    <Modal.Body>
                        <div className="mb-3 p-2 bg-light rounded">
                            <strong>Class:</strong> {selectedAssignment?.classId?.name}<br />
                            <strong>Subject:</strong> {selectedAssignment?.subjectId?.name}
                        </div>
                        <Form.Group>
                            <Form.Label>Teacher *</Form.Label>
                            <Form.Select
                                value={formData.teacherId}
                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                required
                            >
                                <option value="">Select Teacher</option>
                                {teachers.filter(t => t.isActive).map(t => (
                                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                                ))}
                            </Form.Select>
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
                    <Modal.Title>Remove Assignment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Remove this assignment?</p>
                    <div className="p-2 bg-light rounded">
                        <strong>Class:</strong> {selectedAssignment?.classId?.name}<br />
                        <strong>Subject:</strong> {selectedAssignment?.subjectId?.name}<br />
                        <strong>Teacher:</strong> {selectedAssignment?.teacherId?.firstName} {selectedAssignment?.teacherId?.lastName}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Remove</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AssignmentsPage;
