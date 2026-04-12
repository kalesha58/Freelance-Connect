import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import JobManagement from './pages/JobManagement';
import PostManagement from './pages/PostManagement';
import Settings from './pages/Settings';
import AccountDeletionInfo from './pages/AccountDeletionInfo';

function DesktopOnlyWall() {
    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--text-main)',
            gap: '1.5rem'
        }}>
            <div style={{
                backgroundColor: 'var(--primary-light)',
                padding: '2rem',
                borderRadius: '50%',
                color: 'var(--primary)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <Monitor size={64} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Desktop Recommended</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '350px', fontSize: '1.05rem', margin: 0 }}>
                The admin panel is optimized for larger screens to provide the best experience for platform management. Please access it from a desktop or tablet device.
            </p>
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
            }}>
                Current window width: {typeof window !== 'undefined' ? window.innerWidth : 0}px
            </div>
        </div>
    );
}

function AppRoutes({ auth, setAuth, handleLogout }) {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allowMobile = location.pathname === '/account-deletion-info';
    if (isMobile && !allowMobile) {
        return <DesktopOnlyWall />;
    }

    return (
        <Routes>
            <Route path="/account-deletion-info" element={<AccountDeletionInfo />} />
            {!auth ? (
                <>
                    <Route path="/login" element={<Login setAuth={setAuth} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            ) : (
                <>
                    <Route path="/" element={<Layout handleLogout={handleLogout}><Dashboard /></Layout>} />
                    <Route path="/users" element={<Layout handleLogout={handleLogout}><UserManagement /></Layout>} />
                    <Route path="/jobs" element={<Layout handleLogout={handleLogout}><JobManagement /></Layout>} />
                    <Route path="/posts" element={<Layout handleLogout={handleLogout}><PostManagement /></Layout>} />
                    <Route path="/settings" element={<Layout handleLogout={handleLogout}><Settings /></Layout>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </>
            )}
        </Routes>
    );
}

function App() {
    const [auth, setAuth] = useState(() => {
        try {
            const storedUser = localStorage.getItem('adminUser');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAuth(null);
    };

    return (
        <Router>
            <AppRoutes auth={auth} setAuth={setAuth} handleLogout={handleLogout} />
        </Router>
    );
}

export default App;
