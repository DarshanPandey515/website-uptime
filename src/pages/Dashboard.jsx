import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as Icons from 'phosphor-react';
import { useAuthStore } from '../utils/authStore';
import SidebarLink from '../components/SidebarLink';
import AccountMenu from '../components/AccountMenu';

function Dashboard() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const userName = useAuthStore((state) => state.user?.username);

    const user = {
        username: userName || 'User',
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        // Navigate to login page
    };

    const sidebarLinks = [
        { path: '/dashboard', label: 'Home', icon: 'House', end: true }, // This will match exactly /dashboard
        { path: '/dashboard/websites', label: 'Websites', icon: 'Globe' },
        { path: '/dashboard/settings', label: 'Settings', icon: 'Gear' }
    ];

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100">
            {/* Sidebar */}
            <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
                {/* Logo */}
                <div className="p-6">
                    <div className="flex items-center space-x-2">
                        <Icons.MagnifyingGlass size={28} weight="bold" className="text-blue-400" />
                        <span className="font-bold text-xl">WebMonitor</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-1">
                    {sidebarLinks.map((link) => (
                        <SidebarLink
                            key={link.path}
                            to={link.path}
                            icon={link.icon}
                            label={link.label}
                            isActive={link.end
                                ? location.pathname === link.path
                                : location.pathname.startsWith(link.path)}
                        />
                    ))}
                </nav>

                {/* Account Section */}
                <AccountMenu
                    user={user}
                    showMenu={showAccountMenu}
                    onToggle={() => setShowAccountMenu(!showAccountMenu)}
                    onClose={() => setShowAccountMenu(false)}
                    onLogout={handleLogout}
                />
            </div>

            {/* Main Content - This is where pages will render */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}

export default Dashboard;