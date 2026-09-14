<script setup lang="ts">
/**
 * 聊天面板:消息流 + 在线同学 + 输入框(可折叠)。终端风。
 */
import type { ChatMessage } from '@/composables/useChat'

const props = defineProps<{
  messages: ChatMessage[]
  online: number
  nickList: string[]
  connected: boolean
}>()

const emit = defineEmits<{ send: [text: string] }>()

const draft = ref('')
const listEl = ref<HTMLElement | null>(null)
const collapsed = ref(false)

function submit() {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text)
  draft.value = ''
}

// 新消息自动滚到底
watch(() => props.messages.length, async () => {
  await nextTick()
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
})

function timeOf(ts: number): string {
  const d = new Date(ts)
  return `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
}
</script>

<template>
  <section class="glass flex w-[320px] flex-col overflow-hidden">
    <header class="flex cursor-pointer select-none items-center gap-2 px-3.5 py-2.5" @click="collapsed = !collapsed">
      <span
        class="size-2"
        :class="connected ? 'bg-emerald-400 shadow-[0_0_6px_rgb(123_201_143/0.8)]' : 'bg-[#6B6357]'"
      />
      <span class="glow text-cream">自习室聊天</span>
      <span class="ml-auto text-dim">{{ online }} 人在线</span>
      <span class="text-dim">{{ collapsed ? '▲' : '▼' }}</span>
    </header>

    <template v-if="!collapsed">
      <div class="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-line px-3.5 pb-2 text-[16px]">
        <span v-for="n in nickList" :key="n" class="glow-info text-info">{{ n }}</span>
      </div>

      <div ref="listEl" class="flex h-[300px] flex-col gap-1.5 overflow-y-auto px-3.5 py-2 text-[17px] leading-snug">
        <div v-for="m in messages" :key="m.id">
          <template v-if="m.kind === 'system'">
            <span class="text-[15px] italic text-dim">{{ m.text }}</span>
          </template>
          <template v-else>
            <span class="mr-1.5" :class="m.mine ? 'glow text-accent' : 'glow-info text-info'">{{ m.nick }}:</span>
            <span class="text-cream/95">{{ m.text }}</span>
            <span class="ml-1.5 text-[13px] text-dim/60">{{ timeOf(m.ts) }}</span>
          </template>
        </div>
        <div v-if="messages.length === 0" class="mt-10 text-center text-dim">
          还没有人说话,打个招呼吧<span class="animate-blink text-accent">▮</span>
        </div>
      </div>

      <form class="flex gap-2 border-t border-line px-3 py-2.5" @submit.prevent="submit">
        <input
          v-model="draft"
          type="text"
          maxlength="200"
          placeholder="说点什么…(Enter 发送)"
          aria-label="聊天输入"
          class="min-w-0 flex-1 border border-line bg-black/40 px-2.5 py-1.5 text-[17px] text-cream outline-none placeholder:text-dim/70 focus:border-accent/60"
        >
        <button type="submit" class="glow px-1 text-accent" aria-label="发送">➤</button>
      </form>
    </template>
  </section>
</template>
