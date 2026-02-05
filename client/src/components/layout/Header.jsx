import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Search,
    Bell,
    Menu,
    ChevronDown,
    User,
    Settings,
    LogOut,
    HelpCircle,
} from 'lucide-react';
import { selectSidebarCollapsed, toggleMobileSidebar } from '../../store/slices/uiSlice';
import { selectUser, logout } from '../../store/slices/authSlice';

import './Header.css';

const Header = ({ title }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const collapsed = useSelector(selectSidebarCollapsed);
    const user = useSelector(selectUser);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleMobileToggle = () => {
        dispatch(toggleMobileSidebar());
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'P';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={`header ${collapsed ? 'header--sidebar-collapsed' : ''}`}>
            <div className="header__left">
                <button className="header__mobile-toggle" onClick={handleMobileToggle} aria-label="Toggle menu">
                    <Menu size={24} />
                </button>

                {title && <h1 className="header__title">{title}</h1>}

                <div className="header__search">
                    <Search size={18} className="header__search-icon" />
                    <input
                        type="text"
                        className="header__search-input"
                        placeholder="Search tenants, settings..."
                    />
                    <span className="header__search-shortcut">⌘K</span>
                </div>
            </div>

            <div className="header__right">


                <button className="header__action" aria-label="Help">
                    <HelpCircle size={20} />
                </button>

                <button className="header__action" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="header__action-badge" />
                </button>

                <div className="header__divider" />

                <div className="header__profile" ref={dropdownRef}>
                    <button
                        className="header__profile-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-expanded={dropdownOpen}
                        aria-haspopup="true"
                    >
                        <div className="header__profile-avatar">
                            {getInitials(user?.name)}
                        </div>
                        <span className="header__profile-name">{user?.name || 'Admin'}</span>
                        <ChevronDown size={16} className="header__profile-chevron" />
                    </button>

                    <div className={`header__dropdown ${dropdownOpen ? 'header__dropdown--open' : ''}`}>
                        <button className="header__dropdown-item" onClick={() => navigate('/settings')}>
                            <User size={16} />
                            Profile
                        </button>
                        <button className="header__dropdown-item" onClick={() => navigate('/settings')}>
                            <Settings size={16} />
                            Settings
                        </button>
                        <div className="header__dropdown-divider" />
                        <button className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
