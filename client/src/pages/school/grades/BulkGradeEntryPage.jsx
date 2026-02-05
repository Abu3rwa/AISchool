import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Card, Container, Form, Table, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    bulkCreateGrades,
    selectPortalGradesLoading,
    selectPortalGradesError,
} from '../../../store/slices/portalGradesSlice';
import { fetchGradeTypes, selectPortalGradeTypes } from '../../../store/slices/portalGradeTypesSlice';
import { fetchTerms, selectPortalTerms, selectPortalCurrentTerm } from '../../../store/slices/portalTermsSlice';
import { fetchClasses, selectPortalClasses } from '../../../store/slices/portalClassesSlice';
import { fetchSubjects, selectPortalSubjects } from '../../../store/slices/portalSubjectsSlice';
import { fetchStudents, selectPortalStudents } from '../../../store/slices/portalStudentsSlice';

const BulkGradeEntryPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const gradeTypes = useSelector(selectPortalGradeTypes);
    const terms = useSelector(selectPortalTerms);
    const currentTerm = useSelector(selectPortalCurrentTerm);
    const classes = useSelector(selectPortalClasses);
    const subjects = useSelector(selectPortalSubjects);
    const students = useSelector(selectPortalStudents);
    const isLoading = useSelector(selectPortalGradesLoading);
    const error = useSelector(selectPortalGradesError);

    // Selection state
    const [selection, setSelection] = useState({
        classId: '',
        subjectId: '',
        gradeTypeId: '',
        termId: '',
        title: '',
        assessmentDate: new Date().toISOString().split('T')[0],
        maxScore: '100',
    });

    // Grades state: { studentId: { score, teacherNotes, studentFeedback } }
    const [grades, setGrades] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchGradeTypes());
        dispatch(fetchTerms());
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchStudents());
    }, [dispatch]);

    // Set default term to current term
    useEffect(() => {
        if (currentTerm && !selection.termId) {
            setSelection(prev => ({ ...prev, termId: currentTerm._id }));
        }
    }, [currentTerm, selection.termId]);

    // Filter students by selected class
    const classStudents = useMemo(() => {
        if (!selection.classId) return [];
        return students
            .filter(s => s.classId?._id === selection.classId && s.isActive)
            .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));
    }, [students, selection.classId]);

    // Initialize grades when students change
    useEffect(() => {
        const initial = {};
        classStudents.forEach(s => {
            initial[s._id] = grades[s._id] || { score: '', teacherNotes: '', studentFeedback: '' };
        });
        setGrades(initial);
    }, [classStudents]);

    const handleSelectionChange = (field, value) => {
        setSelection(prev => ({ ...prev, [field]: value }));
        setSuccess(false);
    };

    const handleGradeChange = (studentId, field, value) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    const handleSubmit = async () => {
        // Validate selection
        if (!selection.classId || !selection.subjectId || !selection.gradeTypeId || !selection.assessmentDate) {
            alert('Please select Class, Subject, Grade Type, and Assessment Date');
            return;
        }

        // Build grades array (only students with scores)
        const gradeEntries = Object.entries(grades)
            .filter(([_, g]) => g.score !== '' && g.score !== null && g.score !== undefined)
            .map(([studentId, g]) => ({
                studentId,
                score: parseFloat(g.score),
                teacherNotes: g.teacherNotes || null,
                studentFeedback: g.studentFeedback || null,
            }));

        if (gradeEntries.length === 0) {
            alert('Please enter at least one grade');
            return;
        }

        setSubmitting(true);
        try {
            await dispatch(bulkCreateGrades({
                classId: selection.classId,
                subjectId: selection.subjectId,
                gradeTypeId: selection.gradeTypeId,
                termId: selection.termId || null,
                title: selection.title || null,
                assessmentDate: selection.assessmentDate,
                maxScore: parseInt(selection.maxScore) || 100,
                grades: gradeEntries,
            })).unwrap();
            
            setSuccess(true);
            // Reset grades
            const reset = {};
            classStudents.forEach(s => {
                reset[s._id] = { score: '', teacherNotes: '', studentFeedback: '' };
            });
            setGrades(reset);
        } catch (err) {
            console.error('Failed to save grades:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const filledCount = Object.values(grades).filter(g => g.score !== '' && g.score !== null).length;
    const selectedGradeType = gradeTypes.find(t => t._id === selection.gradeTypeId);

    return (
        <Container className="py-4" style={{ maxWidth: 1200 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="mb-0">Add Grades</h3>
                <Button variant="outline-secondary" onClick={() => navigate('/portal/grades')}>
                    ← Back to Grades
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Grades saved successfully! ({filledCount} students)</Alert>}

            {/* Selection Panel */}
            <Card className="mb-3">
                <Card.Body>
                    <div className="row g-3">
                        <Form.Group className="col-md-3">
                            <Form.Label className="fw-semibold">Class *</Form.Label>
                            <Form.Select
                                value={selection.classId}
                                onChange={(e) => handleSelectionChange('classId', e.target.value)}
                            >
                                <option value="">Select Class</option>
                                {classes.filter(c => c.isActive !== false).map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="col-md-3">
                            <Form.Label className="fw-semibold">Subject *</Form.Label>
                            <Form.Select
                                value={selection.subjectId}
                                onChange={(e) => handleSelectionChange('subjectId', e.target.value)}
                            >
                                <option value="">Select Subject</option>
                                {subjects.filter(s => s.isActive !== false).map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="col-md-3">
                            <Form.Label className="fw-semibold">Grade Type *</Form.Label>
                            <Form.Select
                                value={selection.gradeTypeId}
                                onChange={(e) => handleSelectionChange('gradeTypeId', e.target.value)}
                            >
                                <option value="">Select Type</option>
                                {gradeTypes.filter(t => t.isActive !== false).map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.name} {t.weight ? `(${(t.weight * 100).toFixed(0)}%)` : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="col-md-3">
                            <Form.Label className="fw-semibold">Term</Form.Label>
                            <Form.Select
                                value={selection.termId}
                                onChange={(e) => handleSelectionChange('termId', e.target.value)}
                            >
                                <option value="">No Term</option>
                                {terms.filter(t => t.isActive !== false).map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.name} ({t.academicYear}) {t.isCurrent ? '★' : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="col-md-4">
                            <Form.Label>Title / Description</Form.Label>
                            <Form.Control
                                value={selection.title}
                                onChange={(e) => handleSelectionChange('title', e.target.value)}
                                placeholder="e.g., Chapter 5 Test, Week 3 Quiz"
                            />
                        </Form.Group>
                        <Form.Group className="col-md-2">
                            <Form.Label>Assessment Date *</Form.Label>
                            <Form.Control
                                type="date"
                                value={selection.assessmentDate}
                                onChange={(e) => handleSelectionChange('assessmentDate', e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="col-md-2">
                            <Form.Label>Max Score</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={selection.maxScore}
                                onChange={(e) => handleSelectionChange('maxScore', e.target.value)}
                            />
                        </Form.Group>
                        <div className="col-md-4 d-flex align-items-end">
                            {selectedGradeType && (
                                <Badge bg="info" className="me-2">
                                    {selectedGradeType.name}
                                    {selectedGradeType.weight && ` - ${(selectedGradeType.weight * 100).toFixed(0)}% weight`}
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Students Grade Table */}
            {selection.classId ? (
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>
                            <strong>{classStudents.length}</strong> students in class
                            {filledCount > 0 && (
                                <Badge bg="success" className="ms-2">{filledCount} grades entered</Badge>
                            )}
                        </span>
                        <Button 
                            variant="primary" 
                            onClick={handleSubmit}
                            disabled={submitting || filledCount === 0}
                        >
                            {submitting ? <Spinner size="sm" /> : `Save ${filledCount} Grades`}
                        </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <Table hover className="mb-0" style={{ minWidth: 800 }}>
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: 50 }}>#</th>
                                        <th style={{ width: 200 }}>Student Name</th>
                                        <th style={{ width: 100 }}>ID</th>
                                        <th style={{ width: 120 }}>
                                            Score
                                            <small className="text-muted d-block">/ {selection.maxScore}</small>
                                        </th>
                                        <th style={{ width: 80 }}>%</th>
                                        <th>Notes (private)</th>
                                        <th>Feedback (visible)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center text-muted py-4">
                                                No active students in this class
                                            </td>
                                        </tr>
                                    ) : (
                                        classStudents.map((student, idx) => {
                                            const grade = grades[student._id] || { score: '', teacherNotes: '', studentFeedback: '' };
                                            const percentage = grade.score !== '' 
                                                ? ((parseFloat(grade.score) / parseInt(selection.maxScore)) * 100).toFixed(1)
                                                : '';
                                            
                                            return (
                                                <tr key={student._id}>
                                                    <td className="text-muted">{idx + 1}</td>
                                                    <td className="fw-medium">
                                                        {student.lastName}, {student.firstName}
                                                    </td>
                                                    <td className="text-muted small">
                                                        {student.studentIdNumber || '-'}
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            max={selection.maxScore}
                                                            step="0.5"
                                                            value={grade.score}
                                                            onChange={(e) => handleGradeChange(student._id, 'score', e.target.value)}
                                                            placeholder="0"
                                                            size="sm"
                                                            style={{ width: 80 }}
                                                        />
                                                    </td>
                                                    <td>
                                                        {percentage && (
                                                            <span className={
                                                                parseFloat(percentage) >= 70 ? 'text-success' :
                                                                parseFloat(percentage) >= 50 ? 'text-warning' : 'text-danger'
                                                            }>
                                                                {percentage}%
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            value={grade.teacherNotes}
                                                            onChange={(e) => handleGradeChange(student._id, 'teacherNotes', e.target.value)}
                                                            placeholder="Private notes..."
                                                            size="sm"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            value={grade.studentFeedback}
                                                            onChange={(e) => handleGradeChange(student._id, 'studentFeedback', e.target.value)}
                                                            placeholder="Feedback for student..."
                                                            size="sm"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                    {classStudents.length > 0 && (
                        <Card.Footer className="d-flex justify-content-between">
                            <span className="text-muted">
                                Enter scores for each student. Leave blank to skip.
                            </span>
                            <Button 
                                variant="primary" 
                                onClick={handleSubmit}
                                disabled={submitting || filledCount === 0}
                            >
                                {submitting ? <Spinner size="sm" /> : `Save ${filledCount} Grades`}
                            </Button>
                        </Card.Footer>
                    )}
                </Card>
            ) : (
                <Card>
                    <Card.Body className="text-center py-5 text-muted">
                        <h5>Select a class to see students</h5>
                        <p>Choose Class, Subject, and Grade Type above to start entering grades</p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default BulkGradeEntryPage;
