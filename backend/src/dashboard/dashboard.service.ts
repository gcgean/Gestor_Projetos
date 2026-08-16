import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async summary(ownerId: string, from?: string, to?: string) {
    const competence = this.competenceRange(from, to)
    const [projects, revenues, expenses] = await Promise.all([
      this.prisma.project.count({ where: { ownerId } }),
      this.prisma.revenue.aggregate({ where: { project: { ownerId }, ...(competence ? { competence } : {}) }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { project: { ownerId }, ...(competence ? { competence } : {}) }, _sum: { amount: true } }),
    ])
    const revenue = Number(revenues._sum.amount ?? 0)
    const expense = Number(expenses._sum.amount ?? 0)
    return { projects, revenue, expense, profit: revenue - expense, roi: expense ? ((revenue - expense) / expense) * 100 : 0 }
  }
  private competenceRange(from?: string, to?: string) {
    if (!from && !to) return null
    const range: { gte?: Date; lte?: Date } = {}
    if (from) range.gte = new Date(`${from}T00:00:00.000Z`)
    if (to) range.lte = new Date(`${to}T23:59:59.999Z`)
    return range
  }
}
