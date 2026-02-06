import { useEffect, useState } from 'react';
import { api } from '../api';
import { Pagination } from '../components/Pagination';

interface WorksheetSummary {
    id: string;
    title: string;
    slug: string;
    updatedAt: string;
}

interface PaginatedWorksheets {
    data: WorksheetSummary[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export const WorksheetList = () => {
    const [worksheets, setWorksheets] = useState<WorksheetSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchWorksheets = (pageNum: number) => {
        setLoading(true);
        api.get<PaginatedWorksheets | WorksheetSummary[]>(`/worksheets?page=${pageNum}&limit=10`)
            // @ts-ignore
            .then(res => {
                const response = res as any;
                // Handle both old array format (fallback) and new paginated format
                if (Array.isArray(response)) {
                    setWorksheets(response);
                    setTotalPages(1);
                } else if (response && response.data) {
                    setWorksheets(response.data);
                    setTotalPages(response.meta?.lastPage || 1);
                    setPage(response.meta?.page || 1);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchWorksheets(page);
    }, [page]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading library...</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Worksheets</h1>
                    <p className="text-gray-500">Manage your learning content</p>
                </div>
                <button
                    onClick={() => window.location.href = '/builder'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    + Create New
                </button>
            </div>

            {worksheets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No worksheets found.</p>
                    <a href="/builder" className="text-blue-600 font-medium hover:underline">Create your first one</a>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {worksheets.map(ws => (
                                <li key={ws.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{ws.title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                                            <span className="bg-gray-100 px-2 py-1 rounded">/{ws.slug}</span>
                                            <span>Updated: {new Date(ws.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={`/w/${ws.slug}`}
                                            target="_blank"
                                            className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-1 border border-gray-200 rounded hover:border-blue-200"
                                        >
                                            Student View ↗
                                        </a>
                                        <a
                                            href={`/analytics/${ws.slug}`}
                                            className="text-gray-600 hover:text-purple-600 font-medium text-sm px-3 py-1 border border-gray-200 rounded hover:border-purple-200"
                                        >
                                            Analytics 📊
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
};
