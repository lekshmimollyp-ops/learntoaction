import { PrismaService } from '../prisma.service';
export declare class ResponseController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    saveResponse(body: any): Promise<{
        success: boolean;
        responseId: string | null | undefined;
    }>;
    getStats(slug: string): Promise<{
        title: any;
        totalResponses: number;
        recent: any[];
    }>;
}
