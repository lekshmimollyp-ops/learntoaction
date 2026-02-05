import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Worksheet, Block } from '../types';
import { useAutosave } from './useAutosave';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft, CheckCircle2, Cloud, AlertCircle } from 'lucide-react';

export const WorksheetRunner = ({ slug }: { slug: string }) => {
    const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const { register, control, setValue } = useForm();
    const answers = useWatch({ control });

    const [isComplete, setIsComplete] = useState(false);

    // Autosave Hook
    const saveStatus = useAutosave(slug, answers || {});

    const handleFinish = async () => {
        if (!confirm('Are you sure you want to finish?')) return;

        // Force final save (optional, since autosave handles it, but good for UX confirmation)
        setIsComplete(true);

        if (worksheet?.nextSlug) {
            // Redirect to next worksheet
            window.location.href = `/w/${worksheet.nextSlug}`;
        }
    };

    useEffect(() => {
        api.get<Worksheet>(`/worksheets/${slug}`)
            // @ts-ignore
            .then((data: any) => {
                console.log('API Response:', data); // DEBUG
                const ws = data.default || data;
                if (!ws || !ws.blocks) {
                    console.error('Invalid worksheet data:', ws);
                }
                setWorksheet(ws);
                setLoading(false);
            })
            .catch((err) => {
                console.error('API Error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 w-24 bg-gray-100 rounded"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500 w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unavailable</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <a href="/" className="text-blue-600 hover:underline">Go Home</a>
            </div>
        </div>
    );

    // Defensive check
    if (!worksheet) return null;

    // Ensure blocks exists
    const blocks = worksheet.blocks || [];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm/50 backdrop-blur-md bg-white/90">
                <a href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </a>

                <h1 className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-md opacity-90">{worksheet.title}</h1>

                <div className="flex items-center gap-2 text-xs font-medium">
                    {saveStatus === 'saving' && (
                        <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            <Cloud className="w-3.5 h-3.5 animate-pulse" /> Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                            Could not save
                        </span>
                    )}
                </div>
            </div>

            {/* If complete show specific success state if no next slug, otherwise we redirect */}
            {isComplete && !worksheet?.nextSlug && (
                <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-bold text-gray-900">All Done!</h1>
                        <p className="text-gray-500 mt-2">You have completed this worksheet.</p>
                    </div>
                </div>
            )}

            {/* Document Container */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-32">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                    {/* Hero Header in Doc */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <div className="p-8 sm:p-12 border-b border-gray-100">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                            {worksheet.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">v1.0</span>
                            <span>•</span>
                            <span>{blocks.length} Items</span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 space-y-10">
                        {blocks.map((block) => (
                            <BlockRenderer
                                key={block.id}
                                block={block}
                                register={register}
                                setValue={setValue}
                            />
                        ))}
                    </div>

                    <div className="px-8 pb-12 sm:px-12">
                        <button
                            onClick={handleFinish}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            Complete & Continue
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-sm text-gray-400">
                    Powered by <span className="font-bold text-gray-500">LearnToAction</span>
                </div>
            </div>
        </div>
    );
};

const BlockRenderer = ({ block, register, setValue }: { block: Block, register: any, setValue: any }) => {
    switch (block.type) {
        case 'heading':
            return (
                <div className="pt-4 border-t border-gray-100 mt-8 first:mt-0 first:border-0 first:pt-0">
                    <h2 className="text-xl font-bold text-gray-800">{block.content}</h2>
                </div>
            );
        case 'text':
            return <div className="prose prose-blue text-gray-600 leading-relaxed max-w-none">{block.content}</div>;
        case 'input':
            return (
                <div className="group transition-colors p-4 -mx-4 rounded-xl hover:bg-gray-50/50">
                    <label className="block text-base font-semibold text-gray-800 mb-3 leading-snug">
                        {block.label} {block.required && <span className="text-red-500 select-none">*</span>}
                    </label>
                    <InputField block={block} register={register} setValue={setValue} />
                </div>
            );
        default:
            return null;
    }
};

const InputField = ({ block, register, setValue }: { block: Block, register: any, setValue: any }) => {
    const commonClasses = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 font-medium";
    const fieldKey = block.field_key || block.id;

    if (block.inputType === 'textarea') {
        return (
            <textarea
                {...register(fieldKey)}
                className={`${commonClasses} min-h-[120px] resize-y`}
                placeholder={block.placeholder || "Type your answer here..."}
            />
        );
    }

    if (block.inputType === 'select') {
        return (
            <div className="relative">
                <select {...register(fieldKey)} className={`${commonClasses} appearance-none bg-no-repeat bg-right pr-10`}>
                    <option value="">Select an option...</option>
                    {block.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                </div>
            </div>
        );
    }

    if (block.inputType === 'rating') {
        return (
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: block.scale || 5 }).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setValue(fieldKey, i + 1)}
                        className="w-12 h-12 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 hover:text-blue-600 transition-all bg-white shadow-sm"
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        );
    }

    if (block.inputType === 'boolean') {
        return (
            <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                    <input {...register(fieldKey)} type="radio" value="yes" className="peer sr-only" />
                    <div className="text-center py-3 px-4 border border-gray-200 rounded-lg peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 hover:bg-gray-50 transition-all font-medium text-gray-600">
                        Yes
                    </div>
                </label>
                <label className="flex-1 cursor-pointer">
                    <input {...register(fieldKey)} type="radio" value="no" className="peer sr-only" />
                    <div className="text-center py-3 px-4 border border-gray-200 rounded-lg peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 hover:bg-gray-50 transition-all font-medium text-gray-600">
                        No
                    </div>
                </label>
            </div>
        );
    }

    return (
        <input
            type={block.inputType || 'text'}
            {...register(fieldKey)}
            className={commonClasses}
            placeholder={block.placeholder || "Type here..."}
        />
    );
};
