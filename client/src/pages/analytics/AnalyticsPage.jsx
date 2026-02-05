import { Card } from '../../components/common';
import { PageHeader } from '../../components/layout/MainLayout';
import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
    return (
        <div className="analytics-page">
            <PageHeader
                title="Analytics"
                description="Platform usage metrics and performance insights."
            />

            <div className="analytics-stats">
                <Card hoverable>
                    <Card.Body>
                        <div className="analytics-stat">
                            <div className="analytics-stat__icon analytics-stat__icon--primary">
                                <Building2 size={24} />
                            </div>
                            <div className="analytics-stat__content">
                                <div className="analytics-stat__label">Tenant Growth</div>
                                <div className="analytics-stat__value">+18%</div>
                                <div className="analytics-stat__period">vs last month</div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card hoverable>
                    <Card.Body>
                        <div className="analytics-stat">
                            <div className="analytics-stat__icon analytics-stat__icon--success">
                                <Users size={24} />
                            </div>
                            <div className="analytics-stat__content">
                                <div className="analytics-stat__label">User Engagement</div>
                                <div className="analytics-stat__value">86%</div>
                                <div className="analytics-stat__period">active users</div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card hoverable>
                    <Card.Body>
                        <div className="analytics-stat">
                            <div className="analytics-stat__icon analytics-stat__icon--accent">
                                <BarChart3 size={24} />
                            </div>
                            <div className="analytics-stat__content">
                                <div className="analytics-stat__label">API Requests</div>
                                <div className="analytics-stat__value">2.4M</div>
                                <div className="analytics-stat__period">this month</div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card hoverable>
                    <Card.Body>
                        <div className="analytics-stat">
                            <div className="analytics-stat__icon analytics-stat__icon--warning">
                                <TrendingUp size={24} />
                            </div>
                            <div className="analytics-stat__content">
                                <div className="analytics-stat__label">Uptime</div>
                                <div className="analytics-stat__value">99.9%</div>
                                <div className="analytics-stat__period">last 30 days</div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="analytics-charts">
                <Card>
                    <Card.Body>
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Tenant Registrations Over Time</h3>
                        <div className="chart-placeholder">
                            📈 Line chart showing tenant registrations will go here
                        </div>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Body>
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Usage by Feature</h3>
                        <div className="chart-placeholder">
                            📊 Bar chart showing feature usage will go here
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
