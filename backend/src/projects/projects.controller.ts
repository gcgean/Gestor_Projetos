import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator'
import { JwtGuard } from '../auth/jwt.guard'
import { ProjectsService } from './projects.service'

class CreateProjectDto {
  @IsString() @MinLength(2) name = ''
  @IsString() type = ''
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() color?: string
  @IsOptional() @IsIn(['IDEA','DEVELOPMENT','MVP','LAUNCHED','SCALING','PAUSED','CLOSED']) status?: string
}

@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}
  @Get() list(@Req() req: any) { return this.projects.list(req.user.sub) }
  @Post() create(@Req() req: any, @Body() dto: CreateProjectDto) { return this.projects.create(req.user.sub, dto as any) }
}
