import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    Gift,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Settings,
    Users,
    TrendingUp,
} from 'lucide-react';
import { formatDisplayDate } from '../utils/formatDisplayDate';

const STATUS_TABS = [
    { id: 'all', label: 'All' },
    { id: 'signed_up', label: 'Joined' },
    { id: 'milestone_completed', label: 'In Progress' },
    { id: 'rewarded', label: 'Rewarded' },
    { id: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE = {
    signed_up: { label: 'Joined', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
    milestone_completed: { label: 'In Progress', color: 'var(--info)', bg: 'rgba(99,102,241,0.12)' },
    rewarded: { label: 'Rewarded', color: 'var(--success)', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Rejected', color: 'var(--danger)', bg: 'rgba(239,68,68,0.12)' },
};

const milestoneShort = {
    profileCompleted: 'Profile',
    firstJobApplied: 'Apply',
    firstJobPosted: 'Post',
    firstHire: 'Hire',
};

const ReferralManagement = () => {
    const navigate = useNavigate();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [busyIds, setBusyIds] = useState({});

    const fetchReferrals = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search.trim()) params.q = search.trim();
            const response = await api.get('/api/admin/referrals', { params });
            setReferrals(response.data || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch referrals.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    const handleApprove = async (id) => {
        setBusyIds((prev) => ({ ...prev, [id]: true }));
        try {
            await api.put(`/api/admin/referrals/${id}/approve`);
            await fetchReferrals();
        } catch (err) {
            alert(err?.response?.data?.message || 'Approve failed');
        } finally {
            setBusyIds((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejecting this referral? (optional)') || '';
        setBusyIds((prev) => ({ ...prev, [id]: true }));
        try {
            await api.put(`/api/admin/referrals/${id}/reject`, { reason });
            await fetchReferrals();
        } catch (err) {
            alert(err?.response?.data?.message || 'Reject failed');
        } finally {
            setBusyIds((prev) => ({ ...prev, [id]: false }));
        }
    };

    const stats = useMemo(() => {
        const totals = referrals.reduce(
            (acc, r) => {
                acc.total += 1;
                if (r.status === 'rewarded') acc.rewarded += 1;
                if (r.status === 'signed_up' || r.status === 'milestone_completed') acc.pending += 1;
                if (r.status === 'rejected') acc.rejected += 1;
                acc.creditsPaid += r.rewardAmount || 0;
                return acc;
            },
            { total: 0, rewarded: 0, pending: 0, rejected: 0, creditsPaid: 0 }
        );
        return totals;
    }, [referrals]);

    if (loading) {
        return (
            <div className="card skeleton" style={{ height: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)' }}>
                    <Clock className="animate-spin" style={{ marginRight: '10px' }} /> Loading Referrals...
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
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
                            <Gift size={22} color="#a855f7" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Referral Program</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Audit referrals, approve rewards manually, and tune program rules.</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/referrals/config')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Settings size={16} /> Configure rewards
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard icon={<Users size={18} />} label="Total Referrals" value={stats.total} />
                <StatCard icon={<TrendingUp size={18} />} label="In Progress" value={stats.pending} accent="var(--info)" />
                <StatCard icon={<CheckCircle size={18} />} label="Rewarded" value={stats.rewarded} accent="var(--success)" />
                <StatCard icon={<XCircle size={18} />} label="Rejected" value={stats.rejected} accent="var(--danger)" />
                <StatCard icon={<Gift size={18} />} label="Credits paid" value={stats.creditsPaid} accent="#a855f7" />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setStatusFilter(t.id)}
                            className={`btn ${statusFilter === t.id ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or code"
                        style={{
                            padding: '0.5rem 0.75rem 0.5rem 2rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            minWidth: '260px',
                        }}
                    />
                </div>
            </div>

            {error && <div className="card" style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>{error}</div>}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
                            <th style={th}>REFERRER</th>
                            <th style={th}>REFERRED</th>
                            <th style={th}>CODE</th>
                            <th style={th}>STATUS</th>
                            <th style={th}>MILESTONES</th>
                            <th style={th}>REWARD</th>
                            <th style={th}>CREATED</th>
                            <th style={{ ...th, textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Gift size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>No referrals found for the current filter.</p>
                                </td>
                            </tr>
                        ) : (
                            referrals.map((r) => {
                                const badge = STATUS_BADGE[r.status] || STATUS_BADGE.signed_up;
                                const milestones = Object.entries(r.milestones || {})
                                    .filter(([, v]) => v?.done)
                                    .map(([k]) => milestoneShort[k] || k);
                                const busy = !!busyIds[r._id];
                                return (
                                    <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={td}>
                                            <div style={{ fontWeight: 600 }}>{r.referrerId?.name || 'Unknown'}</div>
                                            <div style={subText}>{r.referrerId?.email}</div>
                                        </td>
                                        <td style={td}>
                                            <div style={{ fontWeight: 600 }}>{r.referredUserId?.name || 'Unknown'}</div>
                                            <div style={subText}>{r.referredUserId?.email}</div>
                                        </td>
                                        <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.referralCode}</td>
                                        <td style={td}>
                                            <span
                                                style={{
                                                    background: badge.bg,
                                                    color: badge.color,
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td style={td}>
                                            {milestones.length === 0 ? (
                                                <span style={subText}>—</span>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                    {milestones.map((m) => (
                                                        <span
                                                            key={m}
                                                            style={{
                                                                background: 'var(--bg-hover)',
                                                                color: 'var(--text-main)',
                                                                padding: '0.15rem 0.5rem',
                                                                borderRadius: '6px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td style={td}>
                                            {r.rewardGiven ? (
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                        +{r.rewardAmount || 0}
                                                    </div>
                                                    {r.rewardPerk && <div style={subText}>{r.rewardPerk}</div>}
                                                </div>
                                            ) : (
                                                <span style={subText}>Pending</span>
                                            )}
                                        </td>
                                        <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {formatDisplayDate(r.createdAt)}
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            {r.status !== 'rewarded' && r.status !== 'rejected' && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleApprove(r._id)}
                                                        disabled={busy}
                                                        style={{ padding: '0.4rem', color: 'var(--success)' }}
                                                        title="Approve reward"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleReject(r._id)}
                                                        disabled={busy}
                                                        style={{ padding: '0.4rem', color: 'var(--danger)' }}
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, accent }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accent || 'var(--text-main)',
            }}
        >
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                {label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent || 'var(--text-main)' }}>{value}</div>
        </div>
    </div>
);

const th = {
    textAlign: 'left',
    padding: '1rem 1.5rem',
    color: 'var(--text-light)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
};

const td = {
    padding: '1rem 1.5rem',
};

const subText = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: 2,
};

export default ReferralManagement;
