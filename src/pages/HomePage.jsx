import React from 'react';
import * as Icons from 'phosphor-react';
import KPICard from '../components/KPICard';
import { fetchWebsite } from '../utils/websiteService';
import { useQuery, useQueryClient } from '@tanstack/react-query'


const HomePage = () => {
    const queryClient = useQueryClient();

    const { data: websites = [], isLoading } = useQuery({
        queryKey: ["websites"],
        queryFn: fetchWebsite,
    })

    

    const kpiData = [
        { title: 'Total Websites', value: websites.length , change: '+12%', icon: '🌐' },
        { title: 'Active Monitors', value: websites.length, change: '+5%', icon: '📊' },
        { title: 'Avg Response Time', value: 'comming soon..', change: '-23ms', icon: '⚡' },
        { title: 'Uptime', value: 'comming soon..', change: '+0.2%', icon: '✅' },
        { title: 'Issues Detected', value: 'comming soon..', change: '-2', icon: '⚠️' },
        { title: 'Total Checks', value: 'comming soon..', change: '+180k', icon: '🔄' }
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'up': return 'text-green-400';
            case 'down': return 'text-red-400';
            case 'degraded': return 'text-yellow-400';
            default: return 'text-zinc-400';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'up': return 'bg-green-500/10';
            case 'down': return 'bg-red-500/10';
            case 'degraded': return 'bg-yellow-500/10';
            default: return 'bg-zinc-800';
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-zinc-400">Monitor your websites in real-time</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;