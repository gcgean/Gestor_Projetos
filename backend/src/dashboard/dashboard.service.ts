import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async summary(ownerId: string) {
    const [projects, revenues, expenses] = await Promise.all([
      this.prisma.project.count({ where: { ownerId } }),
      this.prisma.revenue.aggregate({ where: { project: { ownerId } }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { project: { ownerId } }, _sum: { amount: true } }),
    ])
    const revenue = Number(revenues._sum.amount ?? 0)
    const expense = Number(expenses._sum.amount ?? 0)
    return { projects, revenue, expense, profit: revenue - expense, roi: expense ? ((revenue - expense) / expense) * 100 : 0 }
  }
}
