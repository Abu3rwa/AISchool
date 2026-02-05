import { useState } from 'react';
import { Card, Table, Badge, Input, Button } from '../../components/common';
import { PageHeader } from '../../components/layout/MainLayout';
import { Search, Download, Filter, Calendar } from 'lucide-react';
import './AuditLogsPage.css';

// Mock data
const mockLogs = [
    { id: 1, action: 'tenant.created', entity: 'Tenant', entityId: '507f1f77bcf86cd799439011', user: 'admin@educloud.com', ip: '192.168.1.1', createdAt: '2026-02-04T10:30:00Z' },
    { id: 2, action: 'tenant.status.updated', entity: 'Tenant', entityId: '507f1f77bcf86cd799439012', user: 'admin@educloud.com', ip: '192.168.1.1', createdAt: '2026-02-04T09:15:00Z' },
    { id: 3, action: 'provider.login', entity: 'Provider', entityId: '507f1f77bcf86cd799439013', user: 'admin@educloud.com', ip: '192.168.1.1', createdAt: '2026-02-04T08:00:00Z' },
    { id: 4, action: 'tenant.plan.updated', entity: 'Tenant', entityId: '507f1f77bcf86cd799439014', user: 'admin@educloud.com', ip: '192.168.1.2', createdAt: '2026-02-03T16:45:00Z' },
    { id: 5, action: 'tenant.deleted', entity: 'Tenant', entityId: '507f1f77bcf86cd799439015', user: 'admin@educloud.com', ip: '192.168.1.1', createdAt: '2026-02-03T14:20:00Z' },
    { id: 6, action: 'settings.updated', entity: 'Settings', entityId: 'global', user: 'admin@educloud.com', ip: '192.168.1.1', createdAt: '2026-02-02T11:00:00Z' },
];

const AuditLogsPage = () => {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const getActionBadge = (action) => {
        if (action.includes('created')) return <Badge variant="success">{action}</Badge>;
        if (action.includes('deleted')) return <Badge variant="error">{action}</Badge>;
        if (action.includes('updated')) return <Badge variant="info">{action}</Badge>;
        if (action.includes('login')) return <Badge variant="primary">{action}</Badge>;
        return <Badge variant="default">{action}</Badge>;
    };

    const columns = [
        { key: 'createdAt', header: 'Timestamp', render: (val) => new Date(val).toLocaleString() },
        { key: 'action', header: 'Action', render: (val) => getActionBadge(val) },
        { key: 'entity', header: 'Entity' },
        { key: 'entityId', header: 'Entity ID', render: (val) => <code className="audit-id">{val.slice(-8)}</code> },
        { key: 'user', header: 'User' },
        { key: 'ip', header: 'IP Address' },
    ];

    return (
        <div className="audit-logs-page">
            <PageHeader
                title="Audit Logs"
                description="Track all actions performed on the platform."
                actions={
                    <Button variant="secondary" icon={<Download size={18} />}>
                        Export Logs
                    </Button>
                }
            />

            <Card>
                <Card.Body>
                    <div className="audit-filters">
                        <div className="audit-search">
                            <Input
                                placeholder="Search by user, action, or entity..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                iconLeft={<Search size={18} />}
                            />
                        </div>

                        <div className="audit-filter-group">
                            <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
                            <select
                                className="audit-filter-select"
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="created">Created</option>
                                <option value="updated">Updated</option>
                                <option value="deleted">Deleted</option>
                                <option value="login">Login</option>
                            </select>

                            <Button variant="ghost" icon={<Calendar size={16} />} size="sm">
                                Date Range
                            </Button>
                        </div>
                    </div>
                </Card.Body>

                <Table
                    columns={columns}
                    data={mockLogs}
                    emptyTitle="No audit logs found"
                    emptyMessage="No actions have been recorded yet."
                />

                <Table.Pagination
                    currentPage={1}
                    totalPages={5}
                    totalItems={mockLogs.length}
                    itemsPerPage={10}
                    onPageChange={() => { }}
                />
            </Card>
        </div>
    );
};

export default AuditLogsPage;
