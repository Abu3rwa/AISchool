import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Form, Modal, Table, Spinner } from 'react-bootstrap';
import {
    fetchGrades,
    createGrade,
    updateGrade,
    publishGrade,
    deleteGrade,
    selectPortalGrades,
    selectPortalGradesLoading,
    selectPortalGradesError,
} from '../../../store/slices/portalGradesSlice';
import { fetchGradeTypes, selectPortalGradeTypes } from '../../../store/slices/portalGradeTypesSlice';
import { fetchTerms, selectPortalTerms } from '../../../store/slices/portalTermsSlice';
import { fetchClasses, selectPortalClasses } from '../../../store/slices/portalClassesSlice';
import { fetchSubjects, selectPortalSubjects } from '../../../store/slices/portalSubjectsSlice';
import { fetchStudents, selectPortalStudents } from '../../../store/slices/portalStudentsSlice';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';

const GradesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectSchoolUser);
    const grades = useSelector(selectPortalGrades);
    const gradeTypes = useSelector(selectPortalGradeTypes);
    const terms = useSelector(selectPortalTerms);
    const classes = useSelector(selectPortalClasses);
    const subjects = useSelector(selectPortalSubjects);
    const students = useSelector(selectPortalStudents);
    const isLoading = useSelector(selectPortalGradesLoading);
    const error = useSelector(selectPortalGradesError);

    const [filters, setFilters] = useState({ classId: '', subjectId: '', gradeTypeId: '' });
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        classId: '',
        subjectId: '',
        gradeTypeId: '',
        termId: '',
        title: '',
        score: '',
        maxScore: '100',
        assessmentDate: new Date().toISOString().split('T')[0],
        teacherNotes: '',
        studentFeedback: '',
    });

    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchGrades());
        dispatch(fetchGradeTypes());
        dispatch(fetchTerms());
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchStudents());
    }, [dispatch]);

    const filteredGrades = useMemo(() => {
        let result = grades;
        if (filters.classId) result = result.filter(g => g.classId?._id === filters.classId);
        if (filters.subjectId) result = result.filter(g => g.subjectId?._id === filters.subjectId);
        if (filters.gradeTypeId) result = result.filter(g => g.gradeTypeId?._id === filters.gradeTypeId);
        return result;
    }, [grades, filters]);

    const filteredStudents = useMemo(() => {
        if (!formData.classId) return [];
        return students.filter(s => s.classId?._id === formData.classId);
    }, [students, formData.classId]);

    const resetForm = () => {
        setFormData({
            studentId: '',
            classId: '',
            subjectId: '',
            gradeTypeId: '',
            termId: '',
            title: '',
            score: '',
            maxScore: '100',
            assessmentDate: new Date().toISOString().split('T')[0],
            teacherNotes: '',
            studentFeedback: '',
        });
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (grade) => {
        setSelectedGrade(grade);
        setFormData({
            studentId: grade.studentId?._id || '',
            classId: grade.classId?._id || '',
            subjectId: grade.subjectId?._id || '',
            gradeTypeId: grade.gradeTypeId?._id || '',
            termId: grade.termId || '',
            title: grade.title || '',
            score: grade.score?.toString() || '',
            maxScore: grade.maxScore?.toString() || '100',
            assessmentDate: grade.assessmentDate ? grade.assessmentDate.split('T')[0] : '',
            teacherNotes: grade.teacherNotes || '',
            studentFeedback: grade.studentFeedback || '',
        });
        setShowEdit(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            score: parseFloat(formData.score),
            maxScore: parseInt(formData.maxScore),
        };
        if (!data.termId) delete data.termId;
        dispatch(createGrade(data));
        setShowCreate(false);
        resetForm();
    };

    const handleEdit = (e) => {
        e.preventDefault();
        const data = {
            title: formData.title,
            score: parseFloat(formData.score),
            maxScore: parseInt(formData.maxScore),
            assessmentDate: formData.assessmentDate,
            teacherNotes: formData.teacherNotes,
            studentFeedback: formData.studentFeedback,
            gradeTypeId: formData.gradeTypeId,
        };
        dispatch(updateGrade({ id: selectedGrade._id, data }));
        setShowEdit(false);
    };

    const handlePublish = (grade, publish) => {
        dispatch(publishGrade({ id: grade._id, isPublished: publish }));
    };

    const handleDelete = (grade) => {
        if (window.confirm('Delete this grade?')) {
            dispatch(deleteGrade(grade._id));
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <Container className="py-4" style={{ maxWidth: 1200 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Grades</h3>
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => navigate('/portal/grades/add')}>
                        + Add Grades (Bulk)
                    </Button>
                    <Button variant="outline-primary" onClick={openCreate}>
                        Add Single
                    </Button>
                    <Button variant="outline-secondary" onClick={() => dispatch(fetchGrades())} disabled={isLoading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-3">
                <Card.Body>
                    <div className="d-flex gap-2 flex-wrap">
                        <Form.Select
                            value={filters.classId}
                            onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                            style={{ maxWidth: 200 }}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </Form.Select>
                        <Form.Select
                            value={filters.subjectId}
                            onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                            style={{ maxWidth: 200 }}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </Form.Select>
                        <Form.Select
                            value={filters.gradeTypeId}
                            onChange={(e) => setFilters({ ...filters, gradeTypeId: e.target.value })}
                            style={{ maxWidth: 180 }}
                        >
                            <option value="">All Types</option>
                            {gradeTypes.filter(t => t.isActive).map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </Form.Select>
                        {(filters.classId || filters.subjectId || filters.gradeTypeId) && (
                            <Button variant="link" onClick={() => setFilters({ classId: '', subjectId: '', gradeTypeId: '' })}>
                                Clear
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table responsive hover size="sm">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Score</th>
                                    <th>%</th>
                                    <th>Grade</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-muted text-center">
                                            No grades found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGrades.map(g => (
                                        <tr key={g._id}>
                                            <td className="fw-medium">
                                                {g.studentId?.firstName} {g.studentId?.lastName}
                                            </td>
                                            <td>{g.classId?.name}</td>
                                            <td>{g.subjectId?.name}</td>
                                            <td><Badge bg="secondary">{g.gradeTypeId?.name}</Badge></td>
                                            <td>{g.title || '-'}</td>
                                            <td>{g.score}/{g.maxScore}</td>
                                            <td>{g.percentage?.toFixed(1)}%</td>
                                            <td><strong>{g.letterGrade || '-'}</strong></td>
                                            <td>{formatDate(g.assessmentDate)}</td>
                                            <td>
                                                <Badge bg={g.isPublished ? 'success' : 'warning'}>
                                                    {g.isPublished ? 'Published' : 'Draft'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button size="sm" variant="outline-primary" onClick={() => openEdit(g)}>
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={g.isPublished ? 'outline-secondary' : 'outline-success'}
                                                        onClick={() => handlePublish(g, !g.isPublished)}
                                                    >
                                                        {g.isPublished ? 'Unpublish' : 'Publish'}
                                                    </Button>
                                                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(g)}>
                                                        ×
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
            <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add Grade</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <div className="row g-3">
                            <Form.Group className="col-md-6">
                                <Form.Label>Class *</Form.Label>
                                <Form.Select
                                    value={formData.classId}
                                    onChange={(e) => setFormData({ ...formData, classId: e.target.value, studentId: '' })}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="col-md-6">
                                <Form.Label>Student *</Form.Label>
                                <Form.Select
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    required
                                    disabled={!formData.classId}
                                >
                                    <option value="">Select Student</option>
                                    {filteredStudents.map(s => (
                                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="col-md-6">
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
                            <Form.Group className="col-md-6">
                                <Form.Label>Grade Type *</Form.Label>
                                <Form.Select
                                    value={formData.gradeTypeId}
                                    onChange={(e) => setFormData({ ...formData, gradeTypeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {gradeTypes.filter(t => t.isActive).map(t => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="col-md-6">
                                <Form.Label>Term</Form.Label>
                                <Form.Select
                                    value={formData.termId}
                                    onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                                >
                                    <option value="">Select Term</option>
                                    {terms.filter(t => t.isActive).map(t => (
                                        <option key={t._id} value={t._id}>{t.name} ({t.academicYear})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="col-md-6">
                                <Form.Label>Assessment Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.assessmentDate}
                                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-12">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Chapter 5 Test"
                                />
                            </Form.Group>
                            <Form.Group className="col-md-4">
                                <Form.Label>Score *</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.score}
                                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-md-4">
                                <Form.Label>Max Score</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={formData.maxScore}
                                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-md-4 d-flex align-items-end">
                                <div className="text-muted">
                                    {formData.score && formData.maxScore && (
                                        <strong>{((parseFloat(formData.score) / parseInt(formData.maxScore)) * 100).toFixed(1)}%</strong>
                                    )}
                                </div>
                            </Form.Group>
                            <Form.Group className="col-md-6">
                                <Form.Label>Teacher Notes (private)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={formData.teacherNotes}
                                    onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-md-6">
                                <Form.Label>Student Feedback (visible)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={formData.studentFeedback}
                                    onChange={(e) => setFormData({ ...formData, studentFeedback: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button type="submit">Create Grade</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Grade</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdit}>
                    <Modal.Body>
                        <div className="mb-3 p-2 bg-light rounded">
                            <strong>{selectedGrade?.studentId?.firstName} {selectedGrade?.studentId?.lastName}</strong>
                            <span className="text-muted"> — {selectedGrade?.subjectId?.name}</span>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Form.Group>
                        <div className="row g-2 mb-3">
                            <Form.Group className="col-4">
                                <Form.Label>Score *</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.score}
                                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="col-4">
                                <Form.Label>Max Score</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={formData.maxScore}
                                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="col-4">
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.assessmentDate}
                                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                                />
                            </Form.Group>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Grade Type</Form.Label>
                            <Form.Select
                                value={formData.gradeTypeId}
                                onChange={(e) => setFormData({ ...formData, gradeTypeId: e.target.value })}
                            >
                                {gradeTypes.filter(t => t.isActive).map(t => (
                                    <option key={t._id} value={t._id}>{t.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Teacher Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.teacherNotes}
                                onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Student Feedback</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.studentFeedback}
                                onChange={(e) => setFormData({ ...formData, studentFeedback: e.target.value })}
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

export default GradesPage;
