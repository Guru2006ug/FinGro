import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    ClipboardList,
    Briefcase,
    Settings,
    Activity,
    LogOut,
    ChevronLeft,
    Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/trading', label: 'Trading', icon: ArrowLeftRight },
    { path: '/orders', label: 'Orders', icon: ClipboardList },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed = false, onToggle }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Zap size={22} />
                </div>
                {!collapsed && (
                    <div className="logo-text">
                        <span className="logo-name">FinGrow</span>
                        <span className="logo-tag">Matching Engine</span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.label : ''}
                        >
                            <Icon size={20} />
                            {!collapsed && <span>{item.label}</span>}
                            {isActive && <div className="active-indicator" />}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {/* Logout */}
                <button
                    className="sidebar-link logout-btn"
                    onClick={() => { logout(); navigate('/'); }}
                    title="Sign Out"
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                {/* Status */}
                <div className="engine-status">
                    <Activity size={14} className="status-dot" />
                    {!collapsed && <span>Engine Online</span>}
                </div>

                {/* Collapse toggle */}
                <button
                    className="collapse-btn"
                    onClick={() => onToggle?.(!collapsed)}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    <ChevronLeft
                        size={18}
                        style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                    />
                </button>
            </div>
        </aside>
    );
}
