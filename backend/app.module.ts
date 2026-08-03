import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from './prisma.service'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { ProjectsController } from './projects/projects.controller'
import { ProjectsService } from './projects/projects.service'
import { DashboardController } from './dashboard/dashboard.controller'
import { DashboardService } from './dashboard/dashboard.service'
import { HealthController } from './health.controller'

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'dev-secret', signOptions: { expiresIn: '7d' } })],
  controllers: [AuthController, ProjectsController, DashboardController, HealthController],
  providers: [PrismaService, AuthService, ProjectsService, DashboardService],
})
export class AppModule {}
