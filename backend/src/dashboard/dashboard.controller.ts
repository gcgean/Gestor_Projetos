import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}
  @Get('summary') summary(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string, @Query('projectId') projectId?: string) { return this.dashboard.summary(req.user.sub, from, to, projectId) }
  @Get('cashflow') cashflow(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string, @Query('projectId') projectId?: string) { return this.dashboard.cashflow(req.user.sub, from, to, projectId) }
  @Get('monthly') monthly(@Req() req: any, @Query('projectId') projectId?: string) { return this.dashboard.monthly(req.user.sub, projectId) }
}
