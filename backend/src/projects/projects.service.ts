import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  list(ownerId: string) { return this.prisma.project.findMany({ where: { ownerId }, include: { _count: { select: { revenues: true, expenses: true } } }, orderBy: { updatedAt: 'desc' } }) }
  create(ownerId: string, data: { name: string; type: string; status?: any; color?: string; description?: string }) { return this.prisma.project.create({ data: { ...data, ownerId } }) }
}
