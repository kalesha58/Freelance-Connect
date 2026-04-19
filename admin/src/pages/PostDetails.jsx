import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    ArrowLeft,
    User,
    MessageSquare,
    Heart,
    MessageCircle,
    Calendar,
    Clock,
    Trash2,
    XCircle,
    Loader2,
    ExternalLink,
    Tag,
    Share2,
    Image as ImageIcon
} from 'lucide-react';

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPost = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/admin/posts/${id}`);
            setPost(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load post details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this community post?')) return;
        try {
            await api.delete(`/api/admin/posts/${id}`);
            navigate('/posts');
        } catch (err) {
            alert('Failed to delete post.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    if (error || !post) return (
        <div className="card text-center" style={{ padding: '4rem' }}>
            <XCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Error Loading Post</h3>
            <p style={{ color: 'var(--text-muted)' }}>{error || 'Post not found.'}</p>
            <button onClick={() => navigate('/posts')} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                Back to Post Management
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/posts')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Posts
                </button>
                <button onClick={handleDelete} className="btn" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trash2 size={16} /> Delete Post
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
                {/* Main Content: Post Content & Media */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Author Header */}
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {post.userAvatar ? (
                                        <img src={post.userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    ) : <User size={22} color="var(--primary)" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{post.userName || 'Anonymous'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{post.userRole}</div>
                                </div>
                            </div>
                            <button onClick={() => post.userId && navigate(`/users/${post.userId._id || post.userId}`)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                View Profile <ExternalLink size={12} />
                            </button>
                        </div>

                        {/* Media Preview */}
                        {post.imageUrl ? (
                            <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', maxHeight: '600px', overflow: 'hidden' }}>
                                <img src={post.imageUrl} style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} alt="Post Media" />
                            </div>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-main)', color: 'var(--text-light)', borderBottom: '1px solid var(--border)' }}>
                                <ImageIcon size={48} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.875rem' }}>No media attached to this post</div>
                            </div>
                        )}

                        {/* Caption */}
                        <div style={{ padding: '2rem 1.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span className={`badge ${post.type === 'portfolio' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
                                    {post.type || 'social'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <Clock size={14} /> {new Date(post.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ fontSize: '1.125rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {post.caption}
                            </div>
                            
                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    {post.tags.map(tag => (
                                        <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', padding: '0.25rem 0.65rem', background: 'var(--primary-light)', borderRadius: '4px' }}>
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Engagement & Moderation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Engagement Stats */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Share2 size={18} color="var(--primary)" /> Engagement Overview
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.1)', textAlign: 'center' }}>
                                <Heart size={20} color="var(--danger)" fill="rgba(244, 63, 94, 0.2)" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: '800', fontSize: '1.5rem' }}>{post.likes?.length || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Likes</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)', textAlign: 'center' }}>
                                <MessageCircle size={20} color="var(--info)" fill="rgba(59, 130, 246, 0.2)" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: '800', fontSize: '1.5rem' }}>{post.comments?.length || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Comments</div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Post Metadata
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> Created</span>
                                <span style={{ fontWeight: '600' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> User ID</span>
                                <span style={{ fontWeight: '600', fontSize: '0.7rem' }}>{post.userId._id || post.userId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions Note */}
                    <div style={{ padding: '1.5rem', background: 'var(--warning-light)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <MessageSquare size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.8rem', color: 'var(--warning)', lineHeight: '1.5' }}>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Moderation Note</strong>
                            As an admin, you can remove content that violates community standards. Deleted posts cannot be recovered.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetails;
