import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { 
    Flag, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    MessageSquare, 
    User, 
    Briefcase, 
    ExternalLink,
    Clock,
    Shield,
    Trash2
} from 'lucide-react';
import { formatDisplayDate } from '../utils/formatDisplayDate';

const Moderation = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('pending'); // pending, resolved, dismissed

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/reports');
            setReports(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch reports.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleAction = async (reportId, action, notes) => {
        try {
            await api.put(`/api/admin/reports/${reportId}`, { 
                status: action, 
                adminNotes: notes 
            });
            fetchReports();
        } catch (err) {
            alert('Action failed');
        }
    };

    const filteredReports = reports.filter(r => r.status === filter);

    const getIcon = (type) => {
        switch(type) {
            case 'User': return <User size={16} />;
            case 'Job': return <Briefcase size={16} />;
            case 'Post': return <MessageSquare size={16} />;
            default: return <Flag size={16} />;
        }
    };

    if (loading) return (
        <div className="card skeleton" style={{ height: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)' }}>
                <Clock className="animate-spin" style={{ marginRight: '10px' }} /> Loading Moderation Queue...
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: 'var(--danger-light)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' 
                    }}>
                        <Shield size={24} color="var(--danger)" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Moderation Center</h1>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Review and resolve user-reported content to keep the platform safe.</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {['pending', 'resolved', 'dismissed'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`btn ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {tab}
                        {tab === 'pending' && filteredReports.length > 0 && (
                            <span style={{ 
                                marginLeft: '8px', background: 'var(--danger)', color: 'white', 
                                padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' 
                            }}>
                                {filteredReports.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {error && <div className="card" style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>{error}</div>}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>REPORTER</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>TARGET TYPE</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>REASON</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>REPORTED AT</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <CheckCircle size={48} color="var(--success)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>No {filter} reports found. Great job!</p>
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map(report => (
                                <tr key={report._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: '600' }}>{report.reporterId?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.reporterId?.email}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--info)' }}>
                                            {getIcon(report.targetType)}
                                            <span style={{ fontWeight: '500' }}>{report.targetType}</span>
                                        </div>
                                        {report.target && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {report.target.name || report.target.title || report.target.caption?.substring(0, 20)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            background: 'var(--bg-hover)', padding: '0.5rem', 
                                            borderRadius: '6px', fontSize: '0.85rem', borderLeft: '3px solid var(--danger)' 
                                        }}>
                                            {report.reason}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {formatDisplayDate(report.createdAt)}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {filter === 'pending' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleAction(report._id, 'resolved', 'Compliant with rules')}
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '0.4rem', color: 'var(--success)' }}
                                                        title="Resolve / Dismiss"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(report._id, 'dismissed', 'Inaccurate report')}
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '0.4rem', color: 'var(--danger)' }}
                                                        title="Dismiss Report"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                    {report.status}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Moderation;
