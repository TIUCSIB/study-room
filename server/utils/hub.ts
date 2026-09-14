/**
 * 聊天广播中心:维护在线客户端,向所有 SSE 连接推送消息。
 */

export interface ChatClient {
  nick: string
  send: (eventName: string, data: unknown) => void
}

const clients = new Set<ChatClient>()

export function addClient(client: ChatClient): void {
  clients.add(client)
  broadcastSystem(`${client.nick} 推门进来了`)
  broadcastPresence()
}

export function removeClient(client: ChatClient): void {
  if (!clients.delete(client)) return
  broadcastSystem(`${client.nick} 下线休息去了`)
  broadcastPresence()
}

export function broadcastChat(nick: string, text: string): void {
  broadcast('chat', { nick, text, ts: Date.now() })
}

export function broadcastSystem(text: string): void {
  broadcast('system', { text, ts: Date.now() })
}

export function broadcastPresence(): void {
  broadcast('presence', { count: clients.size, nicks: [...clients].map(c => c.nick) })
}

/** 供 REST 查询当前在线(开机引导页还没建立 SSE 时用) */
export function getPresence(): { count: number, nicks: string[] } {
  return { count: clients.size, nicks: [...clients].map(c => c.nick) }
}

function broadcast(eventName: string, data: unknown): void {
  for (const c of clients) {
    try {
      c.send(eventName, data)
    }
    catch { /* 单个客户端推送失败忽略,断线由 SSE 关闭逻辑清理 */ }
  }
}
