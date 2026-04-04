import React, { useState } from 'react';
import { 
    Save, 
    Globe, 
    Shield, 
    Bell, 
    CreditCard, 
    Loader2, 
    Mail, 
    Server,
    DollarSign,
    Lock
} from 'lucide-react';

// Custom Toggle Component for the premium feel
const Toggle = ({ enabled, onChange }) => (
    <button 
        onClick={() => onChange(!enabled)}
        style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: enabled ? 'var(--primary)' : '#cbd5e1',
            position: 'relative',
            cursor: 'pointer',
            transition: 'var(--transition)',
            border: 'none',
            outline: 'none'
        }}
    >
        <div style={{
            position: 'absolute',
            top: '2px',
            left: enabled ? '22px' : '2px',
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
    </button>
);

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Mock settings state
    const [settings, setSettings] = useState({
        siteName: 'Freelance Connect',
        supportEmail: 'support@freelance-connect.com',
        maintenanceMode: false,
        openRegistration: true,
        requireEmailVerification: true,
        commissionRate: 10,
        currency: 'USD',
        emailNotifications: true,
        securityAlerts: true
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'General Settings', icon: <Globe size={18} /> },
        { id: 'security', label: 'Security & Auth', icon: <Shield size={18} /> },
        { id: 'billing', label: 'Billing & Fees', icon: <CreditCard size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> }
    ];

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>System Settings</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Configure platform-wide parameters and preferences</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={handleSave} 
                    disabled={loading}
                    style={{ minWidth: '140px', justifyContent: 'center' }}
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}</>}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
                {/* Settings Sidebar */}
                <div className="card" style={{ padding: '1rem' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab.id ? '600' : '500',
                                    border: 'none',
                                    textAlign: 'left',
                                    transition: 'var(--transition)'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="card" style={{ minHeight: '500px' }}>
                    {activeTab === 'general' && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Server size={20} color="var(--primary)" /> Platform Configuration
                            </h3>
                            
                            <div className="form-group" style={{ maxWidth: '400px' }}>
                                <label className="form-label">Platform Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={settings.siteName}
                                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '2.5rem' }}>
                                <label className="form-label">Support Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        style={{ paddingLeft: '2.75rem' }}
                                        value={settings.supportEmail}
                                        onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                                    />
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

                            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>System Status</h4>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', maxWidth: '500px' }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Maintenance Mode</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Disable public access across the platform</div>
                                </div>
                                <Toggle enabled={settings.maintenanceMode} onChange={(v) => handleSettingChange('maintenanceMode', v)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lock size={20} color="var(--primary)" /> Authentication Rules
                            </h3>
                            
                            <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Allow New Registrations</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Users can sign up for new accounts</div>
                                    </div>
                                    <Toggle enabled={settings.openRegistration} onChange={(v) => handleSettingChange('openRegistration', v)} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Require Email Verification</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Users must verify email before accessing features</div>
                                    </div>
                                    <Toggle enabled={settings.requireEmailVerification} onChange={(v) => handleSettingChange('requireEmailVerification', v)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <DollarSign size={20} color="var(--primary)" /> Fee Structure
                            </h3>
                            
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div className="form-group" style={{ width: '200px' }}>
                                    <label className="form-label">Platform Commission (%)</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        min="0"
                                        max="100"
                                        value={settings.commissionRate}
                                        onChange={(e) => handleSettingChange('commissionRate', Number(e.target.value))}
                                    />
                                </div>
                                
                                <div className="form-group" style={{ width: '200px' }}>
                                    <label className="form-label">Default Currency</label>
                                    <select 
                                        className="form-input"
                                        value={settings.currency}
                                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                                        style={{ appearance: 'none', backgroundColor: 'white' }}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bell size={20} color="var(--primary)" /> Admin Alerts
                            </h3>

                            <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>System Health Alerts</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Receive emails on critical system events</div>
                                    </div>
                                    <Toggle enabled={settings.emailNotifications} onChange={(v) => handleSettingChange('emailNotifications', v)} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Security Alerts</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Notify on excessive failed login attempts</div>
                                    </div>
                                    <Toggle enabled={settings.securityAlerts} onChange={(v) => handleSettingChange('securityAlerts', v)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
