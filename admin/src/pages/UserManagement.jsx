import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Trash2, 
    User, 
    Mail, 
    Shield, 
    Search, 
    Filter,
    MoreVertical,
    Clock
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load user data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>User Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage platform participants and permissions</p>
                </div>
                <button className="btn btn-primary">
                    Invite New User
                </button>
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
                    <div style={{ position: 'relative', flex: 1 }}>
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
                            style={{ paddingLeft: '2.75rem', backgroundColor: 'white' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                            <Filter size={18} />
                            Filter
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Profile</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
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
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
