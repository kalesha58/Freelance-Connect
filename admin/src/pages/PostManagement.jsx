import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Trash2, 
    MessageSquare, 
    User, 
    Heart, 
    MessageCircle, 
    Search, 
    MoreVertical,
    Clock,
    Share2
} from 'lucide-react';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        try {
            const response = await api.get('/api/admin/posts');
            setPosts(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this community post?')) return;
        try {
            await api.delete(`/api/admin/posts/${id}`);
            setPosts(posts.filter(p => p._id !== id));
        } catch (err) {
            alert('Error deleting post.');
        }
    };

    const filteredPosts = posts.filter(post => 
        post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.userName?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Community Posts</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Moderate community discussions and content</p>
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
                            placeholder="Search content or user..."
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', backgroundColor: 'white' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                        {filteredPosts.map(post => (
                            <div key={post._id} className="card" style={{ 
                                padding: '1.25rem', 
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            border: '2px solid white'
                                        }}>
                                            {post.userAvatar ? (
                                                <img src={post.userAvatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                            ) : <User size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{post.userName || 'Anonymous'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(post._id)}
                                        style={{ background: 'none', color: '#ef4444', padding: '0.4rem', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                    {post.caption}
                                    {post.imageUrl && (
                                        <div style={{ marginTop: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <img src={post.imageUrl} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Post content" />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Heart size={16} /> {post.likes?.length || 0}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <MessageCircle size={16} /> {post.comments?.length || 0}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Share2 size={16} /> {post.shares || 0}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {filteredPosts.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No community posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostManagement;
