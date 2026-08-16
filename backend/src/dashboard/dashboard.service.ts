import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async summary(ownerId: string, from?: string, to?: string, projectId?: string) {
    const competence = this.competenceRange(from, to)
    const [projects, revenues, expenses] = await Promise.all([
      this.prisma.project.count({ where: { ownerId, ...(projectId ? { id: projectId } : {}) } }),
      this.prisma.revenue.aggregate({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), ...(competence ? { competence } : {}) }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), ...(competence ? { competence } : {}) }, _sum: { amount: true } }),
    ])
    const revenue = Number(revenues._sum.amount ?? 0)
    const expense = Number(expenses._sum.amount ?? 0)
    return { projects, revenue, expense, profit: revenue - expense, roi: expense ? ((revenue - expense) / expense) * 100 : 0 }
  }
  async cashflow(ownerId: string, from?: string, to?: string, projectId?: string) {
    const range = this.competenceRange(from, to)
    const [revenues, expenses, pendingRevenue, pendingExpense] = await Promise.all([
      this.prisma.revenue.findMany({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), receivedAt: { not: null, ...(range ?? {}) } }, select: { amount: true, receivedAt: true, category: true, project: { select: { name: true } } } }),
      this.prisma.expense.findMany({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), dueDate: { not: null, ...(range ?? {}) } }, select: { amount: true, dueDate: true, category: true, project: { select: { name: true } } } }),
      this.prisma.revenue.aggregate({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), receivedAt: null }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), dueDate: null }, _sum: { amount: true } }),
    ])

    const movements = [
      ...revenues.map(row => ({ type: 'in' as const, date: row.receivedAt as Date, amount: Number(row.amount), category: row.category, project: row.project.name })),
      ...expenses.map(row => ({ type: 'out' as const, date: row.dueDate as Date, amount: Number(row.amount), category: row.category, project: row.project.name })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    const monthly = new Map<string, { in: number; out: number }>()
    for (const movement of movements) {
      const key = `${movement.date.getUTCFullYear()}-${String(movement.date.getUTCMonth() + 1).padStart(2, '0')}`
      const bucket = monthly.get(key) ?? { in: 0, out: 0 }
      if (movement.type === 'in') bucket.in += movement.amount; else bucket.out += movement.amount
      monthly.set(key, bucket)
    }
    let running = 0
    const months = [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => {
      running += value.in - value.out
      return { month, in: value.in, out: value.out, net: value.in - value.out, balance: running }
    })

    const totalIn = revenues.reduce((sum, row) => sum + Number(row.amount), 0)
    const totalOut = expenses.reduce((sum, row) => sum + Number(row.amount), 0)

    return {
      totalIn, totalOut, balance: totalIn - totalOut,
      pendingIn: Number(pendingRevenue._sum.amount ?? 0),
      pendingOut: Number(pendingExpense._sum.amount ?? 0),
      months,
      movements: movements.map(movement => ({ ...movement, date: movement.date.toISOString() })),
    }
  }

  async monthly(ownerId: string, projectId?: string) {
    const from = new Date()
    from.setUTCDate(1)
    from.setUTCHours(0, 0, 0, 0)
    from.setUTCMonth(from.getUTCMonth() - 11)

    const [revenues, expenses] = await Promise.all([
      this.prisma.revenue.findMany({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), competence: { gte: from } }, select: { amount: true, competence: true } }),
      this.prisma.expense.findMany({ where: { project: { ownerId }, ...(projectId ? { projectId } : {}), competence: { gte: from } }, select: { amount: true, competence: true } }),
    ])

    const buckets = new Map<string, { revenue: number; expense: number }>()
    const cursor = new Date(from)
    for (let i = 0; i < 12; i++) {
      buckets.set(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`, { revenue: 0, expense: 0 })
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
    for (const row of revenues) {
      const key = `${row.competence.getUTCFullYear()}-${String(row.competence.getUTCMonth() + 1).padStart(2, '0')}`
      const bucket = buckets.get(key)
      if (bucket) bucket.revenue += Number(row.amount)
    }
    for (const row of expenses) {
      const key = `${row.competence.getUTCFullYear()}-${String(row.competence.getUTCMonth() + 1).padStart(2, '0')}`
      const bucket = buckets.get(key)
      if (bucket) bucket.expense += Number(row.amount)
    }

    const months = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, revenue: value.revenue, expense: value.expense, profit: value.revenue - value.expense }))
    return { months, trend: this.trendDirection(months.map(month => month.profit)) }
  }

  private trendDirection(values: number[]): 'up' | 'down' | 'flat' {
    if (values.length < 2) return 'flat'
    const xMean = (values.length - 1) / 2
    const yMean = values.reduce((sum, value) => sum + value, 0) / values.length
    let numerator = 0
    let denominator = 0
    values.forEach((value, index) => {
      numerator += (index - xMean) * (value - yMean)
      denominator += (index - xMean) ** 2
    })
    const slope = denominator ? numerator / denominator : 0
    const scale = Math.max(1, ...values.map(Math.abs))
    if (slope > scale * 0.02) return 'up'
    if (slope < -scale * 0.02) return 'down'
    return 'flat'
  }

  private competenceRange(from?: string, to?: string) {
    if (!from && !to) return null
    const range: { gte?: Date; lte?: Date } = {}
    if (from) range.gte = new Date(`${from}T00:00:00.000Z`)
    if (to) range.lte = new Date(`${to}T23:59:59.999Z`)
    return range
  }
}
