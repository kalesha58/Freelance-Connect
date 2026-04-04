import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import JobManagement from './pages/JobManagement';
import PostManagement from './pages/PostManagement';

function App() {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            setAuth(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAuth(null);
    };

    if (loading) return null;

    return (
        <Router>
            <Routes>
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
                        <Route path="/settings" element={<Layout handleLogout={handleLogout}><div className="card"><h3>System Settings</h3><p>Configure platform-wide parameters.</p></div></Layout>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;
