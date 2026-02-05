import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import {
    fetchTenantMetrics,
    selectTenantMetrics,
    selectTenantMetricsLoading,
    selectTenantMetricsError,
    clearTenantMetrics
} from '../../../store/slices/tenantMetricsSlice';

const SchoolMetricsPage = () => {
    const { id: tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const metrics = useSelector(selectTenantMetrics);
    const isLoading = useSelector(selectTenantMetricsLoading);
    const error = useSelector(selectTenantMetricsError);

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantMetrics({ tenantId }));
        }
        return () => {
            dispatch(clearTenantMetrics());
        };
    }, [dispatch, tenantId]);

    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 className="mb-1">School Metrics</h3>
                    <div className="text-muted">Usage data for tenant {tenantId}</div>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate(`/tenants/${tenantId}`)}>
                    Back to Overview
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {isLoading && !metrics && (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            )}

            {metrics && (
                <Row className="g-3">
                    <Col md={3} sm={6}>
                        <Card className="text-center h-100 border-primary">
                            <Card.Body>
                                <h1 className="display-4 fw-bold text-primary">{metrics.usersCount}</h1>
                                <div className="text-muted">Total Users</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="text-center h-100 border-success">
                            <Card.Body>
                                <h1 className="display-4 fw-bold text-success">{metrics.studentsCount}</h1>
                                <div className="text-muted">Total Students</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="text-center h-100 border-info">
                            <Card.Body>
                                <h1 className="display-4 fw-bold text-info">{metrics.classesCount}</h1>
                                <div className="text-muted">Total Classes</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="text-center h-100 border-warning">
                            <Card.Body>
                                <h1 className="display-4 fw-bold text-warning">{metrics.subjectsCount}</h1>
                                <div className="text-muted">Total Subjects</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default SchoolMetricsPage;
