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

  async getLatestChatId(botToken: string): Promise<{ ok: boolean; chatId?: string; label?: string; error?: string }> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=1&offset=-1`)
      const data: any = await response.json().catch(() => null)
      if (!response.ok || !data?.ok) return { ok: false, error: data?.description || `Telegram respondeu ${response.status}` }
      const updates: any[] = data.result ?? []
      if (!updates.length) return { ok: false, error: 'Nenhuma mensagem encontrada. Mande uma mensagem para o bot no Telegram e tente de novo.' }
      const chat = updates[updates.length - 1]?.message?.chat ?? updates[updates.length - 1]?.my_chat_member?.chat
      if (!chat) return { ok: false, error: 'Não foi possível identificar o chat na última atualização.' }
      const label = chat.username ? `@${chat.username}` : (chat.title || chat.first_name || String(chat.id))
      return { ok: true, chatId: String(chat.id), label }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }
}
