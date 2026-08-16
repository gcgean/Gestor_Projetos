import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

type FinanceInput = { projectId: string; category: string; description?: string; amount: number; competence: string; receivedAt?: string; dueDate?: string }

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async revenues(ownerId: string, from?: string, to?: string) {
    const competence = this.competenceRange(from, to)
    const rows = await this.prisma.revenue.findMany({ where: { project: { ownerId }, ...(competence ? { competence } : {}) }, include: { project: { select: { id: true, name: true } } }, orderBy: { competence: 'desc' } })
    return rows.map(row => ({ ...row, amount: Number(row.amount) }))
  }

  async expenses(ownerId: string, from?: string, to?: string) {
    const competence = this.competenceRange(from, to)
    const rows = await this.prisma.expense.findMany({ where: { project: { ownerId }, ...(competence ? { competence } : {}) }, include: { project: { select: { id: true, name: true } } }, orderBy: { competence: 'desc' } })
    return rows.map(row => ({ ...row, amount: Number(row.amount) }))
  }

  async createRevenue(ownerId: string, data: FinanceInput) {
    await this.ensureProject(ownerId, data.projectId)
    const row = await this.prisma.revenue.create({ data: { projectId: data.projectId, category: data.category, description: data.description, amount: data.amount, competence: this.date(data.competence), receivedAt: data.receivedAt ? this.date(data.receivedAt) : undefined }, include: { project: { select: { id: true, name: true } } } })
    return { ...row, amount: Number(row.amount) }
  }

  async createExpense(ownerId: string, data: FinanceInput) {
    await this.ensureProject(ownerId, data.projectId)
    const row = await this.prisma.expense.create({ data: { projectId: data.projectId, category: data.category, description: data.description, amount: data.amount, competence: this.date(data.competence), dueDate: data.dueDate ? this.date(data.dueDate) : undefined }, include: { project: { select: { id: true, name: true } } } })
    return { ...row, amount: Number(row.amount) }
  }

  async deleteRevenue(ownerId: string, id: string) {
    const result = await this.prisma.revenue.deleteMany({ where: { id, project: { ownerId } } })
    if (!result.count) throw new NotFoundException('Receita não encontrada')
    return { deleted: true }
  }

  async deleteExpense(ownerId: string, id: string) {
    const result = await this.prisma.expense.deleteMany({ where: { id, project: { ownerId } } })
    if (!result.count) throw new NotFoundException('Despesa não encontrada')
    return { deleted: true }
  }
  async updateRevenue(ownerId: string, id: string, data: FinanceInput) {
    const result = await this.prisma.revenue.updateMany({ where: { id, project: { ownerId } }, data: { projectId: data.projectId, category: data.category, description: data.description, amount: data.amount, competence: this.date(data.competence), receivedAt: data.receivedAt ? this.date(data.receivedAt) : null } })
    if (!result.count) throw new NotFoundException('Receita não encontrada')
    return { updated: true }
  }
  async updateExpense(ownerId: string, id: string, data: FinanceInput) {
    const result = await this.prisma.expense.updateMany({ where: { id, project: { ownerId } }, data: { projectId: data.projectId, category: data.category, description: data.description, amount: data.amount, competence: this.date(data.competence), dueDate: data.dueDate ? this.date(data.dueDate) : null } })
    if (!result.count) throw new NotFoundException('Despesa não encontrada')
    return { updated: true }
  }

  private async ensureProject(ownerId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, ownerId }, select: { id: true } })
    if (!project) throw new NotFoundException('Projeto não encontrado')
  }

  private date(value: string) {
    const date = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Data inválida')
    return date
  }

  private competenceRange(from?: string, to?: string) {
    if (!from && !to) return null
    const range: { gte?: Date; lte?: Date } = {}
    if (from) range.gte = new Date(`${from}T00:00:00.000Z`)
    if (to) range.lte = new Date(`${to}T23:59:59.999Z`)
    return range
  }
}
