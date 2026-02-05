import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    BarChart3,
    FileText,
    Settings,
    ChevronLeft,
    Zap,
} from 'lucide-react';
import { selectSidebarCollapsed, selectSidebarMobileOpen, toggleSidebar, closeMobileSidebar } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import './Sidebar.css';

const navItems = [
    {
        section: 'Overview',
        items: [
            { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        section: 'Management',
        items: [
            { path: '/tenants', icon: Building2, label: 'Tenants' },
            { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
        ],
    },
    {
        section: 'Insights',
        items: [
            { path: '/analytics', icon: BarChart3, label: 'Analytics' },
            { path: '/audit-logs', icon: FileText, label: 'Audit Logs' },
        ],
    },
    {
        section: 'System',
        items: [
            { path: '/settings', icon: Settings, label: 'Settings' },
        ],
    },
];

const Sidebar = () => {
    const dispatch = useDispatch();
    const collapsed = useSelector(selectSidebarCollapsed);
    const mobileOpen = useSelector(selectSidebarMobileOpen);
    const user = useSelector(selectUser);

    const handleCollapse = () => {
        dispatch(toggleSidebar());
    };

    const handleCloseMobile = () => {
        dispatch(closeMobileSidebar());
    };

    const getInitials = (name) => {
        if (!name) return 'P';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${mobileOpen ? 'sidebar-overlay--visible' : ''}`}
                onClick={handleCloseMobile}
            />

            <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">
                        <Zap size={20} />
                    </div>
                    <div className="sidebar__logo-text">
                        <span className="sidebar__logo-title">EduCloud</span>
                        <span className="sidebar__logo-subtitle">Provider Panel</span>
                    </div>
                </div>

                <nav className="sidebar__nav">
                    {navItems.map((section) => (
                        <div key={section.section} className="sidebar__nav-section">
                            <div className="sidebar__nav-label">{section.section}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                                    }
                                    onClick={handleCloseMobile}
                                >
                                    <span className="sidebar__nav-icon">
                                        <item.icon size={20} />
                                    </span>
                                    <span className="sidebar__nav-text">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <button className="sidebar__collapse-btn" onClick={handleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    <ChevronLeft size={18} />
                </button>

                <div className="sidebar__footer">
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">
                            {getInitials(user?.name)}
                        </div>
                        <div className="sidebar__user-info">
                            <div className="sidebar__user-name">{user?.name || 'Provider Admin'}</div>
                            <div className="sidebar__user-role">Super Admin</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
