import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Trash2, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    Search, 
    MoreVertical,
    FileText
} from 'lucide-react';

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJobs = async () => {
        try {
            const response = await api.get('/api/admin/jobs');
            setJobs(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job listing?')) return;
        try {
            await api.delete(`/api/admin/jobs/${id}`);
            setJobs(jobs.filter(j => j._id !== id));
        } catch (err) {
            alert('Error deleting job.');
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text" style={{ width: '200px' }}></div>
                </div>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="card skeleton skeleton-card" style={{ height: '220px' }}></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Job Listings</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor and manage all job postings</p>
                </div>
            </header>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#fafafa' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-light)'
                        }} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', backgroundColor: 'white' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {filteredJobs.map(job => (
                            <div key={job._id} className="card" style={{ 
                                padding: '1.25rem', 
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary)'
                                    }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(job._id)}
                                        style={{ background: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>{job.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{job.company}</p>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <MapPin size={14} /> {job.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <DollarSign size={14} /> {job.salary}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} /> {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '0.75rem',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        border: '1px dashed var(--border)',
                                        marginBottom: '1rem'
                                    }}>
                                        {job.description?.substring(0, 100)}...
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={12} color="var(--primary)" />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{job.applications?.length || 0} Applications</span>
                                        </div>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            backgroundColor: job.status === 'open' ? '#dcfce7' : '#fef9c3',
                                            color: job.status === 'open' ? '#166534' : '#854d0e'
                                        }}>
                                            {job.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {filteredJobs.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <Briefcase size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No jobs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobManagement;
