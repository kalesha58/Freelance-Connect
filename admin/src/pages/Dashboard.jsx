import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useAdminLiveRefresh, formatAdminLastUpdated, ADMIN_STATS_POLL_MS } from '../hooks/useAdminLiveRefresh';
import {
    Users,
    Briefcase,
    MessageSquare,
    FileText,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    RefreshCw,
    CheckCircle,
    Clock,
    AlertCircle,
    Info,
    Cpu,
    HardDrive,
    Wifi
} from 'lucide-react';

/* ─── Pure-SVG Area Chart ─── */
const AreaChart = ({ data, color1 = '#6366f1', color2 = '#8b5cf6', height = 140 }) => {
    const w = 600, h = height;
    const max = Math.max(...data.map(d => d.value), 1);
    const pts = data.map((d, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (d.value / max) * (h - 16);
        return `${x},${y}`;
    });
    const polyline = pts.join(' ');
    const area = `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
    const id = `grad-${color1.replace('#', '')}`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color1} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color1} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${id})`} />
            <polyline points={polyline} fill="none" stroke={color1} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((d, i) => {
                const x = (i / (data.length - 1)) * w;
                const y = h - (d.value / max) * (h - 16);
                return (
                    <circle key={i} cx={x} cy={y} r="4" fill={color1} stroke="white" strokeWidth="2">
                        <title>{d.label}: {d.value}</title>
                    </circle>
                );
            })}
        </svg>
    );
};

/* ─── Pure-CSS Bar Chart ─── */
const BarChart = ({ data, color = '#6366f1' }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '0 4px' }}>
            {data.map((d, i) => (
                <div key={i} style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    height: '100%', justifyContent: 'flex-end',
                }}>
                    <div style={{
                        width: '100%',
                        height: `${(d.value / max) * 88}px`,
                        background: `linear-gradient(180deg, ${color}, ${color}88)`,
                        borderRadius: '5px 5px 2px 2px',
                        transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)',
                        position: 'relative',
                        cursor: 'pointer',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                    >
                        <title>{d.label}: {d.value}</title>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ─── Animated Progress Bar ─── */
const GlowBar = ({ value, color, label, icon: Icon }) => (
    <div>
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '0.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {Icon && <Icon size={14} color="rgba(255,255,255,0.6)" />}
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{value}%</span>
        </div>
        <div style={{
            height: '6px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
        }}>
            <div style={{
                height: '100%', width: `${value}%`,
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                borderRadius: '99px',
                boxShadow: `0 0 10px ${color}88`,
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
            }} />
        </div>
    </div>
);

/* ─── Mini KPI Card ─── */
const StatCard = ({ stat, delay }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const end = stat.value;
        if (end === 0) return;
        let start = 0;
        const duration = 1200;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start = Math.min(start + step, end);
            setCount(Math.floor(start));
            if (start >= end) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [stat.value]);

    const isPositive = stat.trend.startsWith('+');

    return (
        <div className="card animate-fade-in" style={{
            animationDelay: `${delay}s`,
            background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card) 60%, ${stat.color}08 100%)`,
            overflow: 'hidden',
            cursor: 'default',
        }}>
            {/* Decorative orb */}
            <div style={{
                position: 'absolute', top: '-24px', right: '-24px',
                width: '100px', height: '100px',
                background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
            }} />

            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '1.25rem',
            }}>
                <div style={{
                    width: '46px', height: '46px',
                    background: `linear-gradient(135deg, ${stat.color}25, ${stat.color}12)`,
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${stat.color}25`,
                    boxShadow: `0 4px 16px ${stat.color}20`,
                }}>
                    <stat.icon size={20} color={stat.color} strokeWidth={2} />
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    fontSize: '0.7rem', fontWeight: '700',
                    color: isPositive ? 'var(--success)' : 'var(--danger)',
                    background: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
                    border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '99px',
                }}>
                    {isPositive ? <ArrowUpRight size={11} strokeWidth={3} /> : <ArrowDownRight size={11} strokeWidth={3} />}
                    {stat.trend}
                </span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {count.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontWeight: '500' }}>
                {stat.title}
            </div>
            <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
                <TrendingUp size={12} color="var(--text-light)" />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                    {stat.sub}
                </span>
            </div>
        </div>
    );
};

/* ─── Activity row status config ─── */
const statusConfig = {
    Success: { color: 'var(--success)',  bg: 'var(--success-light)', icon: CheckCircle },
    Pending: { color: 'var(--warning)',  bg: 'var(--warning-light)', icon: Clock },
    Info:    { color: 'var(--info)',     bg: 'var(--info-light)',    icon: Info },
    Error:   { color: 'var(--danger)',   bg: 'var(--danger-light)',  icon: AlertCircle },
};

/* ─── Main Dashboard ─── */
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = useCallback(async (silent = false) => {
        try {
            if (silent) setIsRefreshing(true); else setLoading(true);
            const response = await api.get('/api/admin/stats');
            setStats(response.data);
            setLastUpdated(new Date());
            setError('');
        } catch {
            if (!silent) setError('Failed to fetch dashboard statistics.');
        } finally {
            if (silent) setIsRefreshing(false); else setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(false); }, [fetchStats]);
    useAdminLiveRefresh(() => { fetchStats(true); }, ADMIN_STATS_POLL_MS);

    /* ── Skeleton ── */
    if (loading) return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[1,2,3,4].map(i => <div key={i} className="card skeleton" style={{ height: '160px', animationDelay: `${i*0.08}s` }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card skeleton" style={{ height: '280px' }} />
                <div className="card skeleton" style={{ height: '280px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card skeleton" style={{ height: '220px' }} />
                <div className="card skeleton" style={{ height: '220px' }} />
            </div>
        </div>
    );

    const statCards = [
        { title: 'Total Users',      value: stats?.users        || 0, icon: Users,       color: '#6366f1', trend: '+12%', sub: 'vs. last month' },
        { title: 'Active Jobs',      value: stats?.jobs         || 0, icon: Briefcase,   color: '#10b981', trend: '+5%',  sub: 'open listings' },
        { title: 'Community Posts',  value: stats?.posts        || 0, icon: MessageSquare, color: '#f59e0b', trend: '+18%', sub: 'published posts' },
        { title: 'Job Applications', value: stats?.applications || 0, icon: FileText,    color: '#f43f5e', trend: '+24%', sub: 'total applications' },
    ];

    const growthData = [
        { label: 'Jan', value: 120 }, { label: 'Feb', value: 185 }, { label: 'Mar', value: 160 },
        { label: 'Apr', value: 230 }, { label: 'May', value: 195 }, { label: 'Jun', value: 280 },
        { label: 'Jul', value: 310 }, { label: 'Aug', value: 265 }, { label: 'Sep', value: 340 },
        { label: 'Oct', value: 390 }, { label: 'Nov', value: 420 }, { label: 'Dec', value: 480 },
    ];

    const weeklyJobs = [
        { label: 'Mon', value: 14 }, { label: 'Tue', value: 22 }, { label: 'Wed', value: 18 },
        { label: 'Thu', value: 31 }, { label: 'Fri', value: 27 }, { label: 'Sat', value: 9 },
        { label: 'Sun', value: 5 },
    ];

    const activityFeed = [
        { action: 'New Job Posted', user: 'Techno Soft Ltd.', status: 'Success', time: '2 min ago', description: 'Senior React Developer' },
        { action: 'User Registered', user: 'Kalesha Baig', status: 'Pending', time: '15 min ago', description: 'Email verification pending' },
        { action: 'Application Received', user: 'John Doe', status: 'Success', time: '1 hr ago', description: 'Applied to UI Designer role' },
        { action: 'Maintenance Run', user: 'Auto-Bot', status: 'Info', time: '3 hr ago', description: 'DB backup completed' },
        { action: 'Login Failed', user: 'Unknown IP', status: 'Error', time: '5 hr ago', description: '3 consecutive failed attempts' },
    ];

    return (
        <div>
            {error && (
                <div style={{
                    marginBottom: '1.5rem', padding: '0.875rem 1.25rem',
                    borderRadius: 'var(--radius-md)', background: 'var(--danger-light)',
                    border: '1px solid rgba(244,63,94,0.25)', color: 'var(--danger)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem',
                }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* ── Live status bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1.75rem',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.625rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
                        Welcome back, <span className="gradient-text">Admin</span> 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Here's what's happening on your platform today.
                    </p>
                </div>
                <button
                    onClick={() => fetchStats(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-light)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
                    {isRefreshing ? 'Refreshing…' : lastUpdated ? `Updated ${formatAdminLastUpdated(lastUpdated)}` : 'Refresh'}
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem', marginBottom: '1.75rem',
            }}>
                {statCards.map((s, i) => <StatCard key={s.title} stat={s} delay={i * 0.07} />)}
            </div>

            {/* ── Row 2: Area chart + Bar chart ── */}
            <div style={{
                display: 'grid', gridTemplateColumns: '3fr 2fr',
                gap: '1.25rem', marginBottom: '1.25rem',
            }}>
                {/* Area chart — user growth */}
                <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        marginBottom: '1.25rem',
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                                User Growth
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Monthly new registrations
                            </p>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'var(--success-light)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '99px', padding: '0.25rem 0.65rem',
                            fontSize: '0.72rem', fontWeight: '700', color: 'var(--success)',
                        }}>
                            <ArrowUpRight size={11} strokeWidth={3} /> +28% YTD
                        </div>
                    </div>
                    <AreaChart data={growthData} color1="#6366f1" />
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem',
                        paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
                    }}>
                        {['Jan','Mar','Jun','Sep','Dec'].map(m => (
                            <span key={m} style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{m}</span>
                        ))}
                    </div>
                </div>

                {/* Bar chart — weekly jobs */}
                <div className="card animate-fade-in" style={{ animationDelay: '0.38s' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                            Job Posts This Week
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Daily job listing count
                        </p>
                    </div>
                    <BarChart data={weeklyJobs} color="#10b981" />
                    <div style={{
                        marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)',
                    }}>
                        <span>Peak: <strong style={{ color: 'var(--success)' }}>Thursday (31)</strong></span>
                        <span>Avg: <strong style={{ color: 'var(--text-main)' }}>18/day</strong></span>
                    </div>
                </div>
            </div>

            {/* ── Row 3: Activity + System Health ── */}
            <div style={{
                display: 'grid', gridTemplateColumns: '3fr 2fr',
                gap: '1.25rem',
            }}>
                {/* Activity Feed */}
                <div className="card animate-fade-in" style={{ animationDelay: '0.45s' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '1.25rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '9px',
                                background: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Activity size={16} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Activity</h3>
                        </div>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.875rem' }}>
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {activityFeed.map((row, i) => {
                            const cfg = statusConfig[row.status] || statusConfig.Info;
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={i} style={{
                                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                                    padding: '0.875rem 0',
                                    borderBottom: i < activityFeed.length - 1 ? '1px solid var(--border)' : 'none',
                                }}>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '10px',
                                        background: cfg.bg, border: `1px solid ${cfg.color}22`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <StatusIcon size={15} color={cfg.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem',
                                        }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{row.action}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', flexShrink: 0 }}>{row.time}</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            <strong style={{ color: 'var(--text-main)' }}>{row.user}</strong> — {row.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Health */}
                <div className="card animate-fade-in" style={{
                    animationDelay: '0.52s',
                    background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: '0 4px 24px rgba(99,102,241,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '9px',
                            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Activity size={16} color="#a78bfa" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>System Health</h3>
                        <div style={{
                            marginLeft: 'auto',
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)',
                        }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <GlowBar value={98} color="#10b981" label="Server Response" icon={Wifi} />
                        <GlowBar value={45} color="#6366f1" label="Database Load" icon={HardDrive} />
                        <GlowBar value={72} color="#f59e0b" label="Storage Used" icon={Cpu} />
                    </div>

                    <div style={{
                        marginTop: '1.5rem', padding: '0.875rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.35rem',
                        }}>
                            <CheckCircle size={13} color="#10b981" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981' }}>
                                All Systems Operational
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                            Next scheduled maintenance in 48 hours. Auto-backup enabled.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
