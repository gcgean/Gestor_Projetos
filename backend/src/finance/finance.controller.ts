import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { JwtGuard } from '../auth/jwt.guard'
import { FinanceService } from './finance.service'

class CreateFinanceDto {
  @IsString() projectId = ''
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) @IsString() @MinLength(2) category = ''
  @IsOptional() @IsString() description?: string
  @IsNumber() @Min(0.01) amount = 0
  @IsISO8601() competence = ''
  @IsOptional() @IsISO8601() receivedAt?: string
  @IsOptional() @IsISO8601() dueDate?: string
}

@Controller('finance')
@UseGuards(JwtGuard)
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('revenues') revenues(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) { return this.finance.revenues(req.user.sub, from, to) }
  @Post('revenues') createRevenue(@Req() req: any, @Body() dto: CreateFinanceDto) { return this.finance.createRevenue(req.user.sub, dto) }
  @Delete('revenues/:id') deleteRevenue(@Req() req: any, @Param('id') id: string) { return this.finance.deleteRevenue(req.user.sub, id) }
  @Put('revenues/:id') updateRevenue(@Req() req: any, @Param('id') id: string, @Body() dto: CreateFinanceDto) { return this.finance.updateRevenue(req.user.sub, id, dto) }
  @Get('expenses') expenses(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) { return this.finance.expenses(req.user.sub, from, to) }
  @Post('expenses') createExpense(@Req() req: any, @Body() dto: CreateFinanceDto) { return this.finance.createExpense(req.user.sub, dto) }
  @Delete('expenses/:id') deleteExpense(@Req() req: any, @Param('id') id: string) { return this.finance.deleteExpense(req.user.sub, id) }
  @Put('expenses/:id') updateExpense(@Req() req: any, @Param('id') id: string, @Body() dto: CreateFinanceDto) { return this.finance.updateExpense(req.user.sub, id, dto) }
}
