import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name)

  async sendMessage(text: string, credentials?: { botToken?: string | null; chatId?: string | null }): Promise<{ ok: boolean; error?: string }> {
    const token = credentials?.botToken || process.env.TELEGRAM_BOT_TOKEN
    const chatId = credentials?.chatId || process.env.TELEGRAM_CHAT_ID
    if (!token || !chatId) {
      const message = 'Bot do Telegram não configurado.'
      this.logger.warn(`${message} Alerta não enviado: ${text}`)
      return { ok: false, error: message }
    }
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      })
      if (!response.ok) {
        const body = await response.text()
        this.logger.error(`Falha ao enviar mensagem ao Telegram: ${response.status} ${body}`)
        return { ok: false, error: `Telegram respondeu ${response.status}: ${body}` }
      }
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`Erro ao enviar mensagem ao Telegram: ${message}`)
      return { ok: false, error: message }
    }
  }
}
