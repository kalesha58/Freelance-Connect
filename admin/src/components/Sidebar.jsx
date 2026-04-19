import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MessageSquare,
    Settings,
    LogOut,
    ExternalLink,
    Moon,
    Sun,
    ChevronRight,
    Zap,
    PanelLeftClose,
    PanelLeft,
    Flag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
    { name: 'Dashboard',       icon: LayoutDashboard, path: '/',         color: '#6366f1', description: 'Overview & analytics' },
    { name: 'User Management', icon: Users,            path: '/users',    color: '#06b6d4', description: 'Members & accounts' },
    { name: 'Job Management',  icon: Briefcase,        path: '/jobs',     color: '#10b981', description: 'Postings & listings' },
    { name: 'Community Posts', icon: MessageSquare,    path: '/posts',    color: '#f59e0b', description: 'Feed & moderation' },
    { name: 'Moderation',      icon: Flag,             path: '/moderation', color: '#ef4444', description: 'Content review' },
    { name: 'System Settings', icon: Settings,         path: '/settings', color: '#a78bfa', description: 'Config & preferences' },
];

const Sidebar = ({ handleLogout, collapsed, onToggle }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [hoveredItem, setHoveredItem] = useState(null);

    const w = collapsed ? '68px' : '260px';

    return (
        <aside style={{
            width: w,
            minWidth: w,
            height: '100vh',
            position: 'fixed',
            left: 0, top: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            background: isDarkMode
                ? 'linear-gradient(180deg, #080c18 0%, #0d1224 50%, #080c18 100%)'
                : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isDarkMode 
                ? '4px 0 24px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.04)'
                : '4px 0 24px rgba(0,0,0,0.02), inset -1px 0 0 rgba(0,0,0,0.02)',
            overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: '-60px', left: '-60px',
                width: '180px', height: '180px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* ── Brand + collapse toggle ── */}
            <div style={{
                padding: collapsed ? '1.25rem 0' : '1.5rem 1.5rem 1.25rem',
                borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: '0.75rem',
                flexShrink: 0,
            }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                            width: '38px', height: '38px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '11px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
                        }}>
                            <Zap size={20} color="white" strokeWidth={2.5} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{
                                fontSize: '1rem', fontWeight: '800', 
                                color: isDarkMode ? 'white' : 'var(--text-main)',
                                letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                Skil<span style={{
                                    background: 'linear-gradient(90deg, #a78bfa, #06b6d4)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                }}>Lynk</span>
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.7)' }} />
                                <span style={{ 
                                    fontSize: '0.62rem', 
                                    color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)', 
                                    fontWeight:'600', letterSpacing:'0.07em', textTransform:'uppercase' 
                                }}>Admin Console</span>
                            </div>
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div style={{
                        width: '38px', height: '38px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '11px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
                        flexShrink: 0,
                    }}>
                        <Zap size={20} color="white" strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* ── Toggle button (fixed to right edge when expanded) ── */}
            <button
                onClick={onToggle}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                    position: 'absolute',
                    top: '22px',
                    right: collapsed ? '50%' : '12px',
                    transform: collapsed ? 'translateX(50%)' : 'none',
                    width: '26px', height: '26px',
                    borderRadius: '7px',
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: 'rgba(255,255,255,0.6)',
                    display: collapsed ? 'none' : 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    zIndex: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.3)'; e.currentTarget.style.color='white'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}
            >
                <PanelLeftClose size={14} strokeWidth={2.5} />
            </button>

            {/* ── Nav section label ── */}
            {!collapsed && (
                <div style={{ padding: '1.25rem 1.5rem 0.5rem', flexShrink: 0 }}>
                    <span style={{ 
                        fontSize: '0.62rem', fontWeight: '700', 
                        color: isDarkMode ? 'rgba(255,255,255,0.22)' : 'var(--text-light)', 
                        letterSpacing: '0.1em', textTransform: 'uppercase' 
                    }}>
                        Navigation
                    </span>
                </div>
            )}

            {/* ── Nav items ── */}
            <nav style={{ flex: 1, padding: `0.25rem ${collapsed ? '0.5rem' : '0.875rem'}`, overflowY: 'auto', overflowX: 'hidden' }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/'}
                            title={collapsed ? item.name : undefined}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: collapsed ? 0 : '0.875rem',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: collapsed ? '0.75rem' : '0.7rem 1rem',
                                borderRadius: '10px',
                                marginBottom: '0.2rem',
                                position: 'relative', overflow: 'hidden',
                                textDecoration: 'none',
                                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                background: isActive
                                    ? `linear-gradient(135deg, ${item.color}22, ${item.color}10)`
                                    : hoveredItem === item.name 
                                        ? isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' 
                                        : 'transparent',
                                borderLeft: collapsed
                                    ? 'none'
                                    : isActive ? `3px solid ${item.color}` : '3px solid transparent',
                                boxShadow: isActive ? `0 0 20px ${item.color}18, inset 0 0 20px ${item.color}08` : 'none',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isActive 
                                            ? `${item.color}25` 
                                            : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                        color: isActive ? item.color : isDarkMode ? 'rgba(255,255,255,0.45)' : 'var(--text-light)',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        <Icon size={16} strokeWidth={2.2} />
                                    </div>

                                    {!collapsed && (
                                        <>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.85rem', fontWeight: isActive ? '700' : '500',
                                                    color: isActive 
                                                        ? isDarkMode ? 'white' : 'var(--primary)' 
                                                        : isDarkMode ? 'rgba(255,255,255,0.6)' : 'var(--text-main)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {item.name}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.68rem', 
                                                    color: isDarkMode ? 'rgba(255,255,255,0.25)' : 'var(--text-muted)', 
                                                    marginTop: '0.05rem', whiteSpace: 'nowrap' 
                                                }}>
                                                    {item.description}
                                                </div>
                                            </div>
                                            {isActive && (
                                                <ChevronRight size={13} color={item.color} strokeWidth={2.5} style={{ flexShrink: 0, opacity: 0.8 }} />
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* ── Footer ── */}
            <div style={{
                padding: collapsed ? '0.875rem 0.5rem' : '0.875rem',
                borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: '0.3rem',
                flexShrink: 0,
            }}>
                {/* Expand button (shown only when collapsed) */}
                {collapsed && (
                    <button
                        onClick={onToggle}
                        title="Expand sidebar"
                        style={{
                            width: '100%', padding: '0.65rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '10px',
                            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                            color: '#a78bfa', cursor: 'pointer', transition: 'all 0.2s ease',
                            marginBottom: '0.25rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.22)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; }}
                    >
                        <PanelLeft size={16} strokeWidth={2.5} />
                    </button>
                )}

                {/* Dark mode */}
                <button
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: collapsed ? 0 : '0.875rem',
                        padding: collapsed ? '0.65rem' : '0.65rem 1rem',
                        borderRadius: '10px',
                        background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', 
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', 
                        fontSize: '0.82rem', fontWeight: '500',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.color='#a78bfa'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}
                >
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isDarkMode ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#a78bfa" />}
                    </div>
                    {!collapsed && (isDarkMode ? 'Light Mode' : 'Dark Mode')}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: collapsed ? 0 : '0.875rem',
                        padding: collapsed ? '0.65rem' : '0.65rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)',
                        color: 'rgba(244,63,94,0.7)', fontSize: '0.82rem', fontWeight: '500',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(244,63,94,0.14)'; e.currentTarget.style.color='#f43f5e'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(244,63,94,0.06)'; e.currentTarget.style.color='rgba(244,63,94,0.7)'; }}
                >
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LogOut size={13} color="#f43f5e" />
                    </div>
                    {!collapsed && 'Logout'}
                </button>

                {/* View site link — only when expanded */}
                {!collapsed && (
                    <a
                        href="http://localhost:5173" target="_blank" rel="noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.4rem 1rem', fontSize: '0.68rem',
                            color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'var(--text-light)', 
                            borderRadius: '8px',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = isDarkMode ? 'rgba(255,255,255,0.2)' : 'var(--text-light)'; }}
                    >
                        <ExternalLink size={10} /> View Public Site
                    </a>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
