import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { WorksheetContentSchema } from './worksheet.schema';
import * as exampleJson from './example.json';

@Controller('worksheets')
export class WorksheetController {
    constructor(private readonly prisma: PrismaService) { }

    @Post()
    async createWorksheet(@Body() body: any) {
        // 1. Validation
        const validation = WorksheetContentSchema.safeParse(body.content);
        if (!validation.success) {
            throw new BadRequestException(validation.error);
        }

        // 2. Ghost Tenant ID (Hardcoded for Tier 1 MVP)
        // In Tier 2, this comes from req.user.workspaceId
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000'; // Default UUID

        // Ensure Workspace exists (Idempotent for dev)
        await this.prisma.client.query(
            `INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`,
            [WORKSPACE_ID, 'Default Workspace']
        );

        // 3. Save to DB
        const slug = body.slug || `ws-${Date.now()}`;
        const title = body.title || 'Untitled Worksheet';

        // Upsert Logic (Simulated with raw SQL)
        const result = await this.prisma.client.query(
            `INSERT INTO "Worksheet" (title, slug, schema, "workspaceId", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT ("workspaceId", slug) 
       DO UPDATE SET schema = $3, title = $1, "updatedAt" = NOW()
       RETURNING *`,
            [title, slug, JSON.stringify(validation.data), WORKSPACE_ID]
        );

        return result.rows[0];
    }

    @Get()
    async listWorksheets(
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const offset = (p - 1) * l;

        // 1. Get Total Count
        const countRes = await this.prisma.client.query(
            `SELECT COUNT(*) as total FROM "Worksheet" WHERE "workspaceId" = $1`,
            [WORKSPACE_ID]
        );
        const total = parseInt(countRes.rows[0].total);

        // 2. Get Paginated Data
        const result = await this.prisma.client.query(
            `SELECT id, title, slug, "updatedAt" FROM "Worksheet" 
             WHERE "workspaceId" = $1 
             ORDER BY "updatedAt" DESC
             LIMIT $2 OFFSET $3`,
            [WORKSPACE_ID, l, offset]
        );

        return {
            data: result.rows,
            meta: {
                total,
                page: p,
                lastPage: Math.ceil(total / l)
            }
        };
    }

    @Get(':slug')
    async getWorksheet(@Param('slug') slug: string) {
        try {
            if (slug === 'demo') {
                return exampleJson;
            }

            // Ghost Tenant ID
            const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';

            const result = await this.prisma.client.query(
                `SELECT * FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`,
                [slug, WORKSPACE_ID]
            );

            if (result.rows.length === 0) {
                console.warn(`Worksheet not found: ${slug}`);
                throw new NotFoundException(`Worksheet '${slug}' not found`);
            }

            // Return the schema merged with metadata
            const row = result.rows[0];
            const schema = typeof row.schema === 'string' ? JSON.parse(row.schema) : row.schema;

            return {
                ...schema,
                id: row.id,
                title: row.title,
                slug: row.slug
            };
        } catch (e) {
            console.error('Error getting worksheet:', e);
            throw e;
        }
    }
}
