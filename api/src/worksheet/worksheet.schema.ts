import { z } from 'zod';

export enum BlockType {
    HEADING = 'heading',
    TEXT = 'text',
    INPUT = 'input',
    MEDIA = 'media',
}

export const BlockBaseSchema = z.object({
    id: z.string().uuid(),
    type: z.nativeEnum(BlockType),
});

export const HeadingBlockSchema = BlockBaseSchema.extend({
    type: z.literal(BlockType.HEADING),
    content: z.string(),
    level: z.enum(['h1', 'h2', 'h3']).default('h1'),
});

export const TextBlockSchema = BlockBaseSchema.extend({
    type: z.literal(BlockType.TEXT),
    content: z.string(), // Rich text or markdown
});

export enum InputType {
    TEXT = 'text',
    EMAIL = 'email',
    RATING = 'rating',
    TEXTAREA = 'textarea',
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    DATE = 'date',
    SELECT = 'select',
}

export const InputBlockSchema = BlockBaseSchema.extend({
    type: z.literal(BlockType.INPUT),
    label: z.string(),
    inputType: z.nativeEnum(InputType).default(InputType.TEXT),
    field_key: z.string().min(1),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    scale: z.number().optional(),
    options: z.array(z.string()).optional(),
});

export const MediaBlockSchema = BlockBaseSchema.extend({
    type: z.literal(BlockType.MEDIA),
    url: z.string().url(),
    caption: z.string().optional(),
});

export const BlockSchema = z.discriminatedUnion('type', [
    HeadingBlockSchema,
    TextBlockSchema,
    InputBlockSchema,
    MediaBlockSchema,
]);

export type Block = z.infer<typeof BlockSchema>;

export const WorksheetContentSchema = z.object({
    version: z.literal(1),
    blocks: z.array(BlockSchema),
    nextSlug: z.string().optional(),
    // layout: This is implicit 'vertical' for Tier 1
});

export type WorksheetContent = z.infer<typeof WorksheetContentSchema>;
