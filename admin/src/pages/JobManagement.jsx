import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAdminLiveRefresh, formatAdminLastUpdated, ADMIN_LIST_POLL_MS } from '../hooks/useAdminLiveRefresh';
import { formatJobCardDate } from '../utils/formatDisplayDate';
import { 
    Trash2, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    Search, 
    MoreVertical,
    FileText,
    Plus,
    AlertCircle,
    X,
    Filter
} from 'lucide-react';
import Modal from '../components/Modal';

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        budget: '',
        budgetType: 'fixed',
        location: 'Remote',
        description: '',
        category: 'Development',
        clientId: '',
        isRemote: true
    });
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [jobsRes, usersRes] = await Promise.all([
                api.get('/api/admin/jobs'),
                api.get('/api/admin/users')
            ]);
            setJobs(jobsRes.data);
            setUsers(usersRes.data.filter(u => u.role === 'hiring'));
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    useAdminLiveRefresh(() => {
        fetchData(true);
    }, ADMIN_LIST_POLL_MS);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        if (!formData.clientId) return alert('Please select a Hiring Partner');
        setSubmitting(true);
        try {
            await api.post('/api/admin/jobs', formData);
            await fetchData(true);
            setIsModalOpen(false);
            setFormData({
                title: '', budget: '', budgetType: 'fixed', location: 'Remote',
                description: '', category: 'Development', clientId: '', isRemote: true
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating job');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job listing?')) return;
        try {
            await api.delete(`/api/admin/jobs/${id}`);
            setJobs(jobs.filter(j => j._id !== id));
        } catch (deleteErr) {
            alert(deleteErr.response?.data?.message || 'Error deleting job.');
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

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
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: '800' }}>Job Listings</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor and manage all job postings</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Auto-refresh · Last sync {formatAdminLastUpdated(lastUpdated)}
                        </span>
                    )}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Post New Job
                    </button>
                </div>
            </header>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: '1px solid var(--border)', 
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    gap: '1.5rem'
                }}>
                    <div style={{ position: 'relative', flex: 2 }}>
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
                            style={{ paddingLeft: '2.75rem', backgroundColor: 'white', height: '48px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <select 
                            className="form-input"
                            style={{ backgroundColor: 'white', height: '48px', appearance: 'none' }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="Development">Development</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Writing">Writing</option>
                        </select>
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
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{job.clientName}</p>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <MapPin size={14} /> {job.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <DollarSign size={14} /> {job.budget}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} /> {formatJobCardDate(job)}
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
                        <p>No jobs found matching filters.</p>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Post New Job Listing"
                headerActions={
                    <button
                        type="submit"
                        form="admin-create-job-form"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Posting...' : 'Post Job'}
                    </button>
                }
            >
                <form id="admin-create-job-form" onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Job Title</label>
                            <input 
                                required
                                className="form-input" 
                                placeholder="e.g. Senior React Developer"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Assign to Hiring Partner</label>
                            <select 
                                required
                                className="form-input"
                                value={formData.clientId}
                                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                            >
                                <option value="">Select Partner...</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Budget (e.g. $500)</label>
                            <input 
                                required
                                className="form-input" 
                                placeholder="$500"
                                value={formData.budget}
                                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Category</label>
                            <select 
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Development">Development</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Writing">Writing</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Job Description</label>
                        <textarea 
                            required
                            className="form-input" 
                            style={{ minHeight: '100px', paddingTop: '0.75rem' }}
                            placeholder="Describe the job requirements..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ width: '100%', backgroundColor: '#f1f5f9', border: 'none' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JobManagement;
