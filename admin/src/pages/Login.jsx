import React, { useState } from 'react';
import api from '../utils/api';
import { Lock, Mail, Loader2, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import FadeIn from '../components/animations/FadeIn';
import AnimatedHeading from '../components/animations/AnimatedHeading';

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
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* ── Background Video ── */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0
                }}
            >
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
            </video>

            {/* ── Content Wrapper ── */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '0 24px', // mobile padding
            }} className="md:px-12 lg:px-16">
                
                {/* ── Navbar ── */}
                <header style={{ paddingTop: '24px' }}>
                    <div className="liquid-glass" style={{
                        borderRadius: '12px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '600', trackingTight: '-0.025em' }}>
                            SkilLynk
                        </div>
                        
                        <nav className="hidden md:flex" style={{ gap: '32px', fontSize: '14px' }}>
                            {['Talent', 'Work', 'Community', 'Solutions'].map(item => (
                                <span key={item} style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                                      className="hover:text-gray-300">
                                    {item}
                                </span>
                            ))}
                        </nav>

                        <div style={{ width: '120px' }}></div> {/* Spacer to balance logo */}
                    </div>
                </header>

                {/* ── Main Hero Section ── */}
                <main style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    paddingBottom: '40px',
                    width: '100%'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        gap: '48px'
                    }}>
                        {/* Left Col: Hero Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <AnimatedHeading 
                                text={"Connecting vision\nwith global talent."} 
                                className="text-4xl md:text-5xl lg:text-7xl font-normal mb-6"
                                style={{ letterSpacing: '-0.04em' }}
                            />
                            
                            <FadeIn delay={800} duration={1000}>
                                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                                    The smarter way to find, manage, and scale your global freelance workforce from one powerful dashboard.
                                </p>
                            </FadeIn>

                            <FadeIn delay={1200} duration={1000}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                    <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                                        Get Started
                                    </button>
                                    <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-all">
                                        Explore Platform
                                    </button>
                                </div>
                            </FadeIn>
                        </div>

                        {/* Right Col: Login Card */}
                        <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-end',
                            minWidth: 0 
                        }}>
                            <FadeIn delay={1500} duration={1000} className="w-full max-w-[420px]">
                                <div className="liquid-glass border border-white/20 p-10 rounded-3xl shadow-2xl backdrop-blur-md">
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <Shield size={20} color="#fff" />
                                            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Secure Admin Console</span>
                                        </div>
                                        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Admin Sign In</h3>
                                        <p style={{ fontSize: '14px', opacity: 0.5 }}>Enter credentials to access the command center.</p>
                                    </div>

                                    {error && (
                                        <div style={{ padding: '12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Lock size={14} /> {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Email</label>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                                <input 
                                                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                                    style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Password</label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                                <input 
                                                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                                                    style={{ width: '100%', padding: '14px 48px 14px 44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', opacity: 0.4 }}>
                                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" disabled={loading}
                                            style={{ width: '100%', padding: '16px', background: '#fff', color: '#000', borderRadius: '12px', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'transform 0.2s', marginTop: '8px' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : <><span>Sign In to SkilLynk</span> <ArrowRight size={20} /></>}
                                        </button>
                                    </form>
                                </div>
                            </FadeIn>

                            <FadeIn delay={1400} duration={1000}>
                                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl hidden lg:block">
                                    <span className="text-xl lg:text-2xl font-light tracking-tight">Talent. Innovation. Growth.</span>
                                </div>
                            </FadeIn>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Login;
