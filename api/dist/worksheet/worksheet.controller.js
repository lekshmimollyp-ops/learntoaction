"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorksheetController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const worksheet_schema_1 = require("./worksheet.schema");
const exampleJson = __importStar(require("./example.json"));
let WorksheetController = class WorksheetController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWorksheet(body) {
        const validation = worksheet_schema_1.WorksheetContentSchema.safeParse(body.content);
        if (!validation.success) {
            throw new common_1.BadRequestException(validation.error);
        }
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        await this.prisma.client.query(`INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`, [WORKSPACE_ID, 'Default Workspace']);
        const slug = body.slug || `ws-${Date.now()}`;
        const title = body.title || 'Untitled Worksheet';
        const result = await this.prisma.client.query(`INSERT INTO "Worksheet" (title, slug, schema, "workspaceId", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT ("workspaceId", slug) 
       DO UPDATE SET schema = $3, title = $1, "updatedAt" = NOW()
       RETURNING *`, [title, slug, JSON.stringify(validation.data), WORKSPACE_ID]);
        return result.rows[0];
    }
    async listWorksheets() {
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const result = await this.prisma.client.query(`SELECT id, title, slug, "updatedAt" FROM "Worksheet" WHERE "workspaceId" = $1 ORDER BY "updatedAt" DESC`, [WORKSPACE_ID]);
        return result.rows;
    }
    async getWorksheet(slug) {
        try {
            if (slug === 'demo') {
                return exampleJson;
            }
            const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
            const result = await this.prisma.client.query(`SELECT * FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`, [slug, WORKSPACE_ID]);
            if (result.rows.length === 0) {
                console.warn(`Worksheet not found: ${slug}`);
                throw new common_1.NotFoundException(`Worksheet '${slug}' not found`);
            }
            const row = result.rows[0];
            const schema = typeof row.schema === 'string' ? JSON.parse(row.schema) : row.schema;
            return {
                ...schema,
                id: row.id,
                title: row.title,
                slug: row.slug
            };
        }
        catch (e) {
            console.error('Error getting worksheet:', e);
            throw e;
        }
    }
};
exports.WorksheetController = WorksheetController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorksheetController.prototype, "createWorksheet", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorksheetController.prototype, "listWorksheets", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorksheetController.prototype, "getWorksheet", null);
exports.WorksheetController = WorksheetController = __decorate([
    (0, common_1.Controller)('worksheets'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorksheetController);
//# sourceMappingURL=worksheet.controller.js.map