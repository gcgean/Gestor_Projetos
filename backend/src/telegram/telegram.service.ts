import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name)

  async sendMessage(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (!token || !chatId) {
      this.logger.warn(`TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID não configurados — alerta não enviado: ${text}`)
      return
    }
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      })
      if (!response.ok) this.logger.error(`Falha ao enviar mensagem ao Telegram: ${response.status} ${await response.text()}`)
    } catch (err) {
      this.logger.error(`Erro ao enviar mensagem ao Telegram: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
