import type { Block } from '../types';

export const BlockPicker = ({ onAdd }: { onAdd: (type: Block['type']) => void }) => {
    return (
        <div className="flex gap-2 mb-4 border-b pb-4">
            <button onClick={() => onAdd('heading')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">
                + Heading
            </button>
            <button onClick={() => onAdd('text')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">
                + Text
            </button>
            <button onClick={() => onAdd('input')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">
                + Input
            </button>
        </div>
    );
};
