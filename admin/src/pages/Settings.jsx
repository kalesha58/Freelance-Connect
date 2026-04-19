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
    IndianRupee,
    Lock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

/* ─── Premium Toggle ─── */
const Toggle = ({ enabled, onChange, color = 'var(--primary)' }) => (
    <button
        onClick={() => onChange(!enabled)}
        aria-checked={enabled}
        role="switch"
        style={{
            width: '48px', height: '26px', borderRadius: '13px',
            background: enabled
                ? color
                : 'var(--border-strong)',
            position: 'relative', cursor: 'pointer',
            border: 'none', outline: 'none', flexShrink: 0,
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: enabled ? `0 0 12px ${color}55` : 'inset 0 1px 3px rgba(0,0,0,0.15)',
        }}
    >
        <div style={{
            position: 'absolute',
            top: '3px',
            left: enabled ? '25px' : '3px',
            width: '20px', height: '20px',
            background: 'white',
            borderRadius: '50%',
            transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }} />
    </button>
);

/* ─── Setting Row ─── */
const SettingRow = ({ title, description, children, dangerous }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.125rem 1.25rem',
        background: dangerous ? 'rgba(244,63,94,0.04)' : 'var(--bg-main)',
        border: `1px solid ${dangerous ? 'rgba(244,63,94,0.15)' : 'var(--border)'}`,
        borderRadius: '12px',
        gap: '2rem',
        transition: 'var(--transition)',
    }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
                fontWeight: '600', fontSize: '0.875rem',
                color: dangerous ? 'var(--danger)' : 'var(--text-main)',
                marginBottom: '0.2rem',
            }}>
                {title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {description}
            </div>
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

const tabs = [
    { id: 'general',       label: 'General',       icon: Globe,       color: '#6366f1' },
    { id: 'security',      label: 'Security',       icon: Shield,      color: '#10b981' },
    { id: 'notifications', label: 'Notifications',  icon: Bell,        color: '#f43f5e' },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        siteName: 'Skill Link',
        supportEmail: 'support@skilllink.app',
        maintenanceMode: false,
        openRegistration: true,
        requireEmailVerification: true,
        commissionRate: 10,
        currency: 'INR',
        emailNotifications: true,
        securityAlerts: true,
    });

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1000);
    };

    const activeTab_ = tabs.find(t => t.id === activeTab);

    return (
        <div className="animate-fade-in">
            {/* ── Header ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.625rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>
                        System Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Configure platform-wide parameters and preferences
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ minWidth: '150px', justifyContent: 'center', gap: '0.5rem' }}
                >
                    {loading
                        ? <Loader2 size={16} className="animate-spin" />
                        : saved
                            ? <><CheckCircle size={16} /> Saved!</>
                            : <><Save size={16} /> Save Changes</>
                    }
                </button>
            </div>

            {/* ── Pill Tabs ── */}
            <div style={{
                display: 'flex', gap: '0.5rem', marginBottom: '1.75rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '14px', padding: '0.375rem',
                width: 'fit-content',
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.125rem',
                                borderRadius: '10px',
                                background: isActive
                                    ? `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`
                                    : 'transparent',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                fontWeight: isActive ? '700' : '500',
                                fontSize: '0.85rem',
                                border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? `0 4px 14px ${tab.color}40` : 'none',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-main)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }
                            }}
                        >
                            <Icon size={15} strokeWidth={2.2} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Content ── */}
            <div className="card animate-fade-in" key={activeTab} style={{ maxWidth: '720px' }}>
                {/* Tab heading */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '11px',
                        background: activeTab_ ? `${activeTab_.color}18` : 'var(--primary-light)',
                        border: `1px solid ${activeTab_?.color || 'var(--primary)'}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {activeTab_ && <activeTab_.icon size={18} color={activeTab_.color} strokeWidth={2} />}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.1rem' }}>
                            {activeTab_ ? `${activeTab_.label} Settings` : 'Settings'}
                        </h2>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {activeTab === 'general' && 'Core platform configuration'}
                            {activeTab === 'security' && 'Authentication & access control'}
                            {activeTab === 'notifications' && 'Admin alert preferences'}
                        </p>
                    </div>
                </div>

                {/* ── General ── */}
                {activeTab === 'general' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group" style={{ maxWidth: '420px', marginBottom: 0 }}>
                            <label className="form-label">
                                <Server size={11} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                Platform Name
                            </label>
                            <input
                                type="text" className="form-input"
                                value={settings.siteName}
                                onChange={e => updateSetting('siteName', e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ maxWidth: '420px', marginBottom: 0 }}>
                            <label className="form-label">
                                <Mail size={11} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                Support Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{
                                    position: 'absolute', left: '1rem', top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-light)',
                                    pointerEvents: 'none',
                                }} />
                                <input
                                    type="email" className="form-input" style={{ paddingLeft: '2.75rem' }}
                                    value={settings.supportEmail}
                                    onChange={e => updateSetting('supportEmail', e.target.value)}
                                />
                            </div>
                        </div>
                        <hr className="divider" />
                        <SettingRow
                            title="Maintenance Mode"
                            description="Temporarily restrict public access across the platform. Admins will still be able to log in."
                            dangerous={settings.maintenanceMode}
                        >
                            <Toggle
                                enabled={settings.maintenanceMode}
                                onChange={v => updateSetting('maintenanceMode', v)}
                                color={settings.maintenanceMode ? '#f43f5e' : 'var(--primary)'}
                            />
                        </SettingRow>
                        {settings.maintenanceMode && (
                            <div style={{
                                display: 'flex', gap: '0.625rem', padding: '0.875rem',
                                background: 'var(--warning-light)', border: '1px solid rgba(245,158,11,0.25)',
                                borderRadius: '10px', fontSize: '0.8rem', color: 'var(--warning)',
                                alignItems: 'flex-start',
                            }}>
                                <AlertTriangle size={15} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '1px' }} />
                                <span>Maintenance mode is active. Users will see a maintenance page until this is turned off.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Security ── */}
                {activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <SettingRow
                            title="Allow New Registrations"
                            description="Users can freely create new accounts on the platform."
                        >
                            <Toggle enabled={settings.openRegistration} onChange={v => updateSetting('openRegistration', v)} color="#10b981" />
                        </SettingRow>
                        <SettingRow
                            title="Require Email Verification"
                            description="Users must verify their email address before accessing platform features."
                        >
                            <Toggle enabled={settings.requireEmailVerification} onChange={v => updateSetting('requireEmailVerification', v)} color="#10b981" />
                        </SettingRow>
                        <div style={{
                            display: 'flex', gap: '0.625rem', padding: '0.875rem',
                            background: 'var(--info-light)', border: '1px solid rgba(59,130,246,0.2)',
                            borderRadius: '10px', fontSize: '0.8rem', color: 'var(--info)', alignItems: 'flex-start',
                        }}>
                            <Shield size={14} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span>Settings are applied immediately. Existing authenticated sessions are not affected.</span>
                        </div>
                    </div>
                )}



                {/* ── Notifications ── */}
                {activeTab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <SettingRow
                            title="System Health Alerts"
                            description="Receive email notifications for critical system events such as server downtime or high load."
                        >
                            <Toggle enabled={settings.emailNotifications} onChange={v => updateSetting('emailNotifications', v)} color="#f43f5e" />
                        </SettingRow>
                        <SettingRow
                            title="Security Alerts"
                            description="Get notified on excessive failed login attempts or suspicious admin activity."
                        >
                            <Toggle enabled={settings.securityAlerts} onChange={v => updateSetting('securityAlerts', v)} color="#f43f5e" />
                        </SettingRow>
                        <div style={{
                            display: 'flex', gap: '0.625rem', padding: '0.875rem',
                            background: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '10px', fontSize: '0.8rem', color: 'var(--primary)', alignItems: 'flex-start',
                        }}>
                            <Bell size={14} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span>Alerts are sent to <strong>{settings.supportEmail}</strong>. Update this in General Settings.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
