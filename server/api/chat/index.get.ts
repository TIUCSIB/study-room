/**
 * GET /api/chat?nick=xxx → SSE 事件流:chat / system / presence
 */
import { addClient, broadcastPresence, removeClient, type ChatClient } from '../../utils/hub'
import { sanitizeText } from '../../utils/store'

export default defineEventHandler((event) => {
  const nick = sanitizeText(getQuery(event).nick, 12) || '路过的同学'

  const stream = createEventStream(event)
  const client: ChatClient = {
    nick,
    send: (eventName, data) => void stream.push({ event: eventName, data: JSON.stringify(data) }),
  }

  addClient(client)
  client.send('system', { text: `欢迎来到自习室,${nick}!保持专注哦`, ts: Date.now() })

  // 连接断开时清理(EventStream 的 close 事件在各运行时都可靠)
  event.node.req.on('close', () => removeClient(client))
  return stream.send()
})
