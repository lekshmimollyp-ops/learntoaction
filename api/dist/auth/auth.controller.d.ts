import { PrismaService } from '../prisma.service';
export declare class AuthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    seed(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    login(body: any): Promise<{
        success: boolean;
        token: any;
        user: {
            id: any;
            email: any;
            workspaceId: any;
        };
    }>;
}
