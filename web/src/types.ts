export interface Block {
    id: string;
    type: 'heading' | 'text' | 'input' | 'media';
    content?: string;
    level?: 'h1' | 'h2' | 'h3'; // For headings
    label?: string; // For inputs
    inputType?: 'text' | 'email' | 'rating' | 'textarea' | 'boolean' | 'number' | 'date' | 'select';
    field_key?: string; // For inputs
    required?: boolean;
    scale?: number; // For rating
    options?: string[]; // For select
    placeholder?: string;
    url?: string; // For media
}

export interface Worksheet {
    version: number;
    blocks: Block[];
    title?: string;
    nextSlug?: string;
}

// Analytics Types
export interface DashboardStats {
    title: string;
    totalResponses: number;
    recent: {
        id: string;
        updatedAt: string;
        data: Record<string, any>;
    }[];
}
