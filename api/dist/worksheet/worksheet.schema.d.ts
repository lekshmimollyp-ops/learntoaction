import { z } from 'zod';
export declare enum BlockType {
    HEADING = "heading",
    TEXT = "text",
    INPUT = "input",
    MEDIA = "media"
}
export declare const BlockBaseSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<typeof BlockType>;
}, z.core.$strip>;
export declare const HeadingBlockSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.HEADING>;
    content: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<{
        h1: "h1";
        h2: "h2";
        h3: "h3";
    }>>;
}, z.core.$strip>;
export declare const TextBlockSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.TEXT>;
    content: z.ZodString;
}, z.core.$strip>;
export declare enum InputType {
    TEXT = "text",
    EMAIL = "email",
    RATING = "rating",
    TEXTAREA = "textarea",
    BOOLEAN = "boolean",
    NUMBER = "number",
    DATE = "date",
    SELECT = "select"
}
export declare const InputBlockSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.INPUT>;
    label: z.ZodString;
    inputType: z.ZodDefault<z.ZodEnum<typeof InputType>>;
    field_key: z.ZodString;
    required: z.ZodDefault<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
    scale: z.ZodOptional<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const MediaBlockSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.MEDIA>;
    url: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const BlockSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.HEADING>;
    content: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<{
        h1: "h1";
        h2: "h2";
        h3: "h3";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.TEXT>;
    content: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.INPUT>;
    label: z.ZodString;
    inputType: z.ZodDefault<z.ZodEnum<typeof InputType>>;
    field_key: z.ZodString;
    required: z.ZodDefault<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
    scale: z.ZodOptional<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<BlockType.MEDIA>;
    url: z.ZodString;
    caption: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "type">;
export type Block = z.infer<typeof BlockSchema>;
export declare const WorksheetContentSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<BlockType.HEADING>;
        content: z.ZodString;
        level: z.ZodDefault<z.ZodEnum<{
            h1: "h1";
            h2: "h2";
            h3: "h3";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<BlockType.TEXT>;
        content: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<BlockType.INPUT>;
        label: z.ZodString;
        inputType: z.ZodDefault<z.ZodEnum<typeof InputType>>;
        field_key: z.ZodString;
        required: z.ZodDefault<z.ZodBoolean>;
        placeholder: z.ZodOptional<z.ZodString>;
        scale: z.ZodOptional<z.ZodNumber>;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<BlockType.MEDIA>;
        url: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>], "type">>;
    nextSlug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type WorksheetContent = z.infer<typeof WorksheetContentSchema>;
