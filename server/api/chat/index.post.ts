/**
 * POST /api/chat { nick, text } → 广播一条聊天消息
 */
import { broadcastChat } from '../../utils/hub'
import { sanitizeText } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ nick?: unknown, text?: unknown }>(event)
  const nick = sanitizeText(body.nick, 12)
  const text = sanitizeText(body.text, 200)
  if (!nick || !text) throw createError({ statusCode: 400, statusMessage: 'nick and text required' })
  broadcastChat(nick, text)
  return { ok: true }
})
