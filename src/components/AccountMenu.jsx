import React from 'react';
import * as Icons from 'phosphor-react';

const AccountMenu = ({ user, showMenu, onToggle, onClose, onLogout }) => {
    return (
        <div className="p-4 border-t border-zinc-800 relative">
            <button
                onClick={onToggle}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    <span className="text-sm font-medium">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                </div>
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{user?.username || 'User'}</div>
                </div>
                <Icons.CaretDown size={16} className="text-zinc-500" weight="bold" />
            </button>

            {/* Account Dropdown Menu */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    {/* Dropdown menu */}
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-50">
                        <div className="p-2">
                            <button
                                onClick={onClose}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-md transition-colors"
                            >
                                <Icons.User size={18} weight="bold" />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-md transition-colors"
                            >
                                <Icons.Gear size={18} weight="bold" />
                                <span>Account Settings</span>
                            </button>
                            <div className="h-px bg-zinc-700 my-2" />
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                                <Icons.SignOut size={18} weight="bold" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AccountMenu;