import { Controller, Get, Post, Body, Param, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';

const SaveResponseSchema = z.object({
    slug: z.string(),
    answers: z.record(z.string(), z.any()), // key: string, value: any
    responseId: z.string().nullable().optional(), // Allow null from JSON
});

@Controller('responses')
export class ResponseController {
    constructor(private readonly prisma: PrismaService) { }

    @Post()
    async saveResponse(@Body() body: any) {
        const validation = SaveResponseSchema.safeParse(body);
        if (!validation.success) {
            throw new BadRequestException(validation.error);
        }

        const { slug, answers, responseId } = validation.data;

        // Ghost Tenant ID
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';

        // 1. Get Worksheet ID from Slug
        const wsRes = await this.prisma.client.query(
            `SELECT id FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`,
            [slug, WORKSPACE_ID]
        );

        if (wsRes.rows.length === 0) {
            throw new BadRequestException('Invalid worksheet slug');
        }
        const worksheetId = wsRes.rows[0].id;

        // 2. Insert or Update Response
        // If responseId is provided, we try to update. If not, we create new.
        let savedId = responseId;

        if (!savedId) {
            const insertRes = await this.prisma.client.query(
                `INSERT INTO "Response" ("worksheetId", "workspaceId", data, "updatedAt")
                 VALUES ($1, $2, $3, NOW())
                 RETURNING id`,
                [worksheetId, WORKSPACE_ID, JSON.stringify(answers)]
            );
            savedId = insertRes.rows[0].id;
        } else {
            await this.prisma.client.query(
                `UPDATE "Response" SET data = $1, "updatedAt" = NOW()
                 WHERE id = $2 AND "worksheetId" = $3`,
                [JSON.stringify(answers), savedId, worksheetId]
            );
        }

        return { success: true, responseId: savedId };
    }

    @Get(':slug/stats')
    async getStats(
        @Param('slug') slug: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';
        const p = Number(page) || 1;
        const l = Number(limit) || 10;
        const offset = (p - 1) * l;

        // 1. Get Worksheet ID & Schema (Now fetching schema too)
        const wsRes = await this.prisma.client.query(
            `SELECT id, title, schema FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`,
            [slug, WORKSPACE_ID]
        );

        if (wsRes.rows.length === 0) {
            throw new NotFoundException('Worksheet not found');
        }
        const worksheet = wsRes.rows[0];

        // Parse Schema to get blocks
        const parsedSchema = typeof worksheet.schema === 'string' ? JSON.parse(worksheet.schema) : worksheet.schema;

        // 2. Get Total Count
        const countRes = await this.prisma.client.query(
            `SELECT COUNT(*) as total FROM "Response" WHERE "worksheetId" = $1`,
            [worksheet.id]
        );
        const total = parseInt(countRes.rows[0].total);

        // 3. Get All Responses (Paginated)
        const recentRes = await this.prisma.client.query(
            `SELECT id, data, "updatedAt" FROM "Response" 
             WHERE "worksheetId" = $1 
             ORDER BY "updatedAt" DESC 
             LIMIT $2 OFFSET $3`,
            [worksheet.id, l, offset]
        );

        return {
            title: worksheet.title,
            blocks: parsedSchema.blocks || [], // Return blocks so UI knows questions
            totalResponses: total,
            recent: recentRes.rows,
            meta: {
                total: total,
                page: p,
                lastPage: Math.ceil(total / l)
            }
        };
    }
}
