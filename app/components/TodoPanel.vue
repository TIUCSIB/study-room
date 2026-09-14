<script setup lang="ts">
/**
 * Todo 面板:本地待办(localStorage,键登记在 useSettings),不做服务端同步。
 * 复用终端风:勾选用 ▣/▢ 字符块。
 */
import { LS_KEYS } from '@/composables/useSettings'

interface Todo {
  id: number
  text: string
  done: boolean
}

const KEY = LS_KEYS.todos

const todos = ref<Todo[]>([])
const draft = ref('')

const undoneCount = computed(() => todos.value.filter(t => !t.done).length)

function add() {
  const text = draft.value.trim().slice(0, 60)
  if (!text) return
  todos.value.unshift({ id: Date.now(), text, done: false })
  draft.value = ''
}

function remove(id: number) {
  todos.value = todos.value.filter(t => t.id !== id)
}

onMounted(() => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (Array.isArray(raw)) todos.value = raw
  }
  catch { /* 坏数据当空列表 */ }
})

watch(todos, v => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })
</script>

<template>
  <section class="glass flex w-[320px] flex-col px-3.5 py-3" aria-label="待办清单">
    <header class="mb-2 flex items-center justify-between">
      <span class="glow text-cream">今日待办</span>
      <span class="text-[15px] text-dim">{{ undoneCount ? `剩 ${undoneCount} 件` : '都清空啦' }}</span>
    </header>

    <form class="mb-2 flex gap-2" @submit.prevent="add">
      <input
        v-model="draft"
        type="text"
        maxlength="60"
        placeholder="要做什么…(Enter 添加)"
        aria-label="待办内容"
        class="min-w-0 flex-1 border border-line bg-black/40 px-2.5 py-1.5 text-[17px] text-cream outline-none placeholder:text-dim/70 focus:border-accent/60"
      >
      <button type="submit" class="flex shrink-0 items-center px-1 text-accent" aria-label="添加">
        <Icon name="pixelarticons:arrow-right" class="icon-pixel glow-icon" />
      </button>
    </form>

    <ul class="flex max-h-[220px] flex-col gap-1 overflow-y-auto text-[17px] leading-snug">
      <li v-for="t in todos" :key="t.id" class="group flex items-start gap-2">
        <button
          class="mt-[2px] shrink-0"
          :class="t.done ? 'text-accent' : 'text-dim hover:text-cream'"
          :aria-label="t.done ? '标记未完成' : '标记完成'"
          @click="t.done = !t.done"
        >{{ t.done ? '▣' : '▢' }}</button>
        <span class="min-w-0 flex-1 break-words" :class="t.done ? 'text-dim line-through' : 'text-cream/95'">{{ t.text }}</span>
        <button
          class="flex shrink-0 items-center text-dim/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
          aria-label="删除"
          @click="remove(t.id)"
        >
          <Icon name="pixelarticons:trash" class="icon-pixel" />
        </button>
      </li>
      <li v-if="todos.length === 0" class="mt-6 text-center text-dim">
        空空的,写一件小事<span class="animate-blink text-accent">▮</span>
      </li>
    </ul>
  </section>
</template>
