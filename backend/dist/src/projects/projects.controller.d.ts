import { ProjectsService } from './projects.service';
declare class CreateProjectDto {
    name: string;
    type: string;
    description?: string;
    color?: string;
    status?: string;
}
export declare class ProjectsController {
    private readonly projects;
    constructor(projects: ProjectsService);
    list(req: any): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(req: any, dto: CreateProjectDto): import(".prisma/client").Prisma.Prisma__ProjectClient<{
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
export {};
