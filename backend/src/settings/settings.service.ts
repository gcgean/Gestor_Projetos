import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TelegramService } from '../telegram/telegram.service'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService, private readonly telegram: TelegramService) {}

  async getTelegram(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { telegramBotToken: true, telegramChatId: true } })
    return { hasToken: !!user?.telegramBotToken, chatId: user?.telegramChatId ?? '' }
  }

  async updateTelegram(userId: string, data: { botToken?: string | null; chatId?: string | null }) {
    const update: { telegramBotToken?: string | null; telegramChatId?: string | null } = {}
    if ('botToken' in data) update.telegramBotToken = data.botToken || null
    if ('chatId' in data) update.telegramChatId = data.chatId || null
    await this.prisma.user.update({ where: { id: userId }, data: update })
    return this.getTelegram(userId)
  }

  async testTelegram(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { telegramBotToken: true, telegramChatId: true } })
    if (!user?.telegramBotToken || !user.telegramChatId) return { ok: false, error: 'Configure o token do bot e o chat ID antes de testar.' }
    return this.telegram.sendMessage('✅ Conexão com o Telegram configurada com sucesso no Gestor_Projetos.', { botToken: user.telegramBotToken, chatId: user.telegramChatId })
  }

  async detectChatId(userId: string, overrideToken?: string) {
    const token = overrideToken || (await this.prisma.user.findUnique({ where: { id: userId }, select: { telegramBotToken: true } }))?.telegramBotToken
    if (!token) return { ok: false, error: 'Informe o token do bot antes de detectar o chat ID.' }
    return this.telegram.getLatestChatId(token)
  }
}
