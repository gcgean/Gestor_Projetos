import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async list(ownerId: string) {
    const projects = await this.prisma.project.findMany({ where: { ownerId }, orderBy: { updatedAt: 'desc' } })

    return Promise.all(projects.map(async project => {
      const [revenues, expenses] = await Promise.all([
        this.prisma.revenue.aggregate({ where: { projectId: project.id }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { projectId: project.id }, _sum: { amount: true } }),
      ])
      const revenue = Number(revenues._sum.amount ?? 0)
      const expense = Number(expenses._sum.amount ?? 0)
      return { ...project, revenue, expense, margin: revenue ? ((revenue - expense) / revenue) * 100 : 0 }
    }))
  }
  async update(ownerId: string, id: string, data: { name?: string; type?: string; status?: any; color?: string; description?: string }) {
    const result = await this.prisma.project.updateMany({ where: { id, ownerId }, data })
    if (!result.count) throw new Error('Projeto não encontrado')
    return this.prisma.project.findUnique({ where: { id } })
  }
  async remove(ownerId: string, id: string) {
    const result = await this.prisma.project.deleteMany({ where: { id, ownerId } })
    if (!result.count) throw new Error('Projeto não encontrado')
    return { deleted: true }
  }
  create(ownerId: string, data: { name: string; type: string; status?: any; color?: string; description?: string }) { return this.prisma.project.create({ data: { ...data, ownerId } }) }
}
