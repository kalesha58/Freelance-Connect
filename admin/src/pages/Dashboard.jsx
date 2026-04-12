import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAdminLiveRefresh, formatAdminLastUpdated, ADMIN_STATS_POLL_MS } from '../hooks/useAdminLiveRefresh';
import { 
    Users, 
    Briefcase, 
    MessageSquare, 
    FileText,
    TrendingUp,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = useCallback(async (silent = false) => {
        try {
            if (silent) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await api.get('/api/admin/stats');
            setStats(response.data);
            setLastUpdated(new Date());
            setError('');
        } catch {
            if (!silent) {
                setError('Failed to fetch dashboard statistics.');
            }
        } finally {
            if (silent) {
                setIsRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchStats(false);
    }, [fetchStats]);

    useAdminLiveRefresh(() => {
        fetchStats(true);
    }, ADMIN_STATS_POLL_MS);

    if (loading) return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text" style={{ width: '250px' }}></div>
                </div>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="card skeleton skeleton-card" style={{ height: '140px' }}></div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card skeleton skeleton-card" style={{ height: '300px' }}></div>
                <div className="card skeleton skeleton-card" style={{ height: '300px' }}></div>
            </div>
        </div>
    );

    const statCards = [
        { title: 'Total Users', value: stats?.users || 0, icon: <Users />, color: '#6366f1', trend: '+12%' },
        { title: 'Active Jobs', value: stats?.jobs || 0, icon: <Briefcase />, color: '#10b981', trend: '+5%' },
        { title: 'Community Posts', value: stats?.posts || 0, icon: <MessageSquare />, color: '#f59e0b', trend: '+18%' },
        { title: 'Job Applications', value: stats?.applications || 0, icon: <FileText />, color: '#ef4444', trend: '+24%' },
    ];

    return (
        <div className="animate-fade-in">
            {error ? (
                <div
                    role="alert"
                    style={{
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: 'var(--danger)',
                        fontSize: '0.9rem',
                    }}
                >
                    {error}
                </div>
            ) : null}
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back, Admin</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Overview of Skill Link ecosystem</p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <TrendingUp size={16} color="var(--primary)" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            {isRefreshing ? 'Refreshing…' : 'Live stats (auto-refresh)'}
                        </span>
                        {lastUpdated && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                Last updated {formatAdminLastUpdated(lastUpdated)}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {statCards.map((stat) => (
                    <div key={stat.title} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            right: '-10px',
                            top: '-10px',
                            width: '80px',
                            height: '80px',
                            backgroundColor: stat.color,
                            opacity: 0.05,
                            borderRadius: '50%'
                        }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: `${stat.color}15`,
                                color: stat.color,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {stat.icon}
                            </div>
                            <button style={{ color: 'var(--text-light)', background: 'none' }}>
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{stat.value}</h3>
                            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.95rem' }}>{stat.title}</p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: stat.title.includes('Job') ? '#ef4444' : '#10b981',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                backgroundColor: stat.title.includes('Job') ? '#fee2e2' : '#dcfce7',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '20px'
                            }}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Recent Platform Activity</h3>
                        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>View All</button>
                    </div>
                    {/* Activity Table Mockup */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ borderBottom: '1px solid var(--border)' }}>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>ACTION</th>
                                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>USER</th>
                                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>STATUS</th>
                                <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>TIME</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { action: 'Job Posted', user: 'Techno Soft', status: 'Success', time: '2 mins ago' },
                                { action: 'New User Re...', user: 'Kalesha Baig', status: 'Pending', time: '15 mins ago' },
                                { action: 'Payment Receipt', user: 'John Doe', status: 'Success', time: '1 hour ago' },
                                { action: 'System Upd...', user: 'Auto-Bot', status: 'Info', time: '3 hours ago' }
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>{row.action}</td>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>{row.user}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{ 
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '6px', 
                                            fontSize: '0.75rem',
                                            backgroundColor: row.status === 'Success' ? '#dcfce7' : '#fef9c3',
                                            color: row.status === 'Success' ? '#166534' : '#854d0e'
                                        }}>{row.status}</span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>{row.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card" style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>System Health</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { label: 'Server Response', value: 98, color: '#10b981' },
                            { label: 'Database Load', value: 45, color: '#6366f1' },
                            { label: 'Storage Used', value: 72, color: '#f59e0b' }
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>{item.label}</span>
                                    <span>{item.value}%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${item.value}%`, backgroundColor: item.color, borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '2.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>All systems are currently operational. Next scheduled maintenance is in 48 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
