"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const zod_1 = require("zod");
const SaveResponseSchema = zod_1.z.object({
    slug: zod_1.z.string(),
    answers: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    responseId: zod_1.z.string().nullable().optional(),
});
let ResponseController = class ResponseController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveResponse(body) {
        const validation = SaveResponseSchema.safeParse(body);
        if (!validation.success) {
            throw new common_1.BadRequestException(validation.error);
        }
        const { slug, answers, responseId } = validation.data;
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const wsRes = await this.prisma.client.query(`SELECT id FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`, [slug, WORKSPACE_ID]);
        if (wsRes.rows.length === 0) {
            throw new common_1.BadRequestException('Invalid worksheet slug');
        }
        const worksheetId = wsRes.rows[0].id;
        let savedId = responseId;
        if (!savedId) {
            const insertRes = await this.prisma.client.query(`INSERT INTO "Response" ("worksheetId", "workspaceId", data, "updatedAt")
                 VALUES ($1, $2, $3, NOW())
                 RETURNING id`, [worksheetId, WORKSPACE_ID, JSON.stringify(answers)]);
            savedId = insertRes.rows[0].id;
        }
        else {
            await this.prisma.client.query(`UPDATE "Response" SET data = $1, "updatedAt" = NOW()
                 WHERE id = $2 AND "worksheetId" = $3`, [JSON.stringify(answers), savedId, worksheetId]);
        }
        return { success: true, responseId: savedId };
    }
    async getStats(slug, page = 1, limit = 10) {
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const offset = (p - 1) * l;
        const wsRes = await this.prisma.client.query(`SELECT id, title, schema FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`, [slug, WORKSPACE_ID]);
        if (wsRes.rows.length === 0) {
            throw new common_1.NotFoundException('Worksheet not found');
        }
        const worksheet = wsRes.rows[0];
        const parsedSchema = typeof worksheet.schema === 'string' ? JSON.parse(worksheet.schema) : worksheet.schema;
        const countRes = await this.prisma.client.query(`SELECT COUNT(*) as total FROM "Response" WHERE "worksheetId" = $1`, [worksheet.id]);
        const total = parseInt(countRes.rows[0].total);
        const recentRes = await this.prisma.client.query(`SELECT id, data, "updatedAt" FROM "Response" 
             WHERE "worksheetId" = $1 
             ORDER BY "updatedAt" DESC 
             LIMIT $2 OFFSET $3`, [worksheet.id, l, offset]);
        return {
            title: worksheet.title,
            blocks: parsedSchema.blocks || [],
            totalResponses: total,
            recent: recentRes.rows,
            meta: {
                total: total,
                page: p,
                lastPage: Math.ceil(total / l)
            }
        };
    }
};
exports.ResponseController = ResponseController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResponseController.prototype, "saveResponse", null);
__decorate([
    (0, common_1.Get)(':slug/stats'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ResponseController.prototype, "getStats", null);
exports.ResponseController = ResponseController = __decorate([
    (0, common_1.Controller)('responses'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResponseController);
//# sourceMappingURL=response.controller.js.map