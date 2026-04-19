import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Calendar,
    IndianRupee,
    Clock,
    User,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    Tag,
    FileText,
    Globe,
    Layers,
    ExternalLink
} from 'lucide-react';
import Modal from '../components/Modal';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formContent, setFormContent] = useState({});

    const fetchJob = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/admin/jobs/${id}`);
            setJob(response.data);
            setFormContent(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load job details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await api.delete(`/api/admin/jobs/${id}`);
            navigate('/jobs');
        } catch (err) {
            alert('Failed to delete job.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Reusing the same endpoint as list-based edit
            await api.put(`/api/admin/jobs/${id}`, formContent);
            await fetchJob();
            setIsEditModalOpen(false);
        } catch (err) {
            alert('Failed to update job.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    if (error || !job) return (
        <div className="card text-center" style={{ padding: '4rem' }}>
            <XCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Error Loading Job</h3>
            <p style={{ color: 'var(--text-muted)' }}>{error || 'Job not found.'}</p>
            <button onClick={() => navigate('/jobs')} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Back to Job Management
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/jobs')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Jobs
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Edit2 size={16} /> Edit Job
                    </button>
                    <button onClick={handleDelete} className="btn" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trash2 size={16} /> Delete Job
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Content Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--primary-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                <Briefcase size={32} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{job.title}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{job.category}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <MapPin size={14} /> {job.location} {job.isRemote && '(Remote)'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <Clock size={14} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="divider" style={{ margin: '2rem 0' }} />

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={20} color="var(--primary)" /> Job Description
                            </h3>
                            <div style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                                {job.description || 'No detailed description provided.'}
                            </div>
                        </div>

                        {job.requirements && job.requirements.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={20} color="var(--primary)" /> Requirements
                                </h3>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0, paddingLeft: '1.5rem' }}>
                                    {job.requirements.map((req, idx) => (
                                        <li key={idx} style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column: Job Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Budget Card */}
                    <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                            Project Budget
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <IndianRupee size={28} color="var(--success)" strokeWidth={3} />
                            <span style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif' }}>{job.budget}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Tag size={14} color="var(--text-light)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>{job.budgetType || 'Fixed Price'}</span>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            About the Client
                        </h3>
                        {job.clientId ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {job.clientId.profilePic || job.clientId.avatar ? (
                                            <img src={job.clientId.profilePic || job.clientId.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        ) : <User size={24} color="var(--text-light)" />}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.clientId.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.clientId.email}</div>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/users/${job.clientId._id}`)} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    View Full Profile <ExternalLink size={14} />
                                </button>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Client information unavailable</p>
                        )}
                    </div>

                    {/* Additional Metadata */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Job Stats
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={14} /> Remote</span>
                                <span style={{ fontWeight: '600' }}>{job.isRemote ? 'Yes' : 'No'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={14} /> Applications</span>
                                <span style={{ fontWeight: '600' }}>{job.applicationsCount || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={14} /> Status</span>
                                <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                    {job.status || 'open'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Job Posting"
                headerActions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                        <button type="submit" form="edit-job-form" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <form id="edit-job-form" onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <input className="form-input" value={formContent.title || ''} onChange={e => setFormContent({...formContent, title: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Budget (₹)</label>
                            <input className="form-input" value={formContent.budget || ''} onChange={e => setFormContent({...formContent, budget: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-input" value={formContent.category || ''} onChange={e => setFormContent({...formContent, category: e.target.value})}>
                                <option value="Development">Development</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Writing">Writing</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-input" value={formContent.location || ''} onChange={e => setFormContent({...formContent, location: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" style={{ minHeight: '150px' }} value={formContent.description || ''} onChange={e => setFormContent({...formContent, description: e.target.value})} />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JobDetails;
