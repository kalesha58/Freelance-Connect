import React from 'react';
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
    Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ handleLogout }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'User Management', icon: <Users size={20} />, path: '/users' },
        { name: 'Job Management', icon: <Briefcase size={20} />, path: '/jobs' },
        { name: 'Community Posts', icon: <MessageSquare size={20} />, path: '/posts' },
        { name: 'System Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <aside style={{
            width: '260px',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'var(--text-on-dark)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: 'var(--shadow-xl)'
        }}>
            <div style={{
                padding: '2rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1rem'
            }}>
                <h1 style={{ 
                    fontSize: '1.5rem', 
                    color: 'white', 
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <span style={{
                        backgroundColor: 'var(--primary)',
                        padding: '0.5rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>FC</span>
                    Admin Panel
                </h1>
            </div>

            <nav style={{ flex: 1, padding: '0 1rem' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-light)',
                            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            transition: 'var(--transition)',
                            borderLeft: isActive ? '4px solid var(--primary)' : '0px solid transparent'
                        })}
                    >
                        {item.icon}
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{
                padding: '1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-light)',
                        backgroundColor: 'transparent',
                        transition: 'var(--transition)',
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem'
                    }}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span style={{ fontWeight: '500' }}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        color: '#fca5a5',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        transition: 'var(--transition)',
                        fontSize: '0.95rem'
                    }}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: '500' }}>Logout Account</span>
                </button>
                <div style={{ marginTop: '1rem' }}>
                    <a 
                        href="http://localhost:5173" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-light)',
                            opacity: 0.7
                        }}
                    >
                        View Public Site <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
