import React, { useState } from 'react';
import * as Icons from 'phosphor-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWebsite, fetchWebsite } from '../utils/websiteService';
import { Link } from 'react-router-dom';

const WebsitesPage = () => {
    const queryClient = useQueryClient();
    const [websiteName, setWebsiteName] = useState("");
    const [websiteURL, setWebsiteURL] = useState("");
    const [interval, setInterval] = useState(5);


    const mutation = useMutation({
        mutationFn: createWebsite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["websites"] })
        }
    })

    const { data: websites = [], isLoading } = useQuery({
        queryKey: ["websites"],
        queryFn: fetchWebsite,
    })

    console.log(websites);


    const handleSubmit = (e) => {
        e.preventDefault();

        mutation.mutate({
            website_name: websiteName,
            website_url: websiteURL,
            interval: interval,
        });
        setWebsiteName("")
        setWebsiteURL("")
        setInterval()

    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Websites</h1>
                <p className="text-zinc-400">Manage and monitor your websites</p>
            </div>

            {/* Add Website Form */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
                <h2 className="text-xl font-semibold mb-6">Add New Website</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mutation.isError && <p>Error Creating website</p>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Website Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Company Website"
                                value={websiteName}
                                onChange={(e) => setWebsiteName(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg 
                                         text-zinc-100 placeholder-zinc-500
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                                         transition-colors"
                            />
                        </div>

                        {/* Website URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Website URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={websiteURL}
                                onChange={(e) => setWebsiteURL(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg 
                                         text-zinc-100 placeholder-zinc-500
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                                         transition-colors"
                            />
                        </div>

                        {/* Check Interval */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">
                                Check Interval
                            </label>
                            <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg 
                                         text-zinc-100
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                                         transition-colors"
                            >
                                <option value="1">Every 1 minutes</option>
                                <option value="5">Every 5 minutes</option>
                                <option value="15">Every 15 minutes</option>
                                <option value="30">Every 30 minutes</option>
                                <option value="60">Every hour</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-2 flex items-end">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 
                                         text-white font-medium rounded-lg
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                         transition-colors flex items-center justify-center space-x-2"
                            >
                                <Icons.Plus size={20} weight="bold" />
                                <span>{mutation.isPending ? "creating..." : "create website"}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Monitored Websites Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Monitored Websites</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Icons.MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" weight="bold" />
                            <input
                                type="text"
                                placeholder="Search websites..."
                                className="pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                                         text-zinc-100 placeholder-zinc-500 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Websites Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Website</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Interval</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Response</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Last Check</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {websites.map((site, index) => (
                                <tr key={site.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center">
                                            <span
                                                className={`w-2 h-2 rounded-full ${site.last_status ? "text-green-400" : "text-red-400"} mr-2 `}></span>
                                            <span className={`text-sm ${site.last_status ? "text-green-400" : "text-red-400"
                                                }`}>
                                                {site.last_status ? "Operational" : "Down"}
                                            </span>

                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <Link to={`/dashboard/websites/${site.id}`}>
                                            {site.website_name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{site.website_url}</td>
                                    <td className="px-6 py-4 text-sm">{site.interval} minutes</td>
                                    <td className="px-6 py-4 text-sm">
                                        {site.last_response_time ? `${Math.round(site.last_response_time)} ms` : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {new Date(site.last_checked).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button className="text-zinc-400 hover:text-blue-400 transition-colors" title="Edit">
                                                <Icons.Pencil size={18} weight="bold" />
                                            </button>
                                            <button className="text-zinc-400 hover:text-yellow-400 transition-colors" title="Pause">
                                                <Icons.Pause size={18} weight="bold" />
                                            </button>
                                            <button className="text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
                                                <Icons.Trash size={18} weight="bold" />
                                            </button>
                                            <button className="text-zinc-400 hover:text-green-400 transition-colors" title="Check Now">
                                                <Icons.ArrowsClockwise size={18} weight="bold" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WebsitesPage;