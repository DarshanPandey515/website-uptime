import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'phosphor-react';
import { fetchWebsiteId } from '../utils/websiteService';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../utils/authStore';

const DetailWebsitePage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id } = useParams();
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedTab, setSelectedTab] = useState('overview');

    const accessToken = useAuthStore((state) => state.accessToken);

    // Dedicated state for last_checked so the live timer resets immediately
    // when a WebSocket message arrives, without waiting for React Query's
    // async cache → re-render cycle.
    const [lastCheckedAt, setLastCheckedAt] = useState(null);

    useEffect(() => {
        if (!accessToken || !id) return;

        let socket = null;
        let isMounted = true;

        const connect = () => {
            if (!isMounted) return;

            socket = new WebSocket(
                `ws://localhost:8000/ws/monitor/?token=${accessToken}`
            );

            socket.onopen = () => {
                console.log("WebSocket connected");
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (String(data.website.id) !== String(id)) return;

                // ✅ Reset the live timer immediately — don't rely on cache timing
                setLastCheckedAt(data.website.last_checked);

                queryClient.setQueryData(["website", id], (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        website: {
                            ...oldData.website,
                            ...data.website,
                        },
                        metrics: data.metrics,
                        recent_checks: [
                            data.new_check,
                            ...oldData.recent_checks
                        ].slice(0, 50)
                    };
                });
            };

            socket.onclose = () => {
                if (isMounted) {
                    setTimeout(connect, 3000);
                }
            };
        };

        connect();

        return () => {
            isMounted = false;
            if (socket) {
                socket.onclose = null;
                socket.close();
            }
        };
    }, [accessToken, id]);

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    const { data, isLoading } = useQuery({
        queryKey: ["website", id],
        queryFn: () => fetchWebsiteId(id),
        enabled: !!id,

    })

    // Seed lastCheckedAt from the initial REST fetch (runs once after load)
    useEffect(() => {
        if (data?.website?.last_checked && !lastCheckedAt) {
            setLastCheckedAt(data.website.last_checked);
        }
    }, [data?.website?.last_checked]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );


    const websiteData = data.website;
    const metrics = data.metrics;
    const recentChecks = data.recent_checks || []

    console.log("websiteData:",websiteData);
    console.log("metrics:",metrics);
    console.log("recentChecks:",recentChecks);
    
    

    const formatRelativeTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleString();
    };

    const formatLiveRelativeTime = (isoString) => {
        if (!isoString) return "Never";

        const date = new Date(isoString);
        const diffMs = now - date;   // <-- use live "now"
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs < 5) return "Just now";
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
        if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;

        return date.toLocaleString();
    };

    const getStatusIcon = (status) =>
        status ? <Icons.CheckCircle size={16} weight="fill" /> : <Icons.XCircle size={16} weight="fill" />;

    const formatDuration = (isoString) => {
        if (!isoString) return "00:00:00";

        const start = new Date(isoString).getTime();
        const diff = Math.max(0, now - start);

        const totalSeconds = Math.floor(diff / 1000);

        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="p-8">
            {/* Header with navigation */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard/websites')}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Icons.ArrowLeft size={20} className="text-zinc-400" weight="bold" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{websiteData.website_name}</h1>
                        <div className="flex items-center space-x-3">
                            <a
                                href={websiteData.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
                            >
                                <Icons.Link size={16} weight="bold" />
                                <span>{websiteData.website_url}</span>
                            </a>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400">ID: {websiteData.id}</span>
                            <span className="text-zinc-400">INTERVAL: {websiteData.interval} minutes</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors flex items-center space-x-2">
                        <Icons.Pause size={11} weight="bold" />
                        <span>Pause Monitoring</span>
                    </button>
                    <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center space-x-2">
                        <Icons.ArrowsClockwise size={11} weight="bold" />
                        <span>Check Now</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

                {/* 1. Uptime Card */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-zinc-400 text-sm mb-2">Uptime (24h)</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent drop-shadow-sm">
                                {metrics?.uptime_24h}%
                            </p>
                        </div>
                        <Icons.ArrowCircleUp
                            size={28}
                            className="text-emerald-400 ml-3 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300"
                            weight="bold"
                        />
                    </div>
                </div>

                {/* 2. Avg Response Card */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-zinc-400 text-sm mb-2">Avg Response</p>
                            <p className="text-3xl font-bold text-blue-400 drop-shadow-sm">
                                {Math.round(metrics?.avg_response_24h || 0)}ms
                            </p>
                        </div>
                        <Icons.Gauge
                            size={28}
                            className="text-blue-400 ml-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                            weight="bold"
                        />
                    </div>

                    {/* Speed badge */}
                    <div className="mt-3 pt-2 border-t border-zinc-800">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${(metrics?.avg_response_24h || 0) < 500
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}>
                            {(metrics?.avg_response_24h || 0) < 500 ? '⚡ Fast' : '🐌 Slow'}
                        </span>
                    </div>
                </div>

                {/* 3. Last Checked Card (Your enhanced version - PERFECT) */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-zinc-400 text-sm mb-1">Last Checked</p>
                            <p className={`text-2xl font-bold ${websiteData.last_status
                                ? 'text-green-400 drop-shadow-sm'
                                : 'text-red-400 animate-pulse drop-shadow-sm'
                                }`}>
                                {formatDuration(lastCheckedAt)} ago
                            </p>
                        </div>

                        <div className={`ml-3 flex-shrink-0 transition-all duration-200 ${websiteData.last_status ? 'text-green-400 scale-110' : 'text-red-400'
                            }`}>
                            {websiteData.last_status ? (
                                <Icons.CheckCircle size={26} weight="bold" />
                            ) : (
                                <Icons.XCircle size={26} weight="bold" />
                            )}
                        </div>
                    </div>

                    {websiteData.last_response_time && (
                        <div className="mt-2 pt-2 border-t border-zinc-800">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800/50 text-emerald-400 border border-emerald-400/30 backdrop-blur-sm">
                                ⚡ {websiteData.last_response_time.toFixed(0)}ms
                            </span>
                        </div>
                    )}
                </div>

                {/* 4. Total Checks Card */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-zinc-400 text-sm mb-2">Total Checks (last 24h)</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                                {metrics?.total_check_24h || 0}
                            </p>
                        </div>
                        <Icons.Clock
                            size={28}
                            className="text-violet-400 ml-3 flex-shrink-0 group-hover:rotate-12 transition-all duration-300"
                            weight="bold"
                        />
                    </div>
                </div>
            </div>


            <div className="border-b border-zinc-800 mb-6">
                <div className="flex space-x-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: Icons.Globe },
                        { id: 'checks', label: 'Recent Checks', icon: Icons.Clock },
                        { id: 'settings', label: 'Settings', icon: Icons.Gear }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`pb-4 px-1 flex items-center space-x-2 border-b-2 transition-all duration-300 group hover:scale-[1.02] ${selectedTab === tab.id
                                ? 'border-emerald-500 text-white shadow-emerald-500/25 shadow-lg'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                }`}
                        >
                            <tab.icon
                                size={20}
                                weight={selectedTab === tab.id ? 'fill' : 'bold'}
                                className={`transition-all ${selectedTab === tab.id ? 'text-emerald-500' : 'group-hover:text-zinc-200'}`}
                            />
                            <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {selectedTab === 'overview' && (
                    <>
                        {/* Performance Metrics (Enhanced) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 hover:border-blue-500/50 transition-all duration-300">
                                <h3 className="font-semibold text-white mb-6 flex items-center space-x-2">
                                    <Icons.ChartBar size={20} className="text-blue-400" />
                                    <span>Performance Metrics</span>
                                </h3>

                                {/* Dynamic progress bars from your metrics */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-400">Avg Response (24h)</span>
                                            <span className="text-white font-mono">{Math.round(metrics?.avg_response_24h || 0)}ms</span>
                                        </div>
                                        <div className="w-full bg-zinc-800/50 backdrop-blur-sm rounded-full h-3 border">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-lg transition-all duration-700"
                                                style={{ width: `${Math.min((metrics?.avg_response_24h || 0) / 20, 90)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-400">Total Checks (24h)</span>
                                            <span className="text-white font-mono">{metrics?.total_check_24h || 0}</span>
                                        </div>
                                        <div className="w-full bg-zinc-800/50 backdrop-blur-sm rounded-full h-3 border">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full shadow-lg transition-all duration-700"
                                                style={{ width: `${Math.min((metrics?.total_check_24h || 0) * 2, 95)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-400">Uptime (24h)</span>
                                            <span className="text-emerald-400 font-mono">{metrics?.uptime_24h || 0}%</span>
                                        </div>
                                        <div className="w-full bg-zinc-800/50 backdrop-blur-sm rounded-full h-3 border">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 h-3 rounded-full shadow-lg transition-all duration-700"
                                                style={{ width: `${metrics?.uptime_24h || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SSL Info (Enhanced) */}
                            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 hover:border-emerald-500/50 transition-all duration-300">
                                <h3 className="font-semibold text-white mb-6 flex items-center space-x-2">
                                    <Icons.Shield size={20} className="text-emerald-400" />
                                    <span>SSL Certificate</span>
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-b-0">
                                        <span className="text-zinc-400">Status</span>
                                        <div className="flex items-center space-x-2 text-emerald-400">
                                            <Icons.CheckCircle size={18} weight="fill" />
                                            <span className="font-medium">Valid</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-b-0">
                                        <span className="text-zinc-400">Expires In</span>
                                        <span className="text-blue-400 font-mono">45 days</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-zinc-400">Issuer</span>
                                        <span className="text-zinc-300 truncate max-w-[140px]">Let's Encrypt</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Recent Checks Table (Enhanced with formatted times) */}
                {selectedTab === 'checks' && (
                    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden">
                        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
                            <h3 className="font-semibold text-white flex items-center space-x-2">
                                <Icons.Clock size={20} className="text-blue-400" />
                                <span>Recent Checks ({recentChecks.length})</span>
                            </h3>
                            <select className="px-4 py-2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500">
                                <option>All Status</option>
                                <option>Success</option>
                                <option>Failed</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Response</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Code</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {recentChecks.map((check) => (
                                        <tr key={check.id} className="hover:bg-zinc-800/30 transition-all duration-200">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-zinc-300">
                                                    {formatRelativeTime(check.checked_at)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${check.status ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                    {getStatusIcon(check.status)}
                                                    <span>{check.status ? "UP" : "DOWN"}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-zinc-300">
                                                    {Math.round(check.response_time)}ms
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-mono ${check.status_code === 200 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {check.status_code}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'settings' && (
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                        <h3 className="font-semibold mb-4">Monitoring Settings</h3>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Check Interval</label>
                                    <select className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                                        <option>Every 1 minute</option>
                                        <option>Every 5 minutes</option>
                                        <option selected>Every 15 minutes</option>
                                        <option>Every 30 minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Timeout (seconds)</label>
                                    <input type="number" defaultValue="30" className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Expected Status Code</label>
                                <input type="number" defaultValue="200" className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg" />
                            </div>
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" id="alerts" className="rounded bg-zinc-800 border-zinc-700" />
                                <label htmlFor="alerts" className="text-sm text-zinc-300">Enable alerts for this website</label>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                                    Save Changes
                                </button>
                                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
                                    Reset to Default
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailWebsitePage;