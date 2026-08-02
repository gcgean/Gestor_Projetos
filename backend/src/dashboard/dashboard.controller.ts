import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}
  @Get('summary') summary(@Req() req: any) { return this.dashboard.summary(req.user.sub) }
}
