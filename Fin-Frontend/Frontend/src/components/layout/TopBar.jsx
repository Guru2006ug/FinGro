import { Bell, Search, Wifi, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

export default function TopBar({ title, subtitle }) {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div>
                    <h1 className="topbar-title">{title}</h1>
                    {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="topbar-right">
                {/* Search */}
                <div className="topbar-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search symbol..." className="search-input" />
                </div>

                {/* Market Status */}
                <div className="market-status">
                    <Wifi size={14} className="market-status-dot" />
                    <span>Market Open</span>
                </div>

                {/* Theme Toggle */}
                <button
                    className="topbar-icon-btn theme-toggle-btn"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <button className="topbar-icon-btn" title="Notifications">
                    <Bell size={18} />
                    <span className="notification-dot" />
                </button>

                {/* Avatar */}
                <div className="topbar-avatar" title={user?.name || 'User'}>
                    {user?.avatar || 'U'}
                </div>
            </div>
        </header>
    );
}
