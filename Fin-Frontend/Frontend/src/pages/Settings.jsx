import { Settings as SettingsIcon, User, Shield, Bell, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/layout/TopBar';
import './Settings.css';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();

    return (
        <div className="settings-page animate-fade-in">
            <TopBar title="Settings" subtitle="Application configuration" />

            <div className="settings-content">
                <div className="settings-grid">
                    {/* Profile */}
                    <section className="glass-card settings-section">
                        <div className="settings-section-header">
                            <User size={18} />
                            <h3>Profile</h3>
                        </div>
                        <div className="settings-form">
                            <div className="form-group">
                                <label className="form-label">Display Name</label>
                                <input type="text" className="input" defaultValue={user?.name || ''} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="input" defaultValue={user?.email || ''} readOnly />
                            </div>
                            <button className="btn btn-primary">Save Changes</button>
                        </div>
                    </section>

                    {/* Security */}
                    <section className="glass-card settings-section">
                        <div className="settings-section-header">
                            <Shield size={18} />
                            <h3>Security</h3>
                        </div>
                        <div className="settings-form">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input type="password" className="input" placeholder="••••••••" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" className="input" placeholder="••••••••" />
                            </div>
                            <button className="btn btn-primary">Update Password</button>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="glass-card settings-section">
                        <div className="settings-section-header">
                            <Bell size={18} />
                            <h3>Notifications</h3>
                        </div>
                        <div className="settings-toggles">
                            <div className="toggle-row">
                                <div>
                                    <span className="toggle-label">Trade Executions</span>
                                    <span className="toggle-desc">Get notified when orders are filled</span>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                            <div className="toggle-row">
                                <div>
                                    <span className="toggle-label">Price Alerts</span>
                                    <span className="toggle-desc">Alerts when prices hit targets</span>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                            <div className="toggle-row">
                                <div>
                                    <span className="toggle-label">Market Updates</span>
                                    <span className="toggle-desc">Daily market summary emails</span>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section className="glass-card settings-section">
                        <div className="settings-section-header">
                            <Palette size={18} />
                            <h3>Appearance</h3>
                        </div>
                        <div className="settings-form">
                            <div className="form-group">
                                <label className="form-label">Theme</label>
                                <div className="theme-options">
                                    <div
                                        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <div className="theme-preview dark-preview" />
                                        <span>Dark</span>
                                    </div>
                                    <div
                                        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <div className="theme-preview light-preview" />
                                        <span>Light</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
