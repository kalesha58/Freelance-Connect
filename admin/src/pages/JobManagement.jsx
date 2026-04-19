import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAdminLiveRefresh, formatAdminLastUpdated, ADMIN_LIST_POLL_MS } from '../hooks/useAdminLiveRefresh';
import { formatJobCardDate } from '../utils/formatDisplayDate';
import { 
    Trash2, 
    Briefcase, 
    MapPin, 
    IndianRupee, 
    Clock, 
    Search, 
    MoreVertical,
    FileText,
    Plus,
    AlertCircle,
    X,
    Filter,
    Loader2,
    ExternalLink
} from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const JobManagement = () => {
    const navigate = useNavigate();
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
                            job.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter]);

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const paginatedJobs = filteredJobs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
                    backgroundColor: 'var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
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
                            placeholder="Search jobs or partners..."
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', height: '44px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <select 
                            className="form-input"
                            style={{ height: '44px', appearance: 'none', cursor: 'pointer' }}
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

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-main)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Job Title</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Budget / Location</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Applicants</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Posted Date</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedJobs.map((job) => (
                                <tr key={job._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: 'linear-gradient(135deg, var(--primary-light), rgba(139,92,246,0.1))',
                                                border: '1px solid var(--border)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--primary)', flexShrink: 0,
                                            }}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.1rem' }}>{job.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.clientName || 'Hiring Partner'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span className={`badge ${
                                            job.category === 'Development' ? 'badge-primary' : 
                                            job.category === 'Design' ? 'badge-info' : 
                                            job.category === 'Marketing' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                            {job.category || 'General'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                                <IndianRupee size={14} color="var(--success)" /> {job.budget}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <MapPin size={12} /> {job.location}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FileText size={14} color="var(--primary)" />
                                            </div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                                {job.applications?.length || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <Clock size={13} /> {formatJobCardDate(job)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                                            {job.status || 'Active'}
                                        </span>
                                    </td>                                     <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}
                                                className="btn" 
                                                style={{ padding: '0.4rem', color: 'var(--info)', backgroundColor: 'transparent' }}
                                                title="View/Edit full details"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(job._id); }}
                                                className="btn" 
                                                style={{ padding: '0.4rem', color: '#ef4444', backgroundColor: 'transparent' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredJobs.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <Briefcase size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No jobs found matching filters.</p>
                    </div>
                )}

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredJobs.length}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                />
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Budget (e.g. ₹500)</label>
                            <input 
                                required
                                className="form-input" 
                                placeholder="₹500"
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
