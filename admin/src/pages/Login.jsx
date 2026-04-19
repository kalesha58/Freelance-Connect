import React, { useState } from 'react';
import api from '../utils/api';
import { Lock, Mail, Loader2, ArrowRight, Shield, Eye, EyeOff, Zap } from 'lucide-react';

const Login = ({ setAuth }) => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin1234');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/api/admin/login', { email, password });
            const data = response.data;
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data));
            setAuth(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* ── Animated background ── */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #070b14 0%, #0d1424 40%, #1a1a2e 70%, #16213e 100%)',
            }} />

            {/* Orbs */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-5%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
                borderRadius: '50%',
                animation: 'orb-drift1 14s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-5%',
                width: '450px', height: '450px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)',
                borderRadius: '50%',
                animation: 'orb-drift2 18s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', top: '50%', left: '30%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translateY(-50%)',
                animation: 'orb-drift1 22s ease-in-out infinite reverse',
                pointerEvents: 'none',
            }} />

            {/* Dots grid */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                pointerEvents: 'none',
            }} />

            {/* ── Left panel (branding) ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '4rem',
                position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                    }}>
                        <Zap size={26} color="white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
                            Freelance<span style={{
                                background: 'linear-gradient(90deg, #a78bfa, #06b6d4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Connect</span>
                        </h1>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600' }}>
                            Admin Console
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: '440px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.35rem 0.875rem',
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '99px', marginBottom: '1.5rem',
                        fontSize: '0.72rem', fontWeight: '700', color: '#a78bfa', letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                        <Shield size={11} strokeWidth={3} />
                        Secure Portal
                    </div>
                    <h2 style={{
                        fontSize: '3rem', fontWeight: '800',
                        color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem',
                    }}>
                        Manage your<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>platform</span>
                    </h2>
                    <p style={{
                        fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
                    }}>
                        Full control over users, jobs, posts, and system settings from one powerful dashboard.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                        {[
                            { label: 'Users', value: '10K+' },
                            { label: 'Jobs', value: '2.5K+' },
                            { label: 'Uptime', value: '99.9%' },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: '1.625rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel (form) ── */}
            <div style={{
                width: '460px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '3rem 3rem 3rem 2rem',
                position: 'relative', zIndex: 1,
            }}>
                <div style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}>
                    {/* Card header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
                            border: '1px solid rgba(99,102,241,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1.25rem',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
                        }}>
                            <Lock size={24} color="#a78bfa" strokeWidth={2} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', margin: '0 0 0.35rem' }}>
                            Sign In
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                            Enter your admin credentials to continue
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '0.875rem 1rem',
                            background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)',
                            borderRadius: '10px', marginBottom: '1.5rem',
                            fontSize: '0.825rem', color: '#fca5a5',
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                        }}>
                            <Shield size={14} />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontSize: '0.75rem', fontWeight: '700',
                                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase',
                            }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{
                                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="you@company.com"
                                    style={{
                                        width: '100%', padding: '0.875rem 1rem 0.875rem 2.875rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: 'white',
                                        fontSize: '0.9rem', outline: 'none',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'rgba(99,102,241,0.6)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                                        e.target.style.background = 'rgba(99,102,241,0.08)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontSize: '0.75rem', fontWeight: '700',
                                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase',
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{
                                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                    color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                                }} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '0.875rem 3rem 0.875rem 2.875rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: 'white',
                                        fontSize: '0.9rem', outline: 'none',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = 'rgba(99,102,241,0.6)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                                        e.target.style.background = 'rgba(99,102,241,0.08)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.35)', padding: '0',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.9rem',
                                background: loading
                                    ? 'rgba(99,102,241,0.4)'
                                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontWeight: '700', fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.45)',
                                transition: 'all 0.25s ease',
                                fontFamily: 'inherit',
                                marginTop: '0.25rem',
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.55)';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)';
                            }}
                        >
                            {loading
                                ? <Loader2 size={18} className="animate-spin" />
                                : <><span>Sign In to Admin</span><ArrowRight size={17} strokeWidth={2.5} /></>
                            }
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center', marginTop: '1.75rem',
                        fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    }}>
                        <Shield size={11} />
                        Protected by end-to-end encryption
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
