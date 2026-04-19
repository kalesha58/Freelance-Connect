import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAdminLiveRefresh, formatAdminLastUpdated, ADMIN_LIST_POLL_MS } from '../hooks/useAdminLiveRefresh';
import { formatDisplayDate } from '../utils/formatDisplayDate';
import { 
    Trash2, 
    MessageSquare, 
    User, 
    Heart, 
    MessageCircle, 
    Search, 
    MoreVertical,
    Clock,
    Share2,
    Plus,
    Filter,
    Image as ImageIcon,
    Upload,
    Loader2,
    ExternalLink
} from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const PostManagement = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        caption: '',
        imageUrl: '',
        type: 'social',
        tags: ''
    });
    const [lastUpdated, setLastUpdated] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [postsRes, usersRes] = await Promise.all([
                api.get('/api/admin/posts'),
                api.get('/api/admin/users')
            ]);
            setPosts(postsRes.data);
            setUsers(usersRes.data);
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual preview
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);

        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const response = await api.post('/api/upload', uploadData);
            setFormData({ ...formData, imageUrl: response.data.url });
        } catch (err) {
            console.error('Upload Error Details:', err.response?.data || err.message);
            alert(`Upload failed: ${err.response?.data?.message || err.message}`);
            setImagePreview(null);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!formData.userId) return alert('Please select a User');
        if (uploadingImage) return alert('Please wait for image to finish uploading');
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };
            await api.post('/api/admin/posts', payload);
            await fetchData(true);
            setIsModalOpen(false);
            setFormData({ userId: '', caption: '', imageUrl: '', type: 'social', tags: '' });
            setImagePreview(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this community post?')) return;
        try {
            await api.delete(`/api/admin/posts/${id}`);
            setPosts(posts.filter(p => p._id !== id));
        } catch (deleteErr) {
            alert(deleteErr.response?.data?.message || 'Error deleting post.');
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || post.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter]);

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = filteredPosts.slice(
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="card skeleton skeleton-card" style={{ height: '250px' }}></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: '800' }}>Community Posts</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Moderate community discussions and content</p>
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
                        Create New Post
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
                            placeholder="Search content or user..."
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
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="social">Social Interaction</option>
                            <option value="portfolio">Portfolio/Showcase</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-main)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Author</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Post Content</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Media</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Engagement</th>
                                <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</th>
                                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                             {paginatedPosts.map((post) => (
                                <tr key={post._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/posts/${post._id}`)}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary-light), rgba(139,92,246,0.12))',
                                                border: '2px solid var(--border)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--primary)', overflow: 'hidden', flexShrink: 0,
                                            }}>
                                                {post.userAvatar ? (
                                                    <img src={post.userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                ) : <User size={14} />}
                                            </div>
                                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{post.userName || 'Anonymous'}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ 
                                            maxWidth: '280px', 
                                            fontSize: '0.875rem', 
                                            color: 'var(--text-main)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.5
                                        }}>
                                            {post.caption}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {post.imageUrl ? (
                                            <div style={{ 
                                                width: '60px', height: '40px', borderRadius: '6px', 
                                                overflow: 'hidden', border: '1px solid var(--border)',
                                                background: 'var(--bg-main)'
                                            }}>
                                                <img src={post.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No media</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span className={`badge ${post.type === 'portfolio' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
                                            {post.type || 'social'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Heart size={12} color="#f43f5e" fill="#f43f5e20" /> {post.likes?.length || 0}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MessageCircle size={12} color="#3b82f6" fill="#3b82f620" /> {post.comments?.length || 0}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={13} />
                                            {formatDisplayDate(post.createdAt)}
                                        </div>
                                    </td>                                     <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/posts/${post._id}`); }}
                                                className="btn" 
                                                style={{ padding: '0.4rem', color: 'var(--info)', backgroundColor: 'transparent' }}
                                                title="View/Moderate full post"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
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

                {filteredPosts.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No community posts found matching filters.</p>
                    </div>
                )}

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredPosts.length}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Create Community Post"
                headerActions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn"
                            style={{ backgroundColor: '#f1f5f9', border: 'none' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="admin-create-post-form"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                }
            >
                <form id="admin-create-post-form" onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Post Author</label>
                            <select 
                                required
                                className="form-input"
                                value={formData.userId}
                                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                            >
                                <option value="">Select User...</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Post Type</label>
                            <select 
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="social">Social</option>
                                <option value="portfolio">Portfolio</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Caption / Content</label>
                        <textarea 
                            required
                            className="form-input" 
                            style={{ minHeight: '100px', paddingTop: '0.75rem' }}
                            placeholder="What's on your mind?"
                            value={formData.caption}
                            onChange={(e) => setFormData({...formData, caption: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Post Media</label>
                        <div style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '12px',
                            padding: '1rem',
                            textAlign: 'center',
                            backgroundColor: '#f8fafc',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }} onClick={() => document.getElementById('post-image-upload').click()}>
                            {imagePreview ? (
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <img src={imagePreview} style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} alt="Preview" />
                                    {uploadingImage && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '8px'
                                        }}>
                                            <Loader2 size={32} className="animate-spin" color="var(--primary)" />
                                        </div>
                                    )}
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--primary)',
                                        fontWeight: '600'
                                    }}>
                                        Click to change image
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', color: 'var(--text-light)' }}>
                                        <ImageIcon size={20} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.85rem' }}>Upload some media</p>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>JPG, PNG or WEBP (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                            <input 
                                id="post-image-upload"
                                type="file" 
                                hidden 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Tags (Comma separated)</label>
                        <input 
                            className="form-input" 
                            placeholder="design, web, react"
                            value={formData.tags}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
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

export default PostManagement;
