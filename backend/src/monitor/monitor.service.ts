import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TelegramService } from '../telegram/telegram.service'

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const REQUEST_TIMEOUT_MS = 10000

type MonitoredProject = { id: string; name: string; url: string | null; isOnline: boolean | null }

@Injectable()
export class MonitorService implements OnModuleInit {
  private readonly logger = new Logger(MonitorService.name)

  constructor(private readonly prisma: PrismaService, private readonly telegram: TelegramService) {}

  onModuleInit() {
    void this.checkAll()
    setInterval(() => void this.checkAll(), CHECK_INTERVAL_MS)
  }

  private async checkAll() {
    const projects = await this.prisma.project.findMany({ where: { url: { not: null } }, select: { id: true, name: true, url: true, isOnline: true } })
    for (const project of projects) await this.checkProject(project)
  }

  private async checkProject(project: MonitoredProject) {
    if (!project.url) return
    const wasOnline = project.isOnline
    const online = await this.probe(project.url)

    await this.prisma.project.update({ where: { id: project.id }, data: { isOnline: online, lastCheckedAt: new Date() } })

    if (wasOnline !== false && !online) {
      await this.telegram.sendMessage(`⚠️ O projeto "${project.name}" parece estar fora do ar.\n${project.url}`)
    } else if (wasOnline === false && online) {
      await this.telegram.sendMessage(`✅ O projeto "${project.name}" voltou ao ar.\n${project.url}`)
    }
  }

  private async probe(url: string): Promise<boolean> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'GestorProjetosMonitor/1.0' } })
      return response.status < 500
    } catch (err) {
      this.logger.debug(`Falha ao checar ${url}: ${err instanceof Error ? err.message : String(err)}`)
      return false
    } finally {
      clearTimeout(timeout)
    }
  }
}
