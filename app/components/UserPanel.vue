<script setup lang="ts">
/**
 * 用户面板(控件坞「我」):身份 + 我的专注记录 + 房间里的人。
 *
 * 为什么要有这一格:昵称此前只在首次弹窗写一次,之后用户看不见「我是谁」,
 * 也看不见自己的积累 —— 而陪伴感的前提是**看得见自己也在房间里**。
 * 改名入口与设置页重复是故意的:设置页是成组的低频配置,这里是「点我即改」。
 *
 * 数据:身份来自 localStorage(经 app.vue);记录来自 `GET /api/pomodoros?nick=`;
 * 房间里的人来自 SSE 的 presence 事件,与聊天面板同一个数据源。
 */
import type { PomodoroStats } from '@/types'

const props = defineProps<{
  nick: string | null
  online: number
  nickList: string[]
  connected: boolean
}>()

const emit = defineEmits<{ nick: [value: string] }>()

const stats = ref<PomodoroStats | null>(null)
const editing = ref(false)
const draft = ref('')

async function load() {
  if (!props.nick) {
    stats.value = null
    return
  }
  try {
    stats.value = await $fetch<PomodoroStats>('/api/pomodoros', { query: { nick: props.nick } })
  }
  catch {
    stats.value = null
  }
}

// 昵称一变(含改名后重连)就重新取一次:记录是按昵称聚合的
watch(() => props.nick, load, { immediate: true })

function startEdit() {
  draft.value = props.nick ?? ''
  editing.value = true
}

function save() {
  const value = draft.value.trim().slice(0, 12)
  editing.value = false
  if (value && value !== props.nick) emit('nick', value)
}

/** 自己排最前,其余保持服务端顺序 */
const people = computed(() => {
  const others = props.nickList.filter(n => n !== props.nick)
  return props.nick ? [props.nick, ...others] : others
})
</script>

<template>
  <section class="glass flex w-[320px] flex-col px-3.5 py-3" aria-label="我的信息">
    <header class="mb-2.5 flex items-center gap-2">
      <span class="flex size-8 shrink-0 items-center justify-center border border-line text-accent">
        <Icon name="pixelarticons:user" class="icon-pixel" />
      </span>
      <span class="glow text-cream">我</span>
      <span class="ml-auto text-[15px]" :class="connected ? 'text-info' : 'text-dim'">
        {{ connected ? '已连接' : '连接中…' }}
      </span>
    </header>

    <div class="mb-3">
      <div class="text-[15px] text-dim">昵称 · 聊天与专注记录的身份</div>
      <form v-if="editing" class="mt-1 flex gap-2" @submit.prevent="save">
        <input
          v-model="draft"
          type="text"
          maxlength="12"
          aria-label="新昵称"
          class="min-w-0 flex-1 border border-line bg-black/40 px-2.5 py-1.5 text-[17px] text-cream outline-none placeholder:text-dim/70 focus:border-accent/60"
        >
        <button type="submit" class="glow shrink-0 px-2 text-accent hover:brightness-125">好</button>
      </form>
      <div v-else class="mt-1 flex items-center gap-2">
        <span class="glow min-w-0 flex-1 truncate text-[19px] text-accent">{{ nick ?? '还没起名字' }}</span>
        <button class="shrink-0 text-[15px] text-dim hover:text-cream" @click="startEdit">改名</button>
      </div>
    </div>

    <div class="mb-3 border-t border-line pt-2.5">
      <div class="text-[15px] text-dim">专注记录</div>
      <div v-if="stats" class="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[17px]">
        <div class="flex justify-between">
          <span class="text-dim">今日</span>
          <span class="font-num text-cream">{{ stats.todayMinutes }}<span class="text-dim"> 分</span></span>
        </div>
        <div class="flex justify-between">
          <span class="text-dim">番茄</span>
          <span class="font-num text-cream">{{ stats.todayCount }}<span class="text-dim"> 个</span></span>
        </div>
        <div class="flex justify-between">
          <span class="text-dim">连续</span>
          <span class="font-num text-cream">{{ stats.streak }}<span class="text-dim"> 天</span></span>
        </div>
        <div class="flex justify-between">
          <span class="text-dim">累计</span>
          <span class="font-num text-cream">{{ stats.totalMinutes }}<span class="text-dim"> 分</span></span>
        </div>
      </div>
      <p v-else class="mt-1 text-[15px] text-dim">今天还没有记录,开一个番茄吧</p>
      <p v-if="stats" class="mt-1.5 text-[15px] text-dim">
        全房今天已记 {{ stats.roomTodayCount }} 个番茄
      </p>
    </div>

    <div class="border-t border-line pt-2.5">
      <div class="flex items-center gap-1.5 text-[15px] text-dim">
        <Icon name="pixelarticons:users" class="icon-pixel" />
        <span>房间里 · {{ online }} 人</span>
      </div>
      <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[16px]">
        <span v-for="n in people" :key="n" :class="n === nick ? 'glow text-accent' : 'glow-info text-info'">
          {{ n }}
        </span>
        <span v-if="people.length === 0" class="text-dim">连上后显示</span>
      </div>
    </div>
  </section>
</template>
