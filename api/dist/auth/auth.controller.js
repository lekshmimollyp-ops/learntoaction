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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const zod_1 = require("zod");
const crypto = __importStar(require("crypto"));
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
let AuthController = class AuthController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seed() {
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const email = 'admin@learntoaction.com';
        const password = 'password';
        try {
            await this.prisma.client.query(`DROP TABLE IF EXISTS "User" CASCADE`);
            await this.prisma.client.query(`
                CREATE TABLE "User" (
                    "id" text NOT NULL,
                    "email" text NOT NULL,
                    "passwordHash" text NOT NULL,
                    "workspaceId" text NOT NULL,
                    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY ("id")
                );
            `);
            await this.prisma.client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
            `);
            try {
                await this.prisma.client.query(`INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`, [WORKSPACE_ID, 'Default Workspace']);
            }
            catch (e) { }
            await this.prisma.client.query(`INSERT INTO "User" (id, email, "passwordHash", "workspaceId", "updatedAt") 
                 VALUES ($1, $2, $3, $4, NOW()) 
                 ON CONFLICT (email) DO NOTHING`, [crypto.randomUUID(), email, password, WORKSPACE_ID]);
            return { success: true, message: 'Seeded into "User"' };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    async login(body) {
        console.log('Login Request Body:', JSON.stringify(body));
        try {
            const validation = LoginSchema.safeParse(body);
            if (!validation.success) {
                console.error('Validation failed:', validation.error);
                throw new common_1.BadRequestException('Invalid email or password format');
            }
            const { email, password } = validation.data;
            console.log(`Querying user: ${email}...`);
            const userRes = await this.prisma.client.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
            if (userRes.rows.length === 0) {
                console.warn(`User not found: ${email}`);
                throw new common_1.UnauthorizedException('Invalid credentials (User not found)');
            }
            const user = userRes.rows[0];
            console.log('User found. checking password...');
            const storedHash = user.passwordHash || user.passwordhash;
            if (!storedHash) {
                console.error('CRITICAL: Password column missing in row:', user);
                throw new common_1.InternalServerErrorException('Server Integrity Error: Missing password column');
            }
            if (storedHash !== password) {
                console.warn('Password mismatch');
                throw new common_1.UnauthorizedException('Invalid credentials (Password mismatch)');
            }
            console.log('Login success');
            return {
                success: true,
                token: user.id,
                user: {
                    id: user.id,
                    email: user.email,
                    workspaceId: user.workspaceId
                }
            };
        }
        catch (e) {
            console.error('Login Exception:', e);
            if (e instanceof common_1.UnauthorizedException || e instanceof common_1.BadRequestException) {
                throw e;
            }
            throw new common_1.InternalServerErrorException('Login Handler Failed: ' + e.message);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "seed", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map