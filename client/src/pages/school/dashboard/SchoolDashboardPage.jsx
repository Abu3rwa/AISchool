import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { selectSchoolUser } from '../../../store/slices/schoolAuthSlice';
import { fetchStudents, selectPortalStudents } from '../../../store/slices/portalStudentsSlice';
import { fetchClasses, selectPortalClasses } from '../../../store/slices/portalClassesSlice';
import { fetchTeachers, selectPortalTeachers } from '../../../store/slices/portalTeachersSlice';
import { fetchSubjects, selectPortalSubjects } from '../../../store/slices/portalSubjectsSlice';

const SchoolDashboardPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);
    const navigate = useNavigate();

    const students = useSelector(selectPortalStudents);
    const classes = useSelector(selectPortalClasses);
    const teachers = useSelector(selectPortalTeachers);
    const subjects = useSelector(selectPortalSubjects);

    // Check if user is admin
    const isAdmin = user?.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');

    useEffect(() => {
        dispatch(fetchStudents());
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        if (isAdmin) {
            dispatch(fetchTeachers());
        }
    }, [dispatch, isAdmin]);

    return (
        <div>
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
                <div>
                    <h2 className="mb-1">Welcome, {user?.firstName || 'User'}!</h2>
                    <div className="text-muted">Manage your school from the portal.</div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <Button variant="primary" onClick={() => navigate('/portal/students')}>Students</Button>
                    <Button variant="outline-primary" onClick={() => navigate('/portal/classes')}>Classes</Button>
                    {isAdmin && (
                        <Button variant="outline-primary" onClick={() => navigate('/portal/teachers')}>Teachers</Button>
                    )}
                    <Button variant="outline-primary" onClick={() => navigate('/portal/reports')}>Reports</Button>
                </div>
            </div>

            <Row className="g-3">
                <Col md={3}>
                    <Card
                        className="h-100 border-0 shadow-sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/portal/students')}
                    >
                        <Card.Body>
                            <div className="text-muted">Students</div>
                            <div className="fs-2 fw-semibold">{students.length}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                {students.filter(s => s.isActive).length} active
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card
                        className="h-100 border-0 shadow-sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/portal/classes')}
                    >
                        <Card.Body>
                            <div className="text-muted">Classes</div>
                            <div className="fs-2 fw-semibold">{classes.length}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                {classes.filter(c => c.isActive).length} active
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card
                        className="h-100 border-0 shadow-sm"
                        style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                        onClick={() => isAdmin && navigate('/portal/teachers')}
                    >
                        <Card.Body>
                            <div className="text-muted">Teachers</div>
                            <div className="fs-2 fw-semibold">{isAdmin ? teachers.length : '--'}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                {isAdmin ? `${teachers.filter(t => t.isActive).length} active` : 'Admin only'}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card
                        className="h-100 border-0 shadow-sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/portal/subjects')}
                    >
                        <Card.Body>
                            <div className="text-muted">Subjects</div>
                            <div className="fs-2 fw-semibold">{subjects.length}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                {subjects.filter(s => s.isActive !== false).length} active
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3 mt-1">
                <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                            <div className="fw-semibold mb-2">Quick actions</div>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" className="text-start" onClick={() => navigate('/portal/students')}>
                                    Manage students
                                </Button>
                                <Button variant="outline-primary" className="text-start" onClick={() => navigate('/portal/classes')}>
                                    Manage classes
                                </Button>
                                <Button variant="outline-primary" className="text-start" onClick={() => navigate('/portal/subjects')}>
                                    Manage subjects
                                </Button>
                                {isAdmin && (
                                    <Button variant="outline-primary" className="text-start" onClick={() => navigate('/portal/assignments')}>
                                        Manage teacher assignments
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                            <div className="fw-semibold mb-2">Getting started</div>
                            <div className="text-muted" style={{ lineHeight: 1.7 }}>
                                Recommended steps:
                                <div>1) {isAdmin ? 'Add teachers' : 'Review your assignments'}</div>
                                <div>2) Create classes</div>
                                <div>3) Add students to classes</div>
                                <div>4) Set up subjects</div>
                                {isAdmin && <div>5) Assign teachers to class-subjects</div>}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SchoolDashboardPage;
