import { useState } from 'react';
import { api } from '../api';
import type { Block } from '../types';
import { BlockPicker } from './BlockPicker';

export const Builder = () => {
    const [title, setTitle] = useState('New Worksheet');
    const [slug, setSlug] = useState('new-worksheet');
    const [nextSlug, setNextSlug] = useState('');
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [saving, setSaving] = useState(false);

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            content: type === 'heading' ? 'New Heading' : type === 'text' ? 'New text content' : undefined,
            label: type === 'input' ? 'New Question' : undefined,
            field_key: type === 'input' ? `field_${Date.now()}` : undefined,
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<Block>) => {
        setBlocks(blocks.map(b => (b.id === id ? { ...b, ...updates } : b)));
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                title,
                slug,
                content: { version: 1, blocks, nextSlug }
            };
            await api.post('/worksheets', payload);
            alert('Saved!');
            // Optional: Redirect or show link
            if (confirm('Saved! View live worksheet?')) {
                window.open(`/w/${slug}`, '_blank');
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-gray-50">
            {/* Editor Sidebar - Widened */}
            <div className="w-[600px] flex-shrink-0 flex flex-col border-r bg-white shadow-xl z-10">
                <div className="p-6 border-b bg-gray-50/50">
                    <h1 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🛠️</span> Editor
                    </h1>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Worksheet Title</label>
                            <input
                                value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Daily Reflection"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">URL Slug</label>
                            <div className="flex items-center">
                                <span className="bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg px-3 py-2 text-sm font-mono">/w/</span>
                                <input
                                    value={slug} onChange={e => setSlug(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-r-lg text-sm font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="daily-reflection"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Next Worksheet (Optional)</label>
                            <div className="flex items-center">
                                <span className="bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg px-3 py-2 text-sm font-mono">→</span>
                                <input
                                    value={nextSlug} onChange={e => setNextSlug(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-r-lg text-sm font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="slug-of-next-worksheet"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toolbox</label>
                        <BlockPicker onAdd={addBlock} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blocks ({blocks.length})</label>
                        </div>

                        {blocks.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <div className="text-4xl mb-3">✨</div>
                                <p className="text-gray-900 font-medium">Start Building</p>
                                <p className="text-gray-500 text-sm mt-1">Select a tool from the toolbox above.</p>
                            </div>
                        )}

                        {blocks.map((block, index) => (
                            <div key={block.id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-blue-300">
                                {/* Header / Controls */}
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                        title="Delete Block"
                                    >
                                        <span className="sr-only">Delete</span>
                                        🗑️
                                    </button>
                                </div>

                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-blue-400 rounded-l-xl transition-colors"></div>

                                <div className="p-5 pl-6">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                            {block.type}
                                        </span>
                                    </div>

                                    {/* Heading Editor */}
                                    {block.type === 'heading' && (
                                        <div className="space-y-1">
                                            <input
                                                value={block.content}
                                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                                className="w-full text-lg font-bold text-gray-900 border-none px-0 py-1 focus:ring-0 placeholder-gray-300 bg-transparent"
                                                placeholder="Type Heading Here..."
                                                autoFocus
                                            />
                                            <p className="text-xs text-gray-400">Section title for separation</p>
                                        </div>
                                    )}

                                    {/* Text Editor */}
                                    {block.type === 'text' && (
                                        <textarea
                                            value={block.content}
                                            onChange={e => updateBlock(block.id, { content: e.target.value })}
                                            className="w-full text-sm text-gray-700 bg-gray-50 border-0 rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400"
                                            placeholder="Type your instructional text or paragraph content here..."
                                            autoFocus
                                        />
                                    )}

                                    {/* Input Editor */}
                                    {block.type === 'input' && (
                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    value={block.label}
                                                    onChange={e => updateBlock(block.id, { label: e.target.value })}
                                                    className="w-full font-semibold text-gray-900 text-lg border-none p-0 focus:ring-0 placeholder-gray-300 bg-transparent"
                                                    placeholder="Type your question here?"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Response Type</label>
                                                        <select
                                                            value={block.inputType || 'text'}
                                                            onChange={e => updateBlock(block.id, { inputType: e.target.value as any })}
                                                            className="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 focus:border-blue-500 outline-none cursor-pointer"
                                                        >
                                                            <option value="text">Short Text</option>
                                                            <option value="textarea">Long Text (Paragraph)</option>
                                                            <option value="email">Email Address</option>
                                                            <option value="number">Number</option>
                                                            <option value="date">Date Picker</option>
                                                            <option value="select">Dropdown Menu</option>
                                                            <option value="rating">Star Rating</option>
                                                            <option value="boolean">Yes / No</option>
                                                        </select>
                                                    </div>

                                                    {/* Variable ID - Hidden by default or subtle */}
                                                    <div className="w-1/3 opacity-50 hover:opacity-100 transition-opacity">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block truncate" title="Variable Name (Database Key)">Data ID</label>
                                                        <input
                                                            value={block.field_key}
                                                            onChange={e => updateBlock(block.id, { field_key: e.target.value })}
                                                            className="w-full text-xs bg-white border border-gray-200 rounded-md px-2 py-2 text-gray-500 font-mono focus:border-blue-500 outline-none"
                                                            placeholder="var_name"
                                                            title="Unique ID for this answer"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Progressive Discolsure for Options */}
                                                {(block.inputType === 'rating') && (
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <label className="flex items-center gap-3 text-sm text-gray-600">
                                                            <span>Max Scale:</span>
                                                            <input
                                                                type="range" min="3" max="10"
                                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                value={block.scale || 5}
                                                                onChange={e => updateBlock(block.id, { scale: parseInt(e.target.value) })}
                                                            />
                                                            <span className="font-mono bg-white border px-2 py-0.5 rounded">{block.scale || 5}</span>
                                                        </label>
                                                    </div>
                                                )}

                                                {(block.inputType === 'select') && (
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Dropdown Options</label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            value={(block.options || []).join(', ')}
                                                            onChange={e => updateBlock(block.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                            placeholder="Option A, Option B, Option C (comma separated)"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t bg-white space-y-2 relative z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={save}
                        disabled={saving}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 font-bold shadow-lg shadow-gray-200 transform active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <span className="animate-spin">⏳</span> : <span>💾</span>}
                        {saving ? 'Saving...' : 'Save Worksheet'}
                    </button>
                    <button
                        onClick={() => window.open(`/analytics/${slug}`, '_blank')}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                        View Results Dashboard
                    </button>
                </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute inset-0 pattern-grid-lg text-gray-200 opacity-20 pointer-events-none" />

                <div className="w-[420px] h-[800px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden relative ring-4 ring-gray-900/10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                    <div className="h-full overflow-y-auto bg-[#F8FAFC] custom-scrollbar pb-20">
                        {/* Mock Header */}
                        <div className="h-14 bg-white/90 sticky top-0 z-10 flex items-center px-6 border-b border-gray-100 backdrop-blur-md">
                            <span className="font-semibold text-gray-800 text-sm truncate">{title}</span>
                        </div>

                        {/* Content Preview */}
                        <div className="p-6 space-y-8">
                            {blocks.length === 0 && (
                                <div className="text-center py-20 text-gray-400">
                                    <p className="text-sm">Worksheet is empty.</p>
                                </div>
                            )}

                            {blocks.map(block => (
                                <div key={block.id} className="pointer-events-none select-none">
                                    {block.type === 'heading' && (
                                        <div className="mt-6 first:mt-0">
                                            <h2 className="text-lg font-bold text-gray-800">{block.content}</h2>
                                        </div>
                                    )}

                                    {block.type === 'text' && (
                                        <p className="text-sm text-gray-600 leading-relaxed">{block.content}</p>
                                    )}

                                    {block.type === 'input' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-800">
                                                {block.label}
                                            </label>

                                            {/* Mock Input Fields matching Runner Style */}
                                            {block.inputType === 'textarea' ? (
                                                <div className="h-24 bg-white rounded-lg border border-gray-200 shadow-sm p-3 text-gray-300 text-sm">
                                                    {block.placeholder || "Type your answer here..."}
                                                </div>
                                            ) : block.inputType === 'rating' ? (
                                                <div className="flex gap-2 opacity-60">
                                                    {[1, 2, 3, 4, 5].slice(0, Math.min(5, block.scale || 5)).map(i => (
                                                        <div key={i} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 bg-white">{i}</div>
                                                    ))}
                                                </div>
                                            ) : block.inputType === 'boolean' ? (
                                                <div className="flex gap-2 opacity-80">
                                                    <div className="flex-1 py-2 border border-gray-200 rounded text-center text-xs text-gray-500 bg-white">Yes</div>
                                                    <div className="flex-1 py-2 border border-gray-200 rounded text-center text-xs text-gray-500 bg-white">No</div>
                                                </div>
                                            ) : (
                                                <div className="h-10 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-3 text-gray-300 text-sm">
                                                    {block.placeholder || "Type here..."}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-8 text-gray-400 font-mono text-xs flex flex-col items-center gap-1">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Mobile Preview</span>
                    <span className="opacity-50">iPhone 14 Pro</span>
                </div>
            </div>
        </div>
    );
};
