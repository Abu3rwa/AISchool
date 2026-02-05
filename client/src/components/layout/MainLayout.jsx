import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { selectSidebarCollapsed } from '../../store/slices/uiSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = () => {
    const collapsed = useSelector(selectSidebarCollapsed);

    return (
        <div className={`main-layout ${collapsed ? 'main-layout--sidebar-collapsed' : ''}`}>
            <Sidebar />
            <div className="main-layout__content">
                <Header />
                <main className="main-layout__main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export const PageHeader = ({ title, description, actions, children }) => (
    <div className="page-header">
        <div className="page-header__left">
            <h1 className="page-header__title">{title}</h1>
            {description && <p className="page-header__description">{description}</p>}
            {children}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
    </div>
);

MainLayout.PageHeader = PageHeader;

export default MainLayout;
