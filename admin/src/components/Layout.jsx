import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const COLLAPSED_W  = '68px';
const EXPANDED_W   = '260px';

const Layout = ({ children, handleLogout }) => {
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = collapsed ? COLLAPSED_W : EXPANDED_W;

    return (
        <div className="admin-container">
            <Sidebar
                handleLogout={handleLogout}
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
            />
            <TopBar sidebarWidth={sidebarWidth} />
            <main
                className="animate-fade-in"
                style={{
                    flex: 1,
                    padding: '2rem 2.5rem',
                    marginLeft: sidebarWidth,
                    marginTop: 'var(--topbar-height)',
                    minHeight: 'calc(100vh - var(--topbar-height))',
                    transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
