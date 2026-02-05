import { useState } from 'react';
import {
    Building2,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    CreditCard,
} from 'lucide-react';
import { Card, Badge } from '../../components/common';
import { PageHeader } from '../../components/layout/MainLayout';
import './DashboardPage.css';

// Mock data for demo
const mockStats = [
    {
        label: 'Total Tenants',
        value: '127',
        change: '+12%',
        positive: true,
        icon: Building2,
        iconClass: 'primary',
    },
    {
        label: 'Active Users',
        value: '3,456',
        change: '+8%',
        positive: true,
        icon: Users,
        iconClass: 'success',
    },
    {
        label: 'Monthly Revenue',
        value: '$45,230',
        change: '+23%',
        positive: true,
        icon: DollarSign,
        iconClass: 'accent',
    },
    {
        label: 'Avg. Students/Tenant',
        value: '284',
        change: '-2%',
        positive: false,
        icon: TrendingUp,
        iconClass: 'warning',
    },
];

const mockRecentTenants = [
    { id: 1, name: 'Springfield Academy', plan: 'premium', students: 342, joinedAt: '2 hours ago' },
    { id: 2, name: 'Oak Valley School', plan: 'basic', students: 156, joinedAt: '5 hours ago' },
    { id: 3, name: 'Riverside High', plan: 'premium', students: 512, joinedAt: '1 day ago' },
    { id: 4, name: 'Mountain View Prep', plan: 'free', students: 45, joinedAt: '2 days ago' },
    { id: 5, name: 'Lakeside Academy', plan: 'basic', students: 234, joinedAt: '3 days ago' },
];

const mockRecentPayments = [
    { id: 1, tenant: 'Springfield Academy', amount: '$299', method: 'Credit Card', time: '10 min ago' },
    { id: 2, tenant: 'Riverside High', amount: '$299', method: 'Bank Transfer', time: '1 hour ago' },
    { id: 3, tenant: 'Oak Valley School', amount: '$99', method: 'Credit Card', time: '3 hours ago' },
    { id: 4, tenant: 'Green Hills School', amount: '$299', method: 'PayPal', time: '6 hours ago' },
    { id: 5, tenant: 'Sunrise Institute', amount: '$99', method: 'Credit Card', time: '12 hours ago' },
];

const StatCard = ({ stat }) => {
    const Icon = stat.icon;

    return (
        <Card hoverable className="stat-card-wrapper">
            <Card.Body>
                <div className="stat-card">
                    <div className={`stat-card__icon stat-card__icon--${stat.iconClass}`}>
                        <Icon size={24} />
                    </div>
                    <div className="stat-card__content">
                        <div className="stat-card__label">{stat.label}</div>
                        <div className="stat-card__value">{stat.value}</div>
                        <span className={`stat-card__change stat-card__change--${stat.positive ? 'positive' : 'negative'}`}>
                            {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {stat.change} from last month
                        </span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

const DashboardPage = () => {
    const [chartPeriod, setChartPeriod] = useState('7d');

    const getPlanBadgeVariant = (plan) => {
        switch (plan) {
            case 'premium': return 'primary';
            case 'basic': return 'info';
            default: return 'default';
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="dashboard">
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's what's happening with your platform today."
            />

            {/* Stats Grid */}
            <div className="dashboard__stats stagger-children">
                {mockStats.map((stat, index) => (
                    <StatCard key={index} stat={stat} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="dashboard__charts">
                <Card className="chart-card">
                    <Card.Body>
                        <div className="chart-card__header">
                            <h3 className="chart-card__title">Revenue Overview</h3>
                            <div className="chart-card__filters">
                                {['7d', '30d', '90d', '1y'].map((period) => (
                                    <button
                                        key={period}
                                        className={`chart-filter ${chartPeriod === period ? 'chart-filter--active' : ''}`}
                                        onClick={() => setChartPeriod(period)}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="chart-placeholder">
                            📊 Revenue chart will be displayed here (Recharts integration)
                        </div>
                    </Card.Body>
                </Card>

                <Card className="chart-card">
                    <Card.Body>
                        <div className="chart-card__header">
                            <h3 className="chart-card__title">Plan Distribution</h3>
                        </div>
                        <div className="chart-placeholder">
                            🍩 Donut chart showing Free/Basic/Premium split
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="dashboard__recent">
                <Card className="recent-card">
                    <Card.Header
                        title="Recent Tenants"
                        actions={
                            <a href="/tenants" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                                View all <ArrowUpRight size={14} />
                            </a>
                        }
                    />
                    <Card.Body>
                        <div className="recent-list">
                            {mockRecentTenants.map((tenant) => (
                                <div key={tenant.id} className="recent-item">
                                    <div className="recent-item__left">
                                        <div className="recent-item__avatar">
                                            {getInitials(tenant.name)}
                                        </div>
                                        <div className="recent-item__info">
                                            <span className="recent-item__name">{tenant.name}</span>
                                            <span className="recent-item__meta">
                                                {tenant.students} students
                                            </span>
                                        </div>
                                    </div>
                                    <div className="recent-item__right">
                                        <Badge variant={getPlanBadgeVariant(tenant.plan)}>
                                            {tenant.plan}
                                        </Badge>
                                        <div className="recent-item__time">{tenant.joinedAt}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>

                <Card className="recent-card">
                    <Card.Header
                        title="Recent Payments"
                        actions={
                            <a href="/subscriptions" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                                View all <ArrowUpRight size={14} />
                            </a>
                        }
                    />
                    <Card.Body>
                        <div className="recent-list">
                            {mockRecentPayments.map((payment) => (
                                <div key={payment.id} className="recent-item">
                                    <div className="recent-item__left">
                                        <div className="recent-item__avatar">
                                            <CreditCard size={18} />
                                        </div>
                                        <div className="recent-item__info">
                                            <span className="recent-item__name">{payment.tenant}</span>
                                            <span className="recent-item__meta">{payment.method}</span>
                                        </div>
                                    </div>
                                    <div className="recent-item__right">
                                        <div className="recent-item__value">{payment.amount}</div>
                                        <div className="recent-item__time">{payment.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
