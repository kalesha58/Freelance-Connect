import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    Activity, 
    ArrowLeft, 
    User, 
    Briefcase, 
    MessageSquare, 
    Clock, 
    CheckCircle2, 
    Info, 
    ExternalLink,
    Filter,
    Search,
    ChevronRight,
    Loader2,
    XCircle
} from 'lucide-react';
import { formatDisplayDate } from '../utils/formatDisplayDate';

const statusConfig = {
    Success: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    Pending: { icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    Error:   { icon: XCircle,      color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
    Info:    { icon: Info,         color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
};

const ActivityLogs = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/activity');
            setActivities(response.data);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const getIcon = (type) => {
        switch(type) {
            case 'User': return <User size={16} />;
            case 'Job': return <Briefcase size={16} />;
            case 'Post': return <MessageSquare size={16} />;
            default: return <Activity size={16} />;
        }
    };

    const handleNavigate = (type, id) => {
        if (!id) return;
        if (type === 'User') navigate(`/users/${id}`);
        else if (type === 'Job') navigate(`/jobs/${id}`);
        else if (type === 'Post') navigate(`/posts/${id}`);
    };

    const filteredActivities = activities.filter(act => {
        const matchesSearch = act.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             act.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             act.action?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || act.type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/')} 
                    className="btn btn-secondary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: 'var(--primary-light)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.2)' 
                    }}>
                        <Activity size={24} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Platform Activity Logs</h1>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>A comprehensive audit trail of all actions performed on SkilLynk.</p>
            </header>

            {/* Filters Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                    <input 
                        type="text" 
                        placeholder="Search activities, users, or descriptions..." 
                        className="form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select 
                        className="form-input" 
                        style={{ width: '150px' }}
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="User">Users</option>
                        <option value="Job">Jobs</option>
                        <option value="Post">Posts</option>
                    </select>
                </div>
                <button onClick={fetchActivities} className="btn btn-secondary" style={{ padding: '0.6rem' }}>
                    Refresh
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>EVENT</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>DETAILS</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>TIMESTAMP</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActivities.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Activity size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No activities matching your criteria.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredActivities.map((act, i) => {
                                const cfg = statusConfig[act.status] || statusConfig.Info;
                                const StatusIcon = cfg.icon;
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ 
                                                    width: '32px', height: '32px', borderRadius: '8px', 
                                                    background: cfg.bg, display: 'flex', 
                                                    alignItems: 'center', justifyContent: 'center' 
                                                }}>
                                                    <StatusIcon size={16} color={cfg.color} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{act.action}</div>
                                                    <div style={{ 
                                                        fontSize: '0.7rem', display: 'flex', alignItems: 'center', 
                                                        gap: '0.3rem', color: 'var(--info)', marginTop: '2px' 
                                                    }}>
                                                        {getIcon(act.type)} {act.type}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <strong style={{ color: 'var(--text-main)' }}>{act.user}</strong>
                                                <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>— {act.description}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {formatDisplayDate(act.time)}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleNavigate(act.type, act.id)}
                                                className="btn btn-secondary" 
                                                style={{ padding: '0.4rem', color: 'var(--primary)' }}
                                                title="View Details"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
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

export default ActivityLogs;
