import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    MapPin,
    Calendar,
    Briefcase,
    Star,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    ExternalLink,
    Award,
    BookOpen,
    Loader2,
    MessageSquare,
    Link as LinkIcon
} from 'lucide-react';
import Modal from '../components/Modal';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formContent, setFormContent] = useState({});

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/admin/users/${id}`);
            setUser(response.data);
            setFormContent(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load user details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            navigate('/users');
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/api/admin/users/${id}`, formContent);
            await fetchUser();
            setIsEditModalOpen(false);
        } catch (err) {
            alert('Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    if (error || !user) return (
        <div className="card text-center" style={{ padding: '4rem' }}>
            <XCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Error Loading User</h3>
            <p style={{ color: 'var(--text-muted)' }}>{error || 'User not found.'}</p>
            <button onClick={() => navigate('/users')} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Back to User Management
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/users')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Users
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Edit2 size={16} /> Edit Profile
                    </button>
                    <button onClick={handleDelete} className="btn" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trash2 size={16} /> Delete User
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                            {user.profilePic || user.avatar ? (
                                <img src={user.profilePic || user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            ) : <User size={60} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate( -50%, -50% )', color: 'var(--text-light)' }} />}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>{user.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            <Shield size={14} color={user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)'} />
                            <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{user.role}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                            {user.bio || 'No bio provided for this user.'}
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <Mail size={16} color="var(--primary)" />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <MapPin size={16} color="var(--primary)" />
                                <span>{user.location || 'Location not set'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <Calendar size={16} color="var(--primary)" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {user.role === 'freelancer' && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Freelancer Metrics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Rate</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--success)' }}>₹{user.hourlyRate}/hr</div>
                                </div>
                                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Rating</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                        <Star size={18} fill="currentColor" color="#f59e0b" /> {user.rating || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(user.role === 'requester' || user.role === 'hiring') && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Hiring Metrics</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.875rem' }}>Total Jobs Posted</span>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{user.totalJobs || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.875rem' }}>Active Listings</span>
                                    <span style={{ fontWeight: '700', color: 'var(--warning)' }}>{user.pendingJobs || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Detailed Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Tagline / Skills */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={20} color="var(--primary)" /> Expertise & Bio
                        </h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tagline</h4>
                            <p style={{ fontSize: '1rem', fontWeight: '500' }}>{user.tagline || 'No tagline set'}</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Skills & Technologies</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {user.skills && user.skills.length > 0 ? user.skills.map(skill => (
                                    <span key={skill} style={{ padding: '0.4rem 0.875rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {skill}
                                    </span>
                                )) : <span style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontStyle: 'italic' }}>No skills listed</span>}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    {user.role === 'freelancer' && (
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={20} color="var(--primary)" /> Portfolio
                                </h3>
                                {user.portfolioUrl && (
                                    <a href={user.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <ExternalLink size={12} /> External Portfolio
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {user.portfolioItems && user.portfolioItems.length > 0 ? user.portfolioItems.map((item, idx) => (
                                    <div key={idx} style={{ borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg-main)' }}>
                                        <div style={{ height: '120px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Briefcase color="#94a3b8" />}
                                        </div>
                                        <div style={{ padding: '0.875rem' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{item.title}</div>
                                            {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>View <LinkIcon size={10} /></a>}
                                        </div>
                                    </div>
                                )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No portfolio items added yet.</div>}
                            </div>
                        </div>
                    )}

                    {/* Experience & Education */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Award size={18} color="var(--primary)" /> Experience
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.experience && user.experience.length > 0 ? user.experience.map((exp, idx) => (
                                    <div key={idx} style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--primary-light)', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                                        <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{exp.role}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.company}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{exp.startYear} - {exp.endYear || 'Present'}</div>
                                    </div>
                                )) : <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No experience records.</div>}
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={18} color="var(--primary)" /> Education
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.education && user.education.length > 0 ? user.education.map((edu, idx) => (
                                    <div key={idx} style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--secondary-light)', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }} />
                                        <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{edu.degree}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{edu.institution}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{edu.startYear} - {edu.endYear}</div>
                                    </div>
                                )) : <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No education records.</div>}
                            </div>
                        </div>
                    </div>

                    {/* Referrals (if freelancer) */}
                    {user.role === 'freelancer' && (
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={20} color="var(--primary)" /> Referrals
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {user.referralsList && user.referralsList.length > 0 ? user.referralsList.map(ref => (
                                    <div key={ref._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{ref.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ref.email}</div>
                                        </div>
                                        <button onClick={() => navigate(`/users/${ref._id}`)} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}>View Profile</button>
                                    </div>
                                )) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No referrals associated with this freelancer.</div>}
                            </div>
                        </div>
                    )}
                    
                    {/* Reviews Section */}
                    {user.role === 'freelancer' && (
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={20} color="var(--primary)" /> Client Reviews
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.freelancerReviews && user.freelancerReviews.length > 0 ? user.freelancerReviews.map((rev, idx) => (
                                    <div key={idx} style={{ padding: '1.25rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{rev.clientName}</span>
                                            <div style={{ display: 'flex', color: '#f59e0b' }}>
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} color="currentColor" />)}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>"{rev.comment}"</p>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                                    </div>
                                )) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No reviews received yet.</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal (Generic version for full profile edit) */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit User Profile"
                headerActions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                        <button type="submit" form="edit-user-form" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <form id="edit-user-form" onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={formContent.name || ''} onChange={e => setFormContent({...formContent, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" disabled value={formContent.email || ''} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea className="form-input" style={{ minHeight: '100px' }} value={formContent.bio || ''} onChange={e => setFormContent({...formContent, bio: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-input" value={formContent.location || ''} onChange={e => setFormContent({...formContent, location: e.target.value})} />
                    </div>
                    {user.role === 'freelancer' && (
                        <div className="form-group">
                            <label className="form-label">Hourly Rate (₹)</label>
                            <input type="number" className="form-input" value={formContent.hourlyRate || 0} onChange={e => setFormContent({...formContent, hourlyRate: Number(e.target.value)})} />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Tagline</label>
                        <input className="form-input" value={formContent.tagline || ''} onChange={e => setFormContent({...formContent, tagline: e.target.value})} />
                    </div>
                    {/* Add more fields as needed */}
                </form>
            </Modal>
        </div>
    );
};

export default UserDetails;
