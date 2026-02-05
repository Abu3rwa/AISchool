import { useState } from 'react';
import { Card, Button, Input } from '../../components/common';
import { PageHeader } from '../../components/layout/MainLayout';
import { Save, User, Shield, Bell } from 'lucide-react';

import './SettingsPage.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },

    ];

    return (
        <div className="settings-page">
            <PageHeader
                title="Settings"
                description="Manage your account and platform preferences."
            />

            <div className="settings-layout">
                <Card className="settings-sidebar">
                    <Card.Body compact>
                        <nav className="settings-nav">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`settings-nav__item ${activeTab === tab.id ? 'settings-nav__item--active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </Card.Body>
                </Card>

                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <Card>
                            <Card.Header title="Profile Information" />
                            <Card.Body>
                                <div className="settings-form">
                                    <div className="settings-form__row">
                                        <Input label="Full Name" defaultValue="Admin User" />
                                        <Input label="Email" type="email" defaultValue="admin@educloud.com" />
                                    </div>
                                    <div className="settings-form__row">
                                        <Input label="Company Name" defaultValue="EduCloud Inc." />
                                        <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Footer>
                                <Button variant="primary" icon={<Save size={18} />}>
                                    Save Changes
                                </Button>
                            </Card.Footer>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card>
                            <Card.Header title="Security Settings" />
                            <Card.Body>
                                <div className="settings-form">
                                    <div className="settings-form__section">
                                        <h4 className="settings-form__section-title">Change Password</h4>
                                        <div className="settings-form__row">
                                            <Input label="Current Password" type="password" />
                                        </div>
                                        <div className="settings-form__row">
                                            <Input label="New Password" type="password" />
                                            <Input label="Confirm Password" type="password" />
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Footer>
                                <Button variant="primary" icon={<Save size={18} />}>
                                    Update Password
                                </Button>
                            </Card.Footer>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card>
                            <Card.Header title="Notification Preferences" />
                            <Card.Body>
                                <div className="settings-notifications">
                                    <label className="settings-toggle">
                                        <div className="settings-toggle__info">
                                            <span className="settings-toggle__label">Email notifications</span>
                                            <span className="settings-toggle__description">Receive email alerts for important events</span>
                                        </div>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="settings-toggle">
                                        <div className="settings-toggle__info">
                                            <span className="settings-toggle__label">New tenant alerts</span>
                                            <span className="settings-toggle__description">Get notified when new tenants sign up</span>
                                        </div>
                                        <input type="checkbox" defaultChecked />
                                    </label>

                                    <label className="settings-toggle">
                                        <div className="settings-toggle__info">
                                            <span className="settings-toggle__label">Payment notifications</span>
                                            <span className="settings-toggle__description">Receive alerts for payments and subscription changes</span>
                                        </div>
                                        <input type="checkbox" defaultChecked />
                                    </label>
                                </div>
                            </Card.Body>
                        </Card>
                    )}


                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
