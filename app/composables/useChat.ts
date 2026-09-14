/**
 * 实时聊天:下行 = SSE(GET /api/chat?nick=),上行 = POST /api/chat。
 * EventSource 断线浏览器会自动重连,无需手动处理。
 */
import type { Ref } from 'vue'

export interface ChatMessage {
  id: number
  kind: 'chat' | 'system'
  nick: string
  text: string
  ts: number
  mine: boolean
}

let seq = 0

export function useChat(nick: Ref<string | null>) {
  const messages = ref<ChatMessage[]>([])
  const online = ref(0)
  const nickList = ref<string[]>([])
  const connected = ref(false)

  let source: EventSource | null = null

  function push(kind: ChatMessage['kind'], nickOf: string, text: string, ts: number, mine = false) {
    messages.value.push({ id: ++seq, kind, nick: nickOf, text, ts, mine })
    // 消息最多保留 200 条
    if (messages.value.length > 200) messages.value.splice(0, messages.value.length - 200)
  }

  function connect() {
    if (!nick.value || !import.meta.client || source) return
    source = new EventSource(`/api/chat?nick=${encodeURIComponent(nick.value)}`)

    source.addEventListener('chat', (e) => {
      const d = JSON.parse((e as MessageEvent).data) as { nick: string, text: string, ts: number }
      push('chat', d.nick, d.text, d.ts, d.nick === nick.value)
    })
    source.addEventListener('system', (e) => {
      const d = JSON.parse((e as MessageEvent).data) as { text: string, ts: number }
      push('system', '', d.text, d.ts)
    })
    source.addEventListener('presence', (e) => {
      const d = JSON.parse((e as MessageEvent).data) as { count: number, nicks: string[] }
      online.value = d.count
      nickList.value = d.nicks
    })
    source.onopen = () => { connected.value = true }
    source.onerror = () => { connected.value = false }
  }

  function disconnect() {
    source?.close()
    source = null
    connected.value = false
  }

  async function send(text: string) {
    const trimmed = text.trim().slice(0, 200)
    if (!trimmed || !nick.value) return
    await $fetch('/api/chat', { method: 'POST', body: { nick: nick.value, text: trimmed } })
  }

  watch(nick, (value) => {
    if (value) connect()
    else disconnect()
  })

  if (import.meta.client) {
    onUnmounted(disconnect)
  }

  return { messages, online, nickList, connected, send }
}
