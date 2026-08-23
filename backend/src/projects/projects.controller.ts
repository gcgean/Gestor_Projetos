import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator'
import { JwtGuard } from '../auth/jwt.guard'
import { ProjectsService } from './projects.service'

class CreateProjectDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) @IsString() @MinLength(2) name = ''
  @IsString() type = ''
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() color?: string
  @IsOptional() @IsIn(['IDEA','DEVELOPMENT','MVP','LAUNCHED','SCALING','PAUSED','CLOSED']) status?: string
  @IsOptional() @Transform(({ value }) => typeof value === 'string' ? (value.trim() || null) : value) @IsString() url?: string | null
}

@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}
  @Get() list(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string, @Query('category') category?: string) { return this.projects.list(req.user.sub, from, to, category) }
  @Post() create(@Req() req: any, @Body() dto: CreateProjectDto) { return this.projects.create(req.user.sub, dto as any) }
  @Put(':id') update(@Req() req: any, @Param('id') id: string, @Body() dto: CreateProjectDto) { return this.projects.update(req.user.sub, id, dto as any) }
  @Delete(':id') remove(@Req() req: any, @Param('id') id: string) { return this.projects.remove(req.user.sub, id) }
}
