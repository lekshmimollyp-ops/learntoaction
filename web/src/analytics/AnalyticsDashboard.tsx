import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { Pagination } from "../components/Pagination";

// Inline types (replicating what backend sends)
interface Block {
    id: string;
    type: string;
    label?: string;
    field_key?: string;
    inputType?: string;
}

interface DashboardStats {
    title: string;
    totalResponses: number;
    blocks: Block[];
    recent: {
        id: string;
        updatedAt: string;
        data: Record<string, any>;
    }[];
    meta?: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export const AnalyticsDashboard = () => {
    const { slug } = useParams();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        api.get<DashboardStats>(`/responses/${slug}/stats?page=${page}&limit=10`)
            // @ts-ignore
            .then((data: any) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [slug, page]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    if (!stats) return <div className="p-8 text-center text-gray-500">No data found</div>;

    // Filter only input blocks (questions) for columns
    const questionBlocks = stats.blocks.filter(b => b.type === 'input');

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{stats.title}</h1>
                    <p className="text-gray-500 mt-1">Analytics Dashboard</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm text-center">
                    <span className="block text-3xl font-bold text-blue-600">{stats.totalResponses}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Responses</span>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">All Responses</h3>
                    <span className="text-sm text-gray-500">Showing {stats.recent.length} of {stats.totalResponses}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                    Date
                                </th>
                                {questionBlocks.map(block => (
                                    <th key={block.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                        {block.label || "Untitled Question"}
                                    </th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Full Data
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.recent.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(res.updatedAt).toLocaleString()}
                                    </td>

                                    {questionBlocks.map(block => {
                                        // key might be field_key OR id (fallback)
                                        const key = block.field_key || block.id;
                                        const val = res.data[key];

                                        return (
                                            <td key={block.id} className="px-6 py-4 text-sm text-gray-900 align-top">
                                                {formatAnswer(val)}
                                            </td>
                                        );
                                    })}

                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono max-w-xs truncate">
                                        {JSON.stringify(res.data)}
                                    </td>
                                </tr>
                            ))}
                            {stats.recent.length === 0 && (
                                <tr>
                                    <td colSpan={questionBlocks.length + 2} className="px-6 py-12 text-center text-gray-400">
                                        No responses yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {stats.meta && (
                <Pagination
                    currentPage={stats.meta.page}
                    totalPages={stats.meta.lastPage}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
};

// Helper to format different answer types nicely
function formatAnswer(val: any): React.ReactNode | string {
    if (val === undefined || val === null || val === '') return <span className="text-gray-300">-</span>;
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val); // Fallback for arrays
    return String(val);
}
