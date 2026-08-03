import { PrismaService } from '../prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    summary(ownerId: string): Promise<{
        projects: number;
        revenue: number;
        expense: number;
        profit: number;
        roi: number;
    }>;
}
