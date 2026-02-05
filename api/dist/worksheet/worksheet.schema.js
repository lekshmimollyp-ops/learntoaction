"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorksheetContentSchema = exports.BlockSchema = exports.MediaBlockSchema = exports.InputBlockSchema = exports.InputType = exports.TextBlockSchema = exports.HeadingBlockSchema = exports.BlockBaseSchema = exports.BlockType = void 0;
const zod_1 = require("zod");
var BlockType;
(function (BlockType) {
    BlockType["HEADING"] = "heading";
    BlockType["TEXT"] = "text";
    BlockType["INPUT"] = "input";
    BlockType["MEDIA"] = "media";
})(BlockType || (exports.BlockType = BlockType = {}));
exports.BlockBaseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.nativeEnum(BlockType),
});
exports.HeadingBlockSchema = exports.BlockBaseSchema.extend({
    type: zod_1.z.literal(BlockType.HEADING),
    content: zod_1.z.string(),
    level: zod_1.z.enum(['h1', 'h2', 'h3']).default('h1'),
});
exports.TextBlockSchema = exports.BlockBaseSchema.extend({
    type: zod_1.z.literal(BlockType.TEXT),
    content: zod_1.z.string(),
});
var InputType;
(function (InputType) {
    InputType["TEXT"] = "text";
    InputType["EMAIL"] = "email";
    InputType["RATING"] = "rating";
    InputType["TEXTAREA"] = "textarea";
    InputType["BOOLEAN"] = "boolean";
    InputType["NUMBER"] = "number";
    InputType["DATE"] = "date";
    InputType["SELECT"] = "select";
})(InputType || (exports.InputType = InputType = {}));
exports.InputBlockSchema = exports.BlockBaseSchema.extend({
    type: zod_1.z.literal(BlockType.INPUT),
    label: zod_1.z.string(),
    inputType: zod_1.z.nativeEnum(InputType).default(InputType.TEXT),
    field_key: zod_1.z.string().min(1),
    required: zod_1.z.boolean().default(false),
    placeholder: zod_1.z.string().optional(),
    scale: zod_1.z.number().optional(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.MediaBlockSchema = exports.BlockBaseSchema.extend({
    type: zod_1.z.literal(BlockType.MEDIA),
    url: zod_1.z.string().url(),
    caption: zod_1.z.string().optional(),
});
exports.BlockSchema = zod_1.z.discriminatedUnion('type', [
    exports.HeadingBlockSchema,
    exports.TextBlockSchema,
    exports.InputBlockSchema,
    exports.MediaBlockSchema,
]);
exports.WorksheetContentSchema = zod_1.z.object({
    version: zod_1.z.literal(1),
    blocks: zod_1.z.array(exports.BlockSchema),
    nextSlug: zod_1.z.string().optional(),
});
//# sourceMappingURL=worksheet.schema.js.map