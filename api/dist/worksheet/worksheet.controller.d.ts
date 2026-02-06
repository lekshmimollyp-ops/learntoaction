import { PrismaService } from '../prisma.service';
export declare class WorksheetController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createWorksheet(body: any): Promise<any>;
    listWorksheets(page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    getWorksheet(slug: string): Promise<any>;
}
