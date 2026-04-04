import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, handleLogout }) => {
    return (
        <div className="admin-container">
            <Sidebar handleLogout={handleLogout} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
