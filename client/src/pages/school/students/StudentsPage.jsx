import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchStudents,
    createStudent,
    updateStudent,
    setStudentStatus,
    deleteStudent,
    selectPortalStudents,
    selectPortalStudentsLoading,
    selectPortalStudentsError,
} from '../../../store/slices/portalStudentsSlice';
import {
    fetchClasses,
    selectPortalClasses,
} from '../../../store/slices/portalClassesSlice';
import {
    fetchGradesByStudent,
    selectPortalGrades,
    selectPortalGradesLoading,
} from '../../../store/slices/portalGradesSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const StudentsPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const students = useSelector(selectPortalStudents);
    const classes = useSelector(selectPortalClasses);
    const isLoading = useSelector(selectPortalStudentsLoading);
    const error = useSelector(selectPortalStudentsError);

    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showGrades, setShowGrades] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    // Grades state
    const studentGrades = useSelector(selectPortalGrades);
    const gradesLoading = useSelector(selectPortalGradesLoading);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        classId: '',
        studentIdNumber: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        guardianName: '',
        guardianEmail: '',
        guardianPhone: '',
        secondaryGuardianName: '',
        secondaryGuardianEmail: '',
        secondaryGuardianPhone: '',
    });

    // Check if user is admin
    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchStudents());
        dispatch(fetchClasses());
    }, [dispatch]);

    const filteredStudents = useMemo(() => {
        let result = students;

        if (filterClass) {
            result = result.filter(s => s.classId?._id === filterClass);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                s.studentIdNumber?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [students, search, filterClass]);

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            classId: '',
            studentIdNumber: '',
            email: '',
            gender: '',
            dateOfBirth: '',
            guardianName: '',
            guardianEmail: '',
            guardianPhone: '',
            secondaryGuardianName: '',
            secondaryGuardianEmail: '',
            secondaryGuardianPhone: '',
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (student) => {
        setSelectedStudent(student);
        setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            classId: student.classId?._id || '',
            studentIdNumber: student.studentIdNumber || '',
            email: student.email || '',
            gender: student.gender || '',
            dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
            guardianName: student.guardianName || '',
            guardianEmail: student.guardianEmail || '',
            guardianPhone: student.guardianPhone || '',
            secondaryGuardianName: student.secondaryGuardianName || '',
            secondaryGuardianEmail: student.secondaryGuardianEmail || '',
            secondaryGuardianPhone: student.secondaryGuardianPhone || '',
        });
        setShowEdit(true);
    };

    const openDelete = (student) => {
        setSelectedStudent(student);
        setShowDelete(true);
    };

    const openGrades = (student) => {
        if (!student?._id) {
            console.error('Student ID is missing');
            return;
        }
        setSelectedStudent(student);
        dispatch(fetchGradesByStudent({ studentId: student._id }));
        setShowGrades(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const data = { ...formData };
        if (!data.classId) delete data.classId;
        if (!data.dateOfBirth) delete data.dateOfBirth;
        dispatch(createStudent(data));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        const data = { ...formData };
        if (!data.classId) data.classId = null;
        if (!data.dateOfBirth) data.dateOfBirth = null;
        dispatch(updateStudent({ id: selectedStudent._id, data }));
        setShowEdit(false);
    };

    const handleDelete = () => {
        dispatch(deleteStudent(selectedStudent._id));
        setShowDelete(false);
    };

    const handleStatusToggle = (student) => {
        dispatch(setStudentStatus({ id: student._id, isActive: !student.isActive }));
    };

    return (
        <Container className="py-4" style={{ maxWidth: 1100 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Students</h3>
                <div className="d-flex gap-2">
                    {isAdmin && (
                        <Button variant="primary" onClick={openCreate}>
                            Add Student
                        </Button>
                    )}
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchStudents())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <div className="d-flex gap-2 mb-3">
                        <Form.Control
                            placeholder="Search by name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ maxWidth: 300 }}
                        />
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
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Student ID</th>
                                    <th>Class</th>
                                    <th>Guardian Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-muted text-center">
                                            No students found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map(s => (
                                        <tr key={s._id}>
                                            <td className="fw-medium">{s.firstName} {s.lastName}</td>
                                            <td className="text-muted">{s.studentIdNumber || '-'}</td>
                                            <td>{s.classId?.name || <span className="text-muted">Unassigned</span>}</td>
                                            <td>
                                                {s.guardianEmail ? (
                                                    <span title={s.guardianName}>{s.guardianEmail}</span>
                                                ) : <span className="text-muted">No email</span>}
                                            </td>
                                            <td>
                                                <Badge bg={s.isActive ? 'success' : 'secondary'}>
                                                    {s.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button size="sm" variant="outline-info" onClick={() => openGrades(s)}>
                                                        Grades
                                                    </Button>
                                                    {isAdmin && (
                                                        <>
                                                            <Button size="sm" variant="outline-primary" onClick={() => openEdit(s)}>
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={s.isActive ? 'outline-secondary' : 'outline-success'}
                                                                onClick={() => handleStatusToggle(s)}
                                                            >
                                                                {s.isActive ? 'Deactivate' : 'Activate'}
                                                            </Button>
                                                            <Button size="sm" variant="outline-danger" onClick={() => openDelete(s)}>
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
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
                    <Modal.Title>Add Student</Modal.Title>
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
                            <Form.Label>Class</Form.Label>
                            <Form.Select
                                value={formData.classId}
                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Student ID</Form.Label>
                                <Form.Control
                                    value={formData.studentIdNumber}
                                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Gender</Form.Label>
                                <Form.Select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <Form.Group className="mt-2">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Student Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="student@email.com (optional)"
                            />
                        </Form.Group>

                        <hr className="my-3" />
                        <div className="fw-semibold mb-2">Primary Guardian</div>
                        <div className="row g-2">
                            <Form.Group className="col-12">
                                <Form.Label>Guardian Name</Form.Label>
                                <Form.Control
                                    value={formData.guardianName}
                                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Guardian Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.guardianEmail}
                                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                                    placeholder="parent@email.com"
                                />
                                <Form.Text className="text-muted">Required for notifications</Form.Text>
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Guardian Phone</Form.Label>
                                <Form.Control
                                    value={formData.guardianPhone}
                                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                />
                            </Form.Group>
                        </div>

                        <hr className="my-3" />
                        <div className="fw-semibold mb-2">Secondary Guardian (Optional)</div>
                        <div className="row g-2">
                            <Form.Group className="col-12">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    value={formData.secondaryGuardianName}
                                    onChange={(e) => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.secondaryGuardianEmail}
                                    onChange={(e) => setFormData({ ...formData, secondaryGuardianEmail: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    value={formData.secondaryGuardianPhone}
                                    onChange={(e) => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
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
                    <Modal.Title>Edit Student</Modal.Title>
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
                            <Form.Label>Class</Form.Label>
                            <Form.Select
                                value={formData.classId}
                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Student ID</Form.Label>
                                <Form.Control
                                    value={formData.studentIdNumber}
                                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Gender</Form.Label>
                                <Form.Select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <Form.Group className="mt-2">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Student Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="student@email.com (optional)"
                            />
                        </Form.Group>

                        <hr className="my-3" />
                        <div className="fw-semibold mb-2">Primary Guardian</div>
                        <div className="row g-2">
                            <Form.Group className="col-12">
                                <Form.Label>Guardian Name</Form.Label>
                                <Form.Control
                                    value={formData.guardianName}
                                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Guardian Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.guardianEmail}
                                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                                    placeholder="parent@email.com"
                                />
                                <Form.Text className="text-muted">Required for notifications</Form.Text>
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Guardian Phone</Form.Label>
                                <Form.Control
                                    value={formData.guardianPhone}
                                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                />
                            </Form.Group>
                        </div>

                        <hr className="my-3" />
                        <div className="fw-semibold mb-2">Secondary Guardian (Optional)</div>
                        <div className="row g-2">
                            <Form.Group className="col-12">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    value={formData.secondaryGuardianName}
                                    onChange={(e) => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                        <div className="row g-2 mt-1">
                            <Form.Group className="col-6">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.secondaryGuardianEmail}
                                    onChange={(e) => setFormData({ ...formData, secondaryGuardianEmail: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-6">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    value={formData.secondaryGuardianPhone}
                                    onChange={(e) => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
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
                    <Modal.Title>Delete Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Grades Modal */}
            <Modal show={showGrades} onHide={() => setShowGrades(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Grades - {selectedStudent?.firstName} {selectedStudent?.lastName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {gradesLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : studentGrades.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No grades recorded for this student
                        </div>
                    ) : (
                        <Table responsive hover size="sm">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Score</th>
                                    <th>%</th>
                                    <th>Grade</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentGrades.map(g => (
                                    <tr key={g._id}>
                                        <td>{g.subjectId?.name || '-'}</td>
                                        <td>
                                            <Badge bg="secondary" className="fw-normal">
                                                {g.gradeTypeId?.name || '-'}
                                            </Badge>
                                        </td>
                                        <td>{g.title || '-'}</td>
                                        <td className="fw-medium">{g.score}/{g.maxScore}</td>
                                        <td>{g.percentage?.toFixed(1)}%</td>
                                        <td>
                                            <Badge bg={
                                                g.percentage >= 90 ? 'success' :
                                                g.percentage >= 80 ? 'primary' :
                                                g.percentage >= 70 ? 'info' :
                                                g.percentage >= 60 ? 'warning' : 'danger'
                                            }>
                                                {g.letterGrade || '-'}
                                            </Badge>
                                        </td>
                                        <td className="text-muted">
                                            {g.assessmentDate ? new Date(g.assessmentDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td>
                                            <Badge bg={g.isPublished ? 'success' : 'secondary'}>
                                                {g.isPublished ? 'Published' : 'Draft'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    {studentGrades.length > 0 && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="row text-center">
                                <div className="col">
                                    <div className="text-muted small">Total Grades</div>
                                    <div className="fw-bold">{studentGrades.length}</div>
                                </div>
                                <div className="col">
                                    <div className="text-muted small">Average</div>
                                    <div className="fw-bold">
                                        {(studentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / studentGrades.length).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="text-muted small">Published</div>
                                    <div className="fw-bold">
                                        {studentGrades.filter(g => g.isPublished).length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGrades(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StudentsPage;
