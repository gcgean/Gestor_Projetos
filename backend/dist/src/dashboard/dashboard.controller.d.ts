import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboard;
    constructor(dashboard: DashboardService);
    summary(req: any): Promise<{
        projects: number;
        revenue: number;
        expense: number;
        profit: number;
        roi: number;
    }>;
}
