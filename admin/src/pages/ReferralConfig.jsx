import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Settings, Save, ArrowLeft, Clock, Gift } from 'lucide-react';

const MILESTONES = [
    { value: 'profileCompleted', label: 'Profile completed' },
    { value: 'firstJobApplied', label: 'First job applied' },
    { value: 'firstJobPosted', label: 'First job posted' },
    { value: 'firstHire', label: 'First hire' },
];

const PERKS = [
    { value: '', label: 'None (credits only)' },
    { value: 'premiumChatUnlocks', label: 'Premium chat unlocks (+1)' },
    { value: 'freeJobBoosts', label: 'Free job boosts (+1)' },
];

const defaultReward = (amount, perk, milestone) => ({ amount, perk, milestone });

const ReferralConfig = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await api.get('/api/admin/referral-config');
                if (!cancelled) setConfig(response.data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError('Failed to load configuration.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const updateField = (path, value) => {
        setConfig((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const segments = path.split('.');
            let cursor = next;
            for (let i = 0; i < segments.length - 1; i++) cursor = cursor[segments[i]];
            cursor[segments[segments.length - 1]] = value;
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                enabled: !!config.enabled,
                selfReferralBlocked: !!config.selfReferralBlocked,
                maxReferralsPerDevice: Number(config.maxReferralsPerDevice) || 0,
                freelancerReward: config.freelancerReward || defaultReward(50, 'premiumChatUnlocks', 'firstJobApplied'),
                hiringReward: config.hiringReward || defaultReward(100, 'freeJobBoosts', 'firstJobPosted'),
                requesterReward: config.requesterReward || defaultReward(25, '', 'profileCompleted'),
            };
            const response = await api.put('/api/admin/referral-config', payload);
            setConfig(response.data);
            setSuccess('Saved successfully.');
            setTimeout(() => setSuccess(''), 2500);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) {
        return (
            <div className="card skeleton" style={{ height: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)' }}>
                    <Clock className="animate-spin" style={{ marginRight: '10px' }} /> Loading configuration...
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                    <button
                        onClick={() => navigate('/referrals')}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}
                    >
                        <ArrowLeft size={14} /> Back to referrals
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'rgba(168,85,247,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(168,85,247,0.2)',
                            }}
                        >
                            <Settings size={22} color="#a855f7" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Referral Configuration</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Tune rewards per role, set fraud limits, and enable or disable the program globally.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save changes'}
                </button>
            </header>

            {error && <div className="card" style={{ color: 'var(--danger)', background: 'var(--danger-light)', marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="card" style={{ color: 'var(--success)', background: 'rgba(34,197,94,0.12)', marginBottom: '1rem' }}>{success}</div>}

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Program controls</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <ToggleField
                        label="Program enabled"
                        description="Turn off to stop tracking new referrals."
                        value={!!config.enabled}
                        onChange={(v) => updateField('enabled', v)}
                    />
                    <ToggleField
                        label="Block self-referrals"
                        description="Prevent users from using their own code."
                        value={!!config.selfReferralBlocked}
                        onChange={(v) => updateField('selfReferralBlocked', v)}
                    />
                    <NumberField
                        label="Max referrals per device"
                        description="Same install can refer at most this many users."
                        value={config.maxReferralsPerDevice ?? 5}
                        onChange={(v) => updateField('maxReferralsPerDevice', v)}
                    />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift size={16} /> Reward rules
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <RewardEditor
                        title="Freelancer signed up"
                        reward={config.freelancerReward}
                        onChange={(field, value) => updateField(`freelancerReward.${field}`, value)}
                    />
                    <RewardEditor
                        title="Hiring partner signed up"
                        reward={config.hiringReward}
                        onChange={(field, value) => updateField(`hiringReward.${field}`, value)}
                    />
                    <RewardEditor
                        title="Requester signed up"
                        reward={config.requesterReward}
                        onChange={(field, value) => updateField(`requesterReward.${field}`, value)}
                    />
                </div>
            </div>
        </div>
    );
};

const ToggleField = ({ label, description, value, onChange }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', cursor: 'pointer' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</span>
        <span style={{ marginTop: '0.25rem' }}>
            <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
            <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>{value ? 'Enabled' : 'Disabled'}</span>
        </span>
    </label>
);

const NumberField = ({ label, description, value, onChange }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</span>
        <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
            }}
        />
    </label>
);

const RewardEditor = ({ title, reward, onChange }) => {
    const value = reward || { amount: 0, perk: '', milestone: 'profileCompleted' };
    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', background: 'var(--bg-hover)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trigger milestone</span>
                    <select
                        value={value.milestone || 'profileCompleted'}
                        onChange={(e) => onChange('milestone', e.target.value)}
                        style={selectStyle}
                    >
                        {MILESTONES.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Credits to referrer</span>
                    <input
                        type="number"
                        min={0}
                        value={value.amount || 0}
                        onChange={(e) => onChange('amount', Number(e.target.value))}
                        style={inputStyle}
                    />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Perk granted</span>
                    <select
                        value={value.perk || ''}
                        onChange={(e) => onChange('perk', e.target.value)}
                        style={selectStyle}
                    >
                        {PERKS.map((p) => (
                            <option key={p.value || 'none'} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
};

const selectStyle = {
    ...inputStyle,
};

export default ReferralConfig;
