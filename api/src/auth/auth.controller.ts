import { Controller, Post, Get, Body, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import * as crypto from 'crypto';

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

@Controller('auth')
export class AuthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('seed')
    async seed() {
        // ... (Same seed logic as before) ...
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const email = 'admin@learntoaction.com';
        const password = 'password';

        try {
            // Drop to ensure we have the correct columns
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

            // Ensure Workspace
            try {
                await this.prisma.client.query(
                    `INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`,
                    [WORKSPACE_ID, 'Default Workspace']
                );
            } catch (e) { }

            // Insert User
            await this.prisma.client.query(
                `INSERT INTO "User" (id, email, "passwordHash", "workspaceId", "updatedAt") 
                 VALUES ($1, $2, $3, $4, NOW()) 
                 ON CONFLICT (email) DO NOTHING`,
                [crypto.randomUUID(), email, password, WORKSPACE_ID]
            );
            return { success: true, message: 'Seeded into "User"' };

        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    @Post('login')
    async login(@Body() body: any) {
        console.log('Login Request Body:', JSON.stringify(body));

        try {
            const validation = LoginSchema.safeParse(body);
            if (!validation.success) {
                console.error('Validation failed:', validation.error);
                throw new BadRequestException('Invalid email or password format');
            }

            const { email, password } = validation.data;

            // 1. Find User
            console.log(`Querying user: ${email}...`);
            const userRes = await this.prisma.client.query(
                `SELECT * FROM "User" WHERE email = $1`,
                [email]
            );

            if (userRes.rows.length === 0) {
                console.warn(`User not found: ${email}`);
                throw new UnauthorizedException('Invalid credentials (User not found)');
            }

            const user = userRes.rows[0];
            console.log('User found. checking password...');

            // 2. Validate Password
            // Handle case sensitivity: check passwordHash or passwordhash
            const storedHash = user.passwordHash || user.passwordhash;

            if (!storedHash) {
                console.error('CRITICAL: Password column missing in row:', user);
                throw new InternalServerErrorException('Server Integrity Error: Missing password column');
            }

            if (storedHash !== password) {
                console.warn('Password mismatch');
                throw new UnauthorizedException('Invalid credentials (Password mismatch)');
            }

            // 3. Return "Token"
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
        } catch (e) {
            console.error('Login Exception:', e);
            if (e instanceof UnauthorizedException || e instanceof BadRequestException) {
                throw e;
            }
            throw new InternalServerErrorException('Login Handler Failed: ' + e.message);
        }
    }
}
