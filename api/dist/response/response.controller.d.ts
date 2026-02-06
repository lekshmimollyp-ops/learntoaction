import { PrismaService } from '../prisma.service';
export declare class ResponseController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    saveResponse(body: any): Promise<{
        success: boolean;
        responseId: string | null | undefined;
    }>;
    getStats(slug: string, page?: number, limit?: number): Promise<{
        title: any;
        blocks: any;
        totalResponses: number;
        recent: any[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
}
