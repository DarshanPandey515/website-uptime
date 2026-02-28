import React from 'react';
import * as Icons from 'phosphor-react';

const KPICard = ({ title, value, icon }) => {
    const getChangeColor = () => {
        if (change.startsWith('+')) return 'text-green-400';
        if (change.startsWith('-')) return 'text-red-400';
        return 'text-zinc-400';
    };

    // Map icon names to Phosphor icons
    const iconMap = {
        '🌐': Icons.Globe,
        '📊': Icons.ChartBar,
        '⚡': Icons.Lightning,
        '✅': Icons.CheckCircle,
        '⚠️': Icons.Warning,
        '🔄': Icons.ArrowsClockwise
    };

    const IconComponent = iconMap[icon] || Icons.Circle;

    return (
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-zinc-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <IconComponent size={32} className="text-zinc-400" weight="bold" />
            </div>
            {/* <div className="mt-4">
                <span className={`text-sm ${getChangeColor()}`}>
                    {change} from last month
                </span>
            </div> */}
        </div>
    );
};

export default KPICard;