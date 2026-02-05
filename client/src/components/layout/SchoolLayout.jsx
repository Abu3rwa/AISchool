import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    FileText,
    Settings,
    LogOut,
    GraduationCap,
    School,
    ClipboardList,
    CalendarDays,
    ListChecks
} from 'lucide-react';
import { schoolLogout, selectSchoolUser } from '../../store/slices/schoolAuthSlice';
import './SchoolLayout.css';

const SchoolLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectSchoolUser);

    const handleLogout = () => {
        dispatch(schoolLogout());
        navigate('/portal/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    const navItems = [
        { path: '/portal', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/portal/students', label: 'Students', icon: <GraduationCap size={20} /> },
        { path: '/portal/classes', label: 'Classes', icon: <School size={20} /> },
        { path: '/portal/subjects', label: 'Subjects', icon: <BookOpen size={20} /> },
        { path: '/portal/grades', label: 'Grades', icon: <ClipboardList size={20} /> },
        { path: '/portal/schedule', label: 'Schedule', icon: <Calendar size={20} /> },
        { path: '/portal/reports', label: 'Reports', icon: <FileText size={20} /> },
    ];

    const hasAdminRole = user?.roles?.some(r => r.name === 'ADMIN');

    if (hasAdminRole) {
        // Insert admin-only items
        navItems.splice(1, 0, { path: '/portal/teachers', label: 'Teachers', icon: <Users size={20} /> });
        navItems.splice(5, 0, { path: '/portal/assignments', label: 'Assignments', icon: <ListChecks size={20} /> });
        navItems.splice(7, 0, { path: '/portal/grade-types', label: 'Grade Types', icon: <ListChecks size={20} /> });
        navItems.splice(8, 0, { path: '/portal/terms', label: 'Terms', icon: <CalendarDays size={20} /> });
    }

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-container">
                        <School className="logo-icon" />
                    </div>
                    <div className="brand-name">My School</div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className={`nav-item ${isActive('/portal/settings') ? 'active' : ''}`}
                        onClick={() => navigate('/portal/settings')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button className="nav-item logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="header-search">
                        {/* Search placeholder */}
                    </div>
                    <div className="header-actions">
                        <div className="user-profile">
                            <div className="avatar">
                                {user?.firstName?.charAt(0) || 'U'}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                                <span className="user-role">{user?.roles?.[0]?.name || 'User'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-scroll">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SchoolLayout;
