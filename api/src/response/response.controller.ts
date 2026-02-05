import { Controller, Get, Post, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
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
    async getStats(@Param('slug') slug: string) {
        const WORKSPACE_ID = '00000000-0000-0000-0000-000000000000';

        // 1. Get Worksheet ID
        const wsRes = await this.prisma.client.query(
            `SELECT id, title FROM "Worksheet" WHERE slug = $1 AND "workspaceId" = $2`,
            [slug, WORKSPACE_ID]
        );

        if (wsRes.rows.length === 0) {
            throw new NotFoundException('Worksheet not found');
        }
        const worksheet = wsRes.rows[0];

        // 2. Get Total Count
        const countRes = await this.prisma.client.query(
            `SELECT COUNT(*) as total FROM "Response" WHERE "worksheetId" = $1`,
            [worksheet.id]
        );

        // 3. Get Recent Responses
        const recentRes = await this.prisma.client.query(
            `SELECT id, data, "updatedAt" FROM "Response" 
             WHERE "worksheetId" = $1 
             ORDER BY "updatedAt" DESC 
             LIMIT 10`,
            [worksheet.id]
        );

        return {
            title: worksheet.title,
            totalResponses: parseInt(countRes.rows[0].total),
            recent: recentRes.rows
        };
    }
}
