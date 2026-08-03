import { PrismaService } from '../prisma.service';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(ownerId: string): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            expenses: number;
            revenues: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        type: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        color: string;
        monthlyGoal: import("@prisma/client/runtime/library").Decimal | null;
        yearlyGoal: import("@prisma/client/runtime/library").Decimal | null;
        initialInvestment: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(ownerId: string, data: {
        name: string;
        type: string;
        status?: any;
        color?: string;
        description?: string;
    }): import(".prisma/client").Prisma.Prisma__ProjectClient<{
        id: string;
        name: string;
        description: string | null;
        type: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        color: string;
        monthlyGoal: import("@prisma/client/runtime/library").Decimal | null;
        yearlyGoal: import("@prisma/client/runtime/library").Decimal | null;
        initialInvestment: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
