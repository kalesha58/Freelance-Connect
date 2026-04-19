import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, User, Moon, Sun } from 'lucide-react';

// sidebarWidth prop is forwarded from Layout
import { useTheme } from '../context/ThemeContext';

const pageMeta = {
    '/':        { title: 'Dashboard',        subtitle: 'Platform overview & live analytics' },
    '/users':   { title: 'User Management',  subtitle: 'Manage members, roles & accounts' },
    '/jobs':    { title: 'Job Management',   subtitle: 'Monitor job postings & applications' },
    '/posts':   { title: 'Community Posts',  subtitle: 'Content moderation & feed control' },
    '/settings':{ title: 'System Settings',  subtitle: 'Configure platform preferences' },
};

const TopBar = ({ sidebarWidth = '260px' }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const meta = pageMeta[location.pathname] || { title: 'Admin', subtitle: '' };
    const [searching, setSearching] = useState(false);
    const [searchVal, setSearchVal] = useState('');

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: sidebarWidth,
            transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
            right: 0,
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            background: isDarkMode
                ? 'rgba(7,11,20,0.92)'
                : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: isDarkMode
                ? '1px solid rgba(255,255,255,0.05)'
                : '1px solid rgba(99,102,241,0.1)',
            boxShadow: isDarkMode
                ? '0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.4)'
                : '0 1px 0 rgba(99,102,241,0.08), 0 4px 24px rgba(99,102,241,0.06)',
            zIndex: 900,
        }}>
            {/* Left — Page title */}
            <div>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                }}>
                    {meta.title}
                </h2>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.1rem',
                }}>
                    {meta.subtitle}
                </p>
            </div>

            {/* Right — Controls */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem'
            }}>
                {/* Search */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                    border: searching
                        ? '1px solid var(--primary)'
                        : isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.15)',
                    borderRadius: '10px',
                    padding: '0.5rem 0.875rem',
                    transition: 'all 0.25s ease',
                    boxShadow: searching ? '0 0 0 3px var(--primary-light)' : 'none',
                    width: searching ? '220px' : '150px',
                }}>
                    <Search size={14} color="var(--text-muted)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        onFocus={() => setSearching(true)}
                        onBlur={() => setSearching(false)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: 'var(--text-main)',
                            fontSize: '0.825rem',
                            width: '100%',
                        }}
                    />
                    {searchVal && (
                        <span style={{
                            fontSize: '0.65rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '0.1rem 0.35rem',
                            fontWeight: '700',
                            flexShrink: 0,
                        }}>⏎</span>
                    )}
                </div>

                {/* Dark mode toggle pill */}
                <button
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 0.875rem',
                        borderRadius: '10px',
                        background: isDarkMode ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.08)',
                        border: isDarkMode ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(99,102,241,0.15)',
                        color: isDarkMode ? '#f59e0b' : 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    {isDarkMode ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
                    <span style={{ fontFamily: 'inherit' }}>
                        {isDarkMode ? 'Light' : 'Dark'}
                    </span>
                </button>

                {/* Notification bell */}
                <button style={{
                    width: '38px', height: '38px',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.15)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--primary-light)';
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.15)';
                    }}
                >
                    <Bell size={16} strokeWidth={2} />
                    <span style={{
                        position: 'absolute',
                        top: '7px', right: '7px',
                        width: '7px', height: '7px',
                        background: '#f43f5e',
                        borderRadius: '50%',
                        border: '1.5px solid var(--bg-topbar)',
                        boxShadow: '0 0 6px rgba(244,63,94,0.6)',
                    }} />
                </button>

                {/* Admin avatar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.35rem 0.75rem 0.35rem 0.35rem',
                    borderRadius: '10px',
                    background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.05)',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(99,102,241,0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--primary-light)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.05)';
                        e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)';
                    }}
                >
                    <div style={{
                        width: '30px', height: '30px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                    }}>
                        <User size={15} color="white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.8rem', fontWeight: '700',
                            color: 'var(--text-main)', lineHeight: 1.2,
                        }}>Admin</div>
                        <div style={{
                            fontSize: '0.65rem', color: 'var(--text-muted)',
                        }}>Super Admin</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
