import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common'
import { IsOptional, IsString } from 'class-validator'
import { JwtGuard } from '../auth/jwt.guard'
import { SettingsService } from './settings.service'

class UpdateTelegramDto {
  @IsOptional() @IsString() botToken?: string | null
  @IsOptional() @IsString() chatId?: string | null
}

@Controller('settings')
@UseGuards(JwtGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}
  @Get('telegram') getTelegram(@Req() req: any) { return this.settings.getTelegram(req.user.sub) }
  @Put('telegram') updateTelegram(@Req() req: any, @Body() dto: UpdateTelegramDto) { return this.settings.updateTelegram(req.user.sub, dto) }
  @Post('telegram/test') testTelegram(@Req() req: any) { return this.settings.testTelegram(req.user.sub) }
}
