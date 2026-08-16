import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}
  @Get('summary') summary(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) { return this.dashboard.summary(req.user.sub, from, to) }
  @Get('cashflow') cashflow(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) { return this.dashboard.cashflow(req.user.sub, from, to) }
}
