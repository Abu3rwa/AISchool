import { Card, Badge, Button, Table } from '../../components/common';
import { PageHeader } from '../../components/layout/MainLayout';
import { CreditCard, TrendingUp, ArrowUpRight, Download } from 'lucide-react';
import './SubscriptionsPage.css';

// Mock data
const mockPlans = [
    { name: 'Free', tenants: 23, revenue: '$0', color: 'default' },
    { name: 'Basic', tenants: 54, revenue: '$5,346', color: 'info' },
    { name: 'Premium', tenants: 50, revenue: '$14,850', color: 'primary' },
];

const mockTransactions = [
    { id: 1, tenant: 'Springfield Academy', plan: 'premium', amount: '$299', date: '2026-02-04', status: 'completed' },
    { id: 2, tenant: 'Riverside High', plan: 'premium', amount: '$299', date: '2026-02-03', status: 'completed' },
    { id: 3, tenant: 'Oak Valley School', plan: 'basic', amount: '$99', date: '2026-02-03', status: 'completed' },
    { id: 4, tenant: 'Green Hills School', plan: 'basic', amount: '$99', date: '2026-02-02', status: 'completed' },
    { id: 5, tenant: 'Mountain View Prep', plan: 'basic', amount: '$99', date: '2026-02-01', status: 'pending' },
];

const SubscriptionsPage = () => {
    const columns = [
        { key: 'tenant', header: 'Tenant', sortable: true },
        {
            key: 'plan',
            header: 'Plan',
            render: (val) => <Badge variant={val === 'premium' ? 'primary' : 'info'}>{val}</Badge>
        },
        { key: 'amount', header: 'Amount', align: 'right' },
        { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
        {
            key: 'status',
            header: 'Status',
            render: (val) => <Badge variant={val === 'completed' ? 'success' : 'warning'}>{val}</Badge>
        },
    ];

    return (
        <div className="subscriptions-page">
            <PageHeader
                title="Subscriptions"
                description="Manage subscription plans and view payment history."
                actions={
                    <Button variant="secondary" icon={<Download size={18} />}>
                        Export Report
                    </Button>
                }
            />

            {/* Stats */}
            <div className="subscriptions-stats">
                {mockPlans.map((plan) => (
                    <Card key={plan.name} hoverable>
                        <Card.Body>
                            <div className="subscription-stat">
                                <div className="subscription-stat__header">
                                    <Badge variant={plan.color} size="lg">{plan.name}</Badge>
                                </div>
                                <div className="subscription-stat__tenants">{plan.tenants} tenants</div>
                                <div className="subscription-stat__revenue">
                                    <span className="subscription-stat__amount">{plan.revenue}</span>
                                    <span className="subscription-stat__period">/month</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))}

                <Card hoverable className="subscription-stat--total">
                    <Card.Body>
                        <div className="subscription-stat">
                            <div className="subscription-stat__icon">
                                <TrendingUp size={24} />
                            </div>
                            <div className="subscription-stat__tenants">Total MRR</div>
                            <div className="subscription-stat__revenue">
                                <span className="subscription-stat__amount">$20,196</span>
                                <span className="subscription-stat__change">+12%</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Transactions */}
            <Card>
                <Card.Header
                    title="Recent Transactions"
                    actions={
                        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                            View all <ArrowUpRight size={14} />
                        </a>
                    }
                />
                <Table
                    columns={columns}
                    data={mockTransactions}
                />
            </Card>
        </div>
    );
};

export default SubscriptionsPage;
