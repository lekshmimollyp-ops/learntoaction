import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

// Inline type to avoid cache/export issues
interface DashboardStats {
    title: string;
    totalResponses: number;
    recent: {
        id: string;
        updatedAt: string;
        data: Record<string, any>;
    }[];
}

export const AnalyticsDashboard = () => {
    const { slug } = useParams();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<DashboardStats>(`/responses/${slug}/stats`)
            // @ts-ignore
            .then((data: any) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
    if (!stats) return <div className="p-8 text-center">No data found</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{stats.title}</h1>
                    <p className="text-gray-500">Analytics Dashboard</p>
                </div>
                <div className="bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 text-center">
                    <span className="block text-3xl font-bold text-blue-600">{stats.totalResponses}</span>
                    <span className="text-sm text-blue-800 uppercase font-bold tracking-wide">Total Responses</span>
                </div>
            </div>

            <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Recent Activity (Last 10)</h3>
                </div>
                <ul>
                    {stats.recent.map((res) => (
                        <li key={res.id} className="p-6 border-b last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-mono text-gray-400">{res.id.split('-')[0]}...</span>
                                <span className="text-xs text-gray-500">{new Date(res.updatedAt).toLocaleString()}</span>
                            </div>
                            <pre className="text-sm bg-gray-50 p-2 rounded text-gray-700 overflow-x-auto">
                                {JSON.stringify(res.data, null, 2)}
                            </pre>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
