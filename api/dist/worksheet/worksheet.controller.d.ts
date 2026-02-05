import { PrismaService } from '../prisma.service';
export declare class WorksheetController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createWorksheet(body: any): Promise<any>;
    listWorksheets(): Promise<any[]>;
    getWorksheet(slug: string): Promise<any>;
}
