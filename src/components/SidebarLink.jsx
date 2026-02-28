import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'phosphor-react';

const SidebarLink = ({ to, icon, label, isActive }) => {
    // Get the icon component dynamically
    const IconComponent = Icons[icon];
    
    return (
        <Link
            to={to}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
        >
            {IconComponent && <IconComponent size={20} weight="bold" />}
            <span>{label}</span>
        </Link>
    );
};

export default SidebarLink;