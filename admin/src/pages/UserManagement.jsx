import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAdminLiveRefresh, formatAdminLastUpdated, ADMIN_LIST_POLL_MS } from '../hooks/useAdminLiveRefresh';
import { 
    Trash2, 
    User, 
    Mail, 
    Shield, 
    Search, 
    Filter,
    MoreVertical,
    Clock,
    X,
    Check,
    AlertCircle,
    Plus,
    Pencil
} from 'lucide-react';
import Modal from '../components/Modal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'freelancer', password: 'Welcome123!' });
    const [submitting, setSubmitting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [editFreelancerOpen, setEditFreelancerOpen] = useState(false);
    const [editFreelancerUser, setEditFreelancerUser] = useState(null);
    const [freelancerProfileForm, setFreelancerProfileForm] = useState({
        tagline: '',
        bio: '',
        hourlyRate: 0,
        isAvailableForHire: true,
        portfolioItems: [{ title: '', imageUrl: '', link: '' }],
        freelancerReviews: [{ clientName: '', rating: 5, comment: '' }]
    });
    const [savingFreelancer, setSavingFreelancer] = useState(false);

    const openFreelancerEditor = (user) => {
        setEditFreelancerUser(user);
        const portfolio = (user.portfolioItems && user.portfolioItems.length > 0)
            ? user.portfolioItems.map((p) => ({ title: p.title || '', imageUrl: p.imageUrl || '', link: p.link || '' }))
            : [{ title: '', imageUrl: '', link: '' }];
        const reviews = (user.freelancerReviews && user.freelancerReviews.length > 0)
            ? user.freelancerReviews.map((r) => ({
                clientName: r.clientName || '',
                rating: r.rating ?? 5,
                comment: r.comment || ''
            }))
            : [{ clientName: '', rating: 5, comment: '' }];
        setFreelancerProfileForm({
            tagline: user.tagline || '',
            bio: user.bio || '',
            hourlyRate: user.hourlyRate ?? 0,
            isAvailableForHire: user.isAvailableForHire !== false,
            portfolioItems: portfolio,
            freelancerReviews: reviews
        });
        setEditFreelancerOpen(true);
    };

    const handleSaveFreelancerProfile = async (e) => {
        e.preventDefault();
        if (!editFreelancerUser) return;
        setSavingFreelancer(true);
        try {
            const portfolioItems = freelancerProfileForm.portfolioItems.filter(
                (p) => (p.title && p.title.trim()) || (p.imageUrl && p.imageUrl.trim())
            );
            const freelancerReviews = freelancerProfileForm.freelancerReviews
                .filter((r) => r.clientName && r.clientName.trim() && r.comment && r.comment.trim())
                .map((r) => ({
                    clientName: r.clientName.trim(),
                    rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
                    comment: r.comment.trim()
                }));
            await api.put(`/api/admin/users/${editFreelancerUser._id}`, {
                tagline: freelancerProfileForm.tagline.trim(),
                bio: freelancerProfileForm.bio.trim(),
                hourlyRate: Number(freelancerProfileForm.hourlyRate) || 0,
                isAvailableForHire: freelancerProfileForm.isAvailableForHire,
                portfolioItems,
                freelancerReviews
            });
            setEditFreelancerOpen(false);
            setEditFreelancerUser(null);
            await fetchUsers(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save profile.');
        } finally {
            setSavingFreelancer(false);
        }
    };

    const fetchUsers = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
            setLastUpdated(new Date());
            setError('');
        } catch (loadErr) {
            setError(loadErr.response?.data?.message || 'Failed to load user data.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(false);
    }, [fetchUsers]);

    useAdminLiveRefresh(() => {
        fetchUsers(true);
    }, ADMIN_LIST_POLL_MS);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/admin/users', formData);
            await fetchUsers(true);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'freelancer', password: 'Welcome123!' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (deleteErr) {
            alert(deleteErr.response?.data?.message || 'Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'complete' ? user.isProfileComplete : !user.isProfileComplete);
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text" style={{ width: '200px' }}></div>
                </div>
            </header>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ padding: '1.5rem' }}>
                     {[1, 2, 3, 4, 5].map(i => (
                         <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                             <div className="skeleton skeleton-avatar"></div>
                             <div style={{ flex: 1 }}>
                                 <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
                                 <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );

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
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: '800' }}>User Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage platform participants and permissions</p>
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
                        style={{ transition: 'var(--transition)' }}
                    >
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Add New User
                    </button>
                </div>
            </header>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    backgroundColor: '#fafafa'
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
                            placeholder="Search by name or email..."
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', backgroundColor: 'white', height: '48px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <select 
                                className="form-input" 
                                style={{ backgroundColor: 'white', paddingLeft: '1rem', height: '48px', appearance: 'none', cursor: 'pointer' }}
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="freelancer">Freelancer</option>
                                <option value="hiring">Hiring Partner</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <select 
                                className="form-input" 
                                style={{ backgroundColor: 'white', paddingLeft: '1rem', height: '48px', appearance: 'none', cursor: 'pointer' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="complete">Complete</option>
                                <option value="incomplete">Incomplete</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Profile</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Freelancer</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined Date</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--primary)',
                                                border: '2px solid white',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}>
                                                {user.profilePic ? (
                                                    <img src={user.profilePic} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                                ) : <User size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Mail size={12} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
                                            <Shield size={14} color={user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)'} />
                                            <span style={{ fontSize: '0.875rem' }}>{user.role}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {user.role === 'freelancer' ? (
                                            <span>${user.hourlyRate ?? 0}/hr · {Array.isArray(user.freelancerReviews) ? user.freelancerReviews.length : 0} reviews</span>
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: user.isProfileComplete ? '#dcfce7' : '#fee2e2',
                                            color: user.isProfileComplete ? '#166534' : '#991b1b'
                                        }}>
                                            {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {user.role === 'freelancer' && (
                                                <button
                                                    type="button"
                                                    onClick={() => openFreelancerEditor(user)}
                                                    className="btn"
                                                    style={{ padding: '0.4rem', color: 'var(--primary)', backgroundColor: 'transparent' }}
                                                    title="Edit freelancer profile (portfolio & reviews)"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(user._id)}
                                                className="btn" 
                                                style={{ padding: '0.4rem', color: '#ef4444', backgroundColor: 'transparent' }}
                                                disabled={user.role === 'admin'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="btn" style={{ padding: '0.4rem', backgroundColor: 'transparent', color: 'var(--text-light)' }}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <User size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No users found matching your filters.</p>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Create New User Account"
            >
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Full Name</label>
                        <input 
                            required
                            type="text" 
                            className="form-input" 
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Email Address</label>
                        <input 
                            required
                            type="email" 
                            className="form-input" 
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Account Role</label>
                        <select 
                            className="form-input"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="freelancer">Freelancer</option>
                            <option value="hiring">Hiring Partner</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Initial Password</label>
                        <input 
                            required
                            type="text" 
                            className="form-input" 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            <AlertCircle size={12} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: '0.25rem' }} />
                            The user will be required to update this password after their first login.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="btn" 
                            style={{ flex: 1, backgroundColor: '#f1f5f9', border: 'none' }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ flex: 2 }}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating User...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={editFreelancerOpen}
                onClose={() => { setEditFreelancerOpen(false); setEditFreelancerUser(null); }}
                title={editFreelancerUser ? `Freelancer profile — ${editFreelancerUser.name}` : 'Freelancer profile'}
            >
                <form id="admin-freelancer-profile-form" onSubmit={handleSaveFreelancerProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Headline (tagline)</label>
                        <input
                            className="form-input"
                            value={freelancerProfileForm.tagline}
                            onChange={(e) => setFreelancerProfileForm({ ...freelancerProfileForm, tagline: e.target.value })}
                            placeholder="e.g. Senior React Native Developer"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Bio</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '80px', paddingTop: '0.75rem' }}
                            value={freelancerProfileForm.bio}
                            onChange={(e) => setFreelancerProfileForm({ ...freelancerProfileForm, bio: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Hourly rate (USD)</label>
                            <input
                                type="number"
                                min="0"
                                className="form-input"
                                value={freelancerProfileForm.hourlyRate === 0 ? '' : freelancerProfileForm.hourlyRate}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFreelancerProfileForm({
                                        ...freelancerProfileForm,
                                        hourlyRate: v === '' ? 0 : Number(v)
                                    });
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                    type="checkbox"
                                    checked={freelancerProfileForm.isAvailableForHire}
                                    onChange={(e) => setFreelancerProfileForm({ ...freelancerProfileForm, isAvailableForHire: e.target.checked })}
                                />
                                Available for hire
                            </label>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Portfolio items</label>
                            <button
                                type="button"
                                className="btn"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => setFreelancerProfileForm({
                                    ...freelancerProfileForm,
                                    portfolioItems: [...freelancerProfileForm.portfolioItems, { title: '', imageUrl: '', link: '' }]
                                })}
                            >
                                + Add item
                            </button>
                        </div>
                        {freelancerProfileForm.portfolioItems.map((p, idx) => (
                            <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                                <input
                                    className="form-input"
                                    style={{ marginBottom: '0.5rem' }}
                                    placeholder="Title"
                                    value={p.title}
                                    onChange={(e) => {
                                        const next = [...freelancerProfileForm.portfolioItems];
                                        next[idx] = { ...next[idx], title: e.target.value };
                                        setFreelancerProfileForm({ ...freelancerProfileForm, portfolioItems: next });
                                    }}
                                />
                                <input
                                    className="form-input"
                                    style={{ marginBottom: '0.5rem' }}
                                    placeholder="Image URL"
                                    value={p.imageUrl}
                                    onChange={(e) => {
                                        const next = [...freelancerProfileForm.portfolioItems];
                                        next[idx] = { ...next[idx], imageUrl: e.target.value };
                                        setFreelancerProfileForm({ ...freelancerProfileForm, portfolioItems: next });
                                    }}
                                />
                                <input
                                    className="form-input"
                                    placeholder="Link (optional)"
                                    value={p.link}
                                    onChange={(e) => {
                                        const next = [...freelancerProfileForm.portfolioItems];
                                        next[idx] = { ...next[idx], link: e.target.value };
                                        setFreelancerProfileForm({ ...freelancerProfileForm, portfolioItems: next });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Client reviews</label>
                            <button
                                type="button"
                                className="btn"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => setFreelancerProfileForm({
                                    ...freelancerProfileForm,
                                    freelancerReviews: [...freelancerProfileForm.freelancerReviews, { clientName: '', rating: 5, comment: '' }]
                                })}
                            >
                                + Add review
                            </button>
                        </div>
                        {freelancerProfileForm.freelancerReviews.map((r, idx) => (
                            <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                                <input
                                    className="form-input"
                                    style={{ marginBottom: '0.5rem' }}
                                    placeholder="Client / company name"
                                    value={r.clientName}
                                    onChange={(e) => {
                                        const next = [...freelancerProfileForm.freelancerReviews];
                                        next[idx] = { ...next[idx], clientName: e.target.value };
                                        setFreelancerProfileForm({ ...freelancerProfileForm, freelancerReviews: next });
                                    }}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    className="form-input"
                                    style={{ marginBottom: '0.5rem' }}
                                    placeholder="Rating 1–5"
                                    value={r.rating}
                                    onChange={(e) => {
                                        const next = [...freelancerProfileForm.freelancerReviews];
                                        next[idx] = { ...next[idx], rating: Number(e.target.value) };
                                        setFreelancerProfileForm({ ...freelancerProfileForm, freelancerReviews: next });
                                    }}
                                />
                                <textarea
                                    className="form-input"
                                    style={{ minHeight: '60px' }}
                                    placeholder="Comment"
                                    value={r.comment}
                                    onChange={(e) => {
                                        const next = [...freelancerProfileForm.freelancerReviews];
                                        next[idx] = { ...next[idx], comment: e.target.value };
                                        setFreelancerProfileForm({ ...freelancerProfileForm, freelancerReviews: next });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => { setEditFreelancerOpen(false); setEditFreelancerUser(null); }} className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9', border: 'none' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={savingFreelancer}>
                            {savingFreelancer ? 'Saving…' : 'Save profile'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
