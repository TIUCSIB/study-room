<script setup lang="ts">
/**
 * 设置弹窗(docs/design.md §4.9)。四组:身份 / 专注 / 关于与快捷键 / 本地数据。
 *
 * 为什么是模态而不是独立路由:整站是单页沉浸架构,切路由会卸载重建 MusicPlayer,
 * 正在放的音乐会被打断,SSE 也会断连重连。设置是低频、成组的内容,模态更合适。
 */
import { POMODORO_MINUTES, clearLocalData, usePomodoroMinutes } from '@/composables/useSettings'

const props = defineProps<{ nick: string | null }>()
const emit = defineEmits<{ close: [], nick: [value: string] }>()

const minutes = usePomodoroMinutes()

const nickDraft = ref(props.nick ?? '')
const justSaved = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | null = null

const canSave = computed(() => {
  const t = nickDraft.value.trim()
  return t.length > 0 && t !== props.nick
})

function saveNick() {
  if (!canSave.value) return
  emit('nick', nickDraft.value.trim().slice(0, 12))
  justSaved.value = true
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => { justSaved.value = false }, 2500)
}

/** 清空本地数据是不可逆的,所以要两步确认;4 秒内没跟进就自动放弃 */
const confirmingClear = ref(false)
let clearTimer: ReturnType<typeof setTimeout> | null = null

function clearData() {
  if (!confirmingClear.value) {
    confirmingClear.value = true
    if (clearTimer) clearTimeout(clearTimer)
    clearTimer = setTimeout(() => { confirmingClear.value = false }, 4000)
    return
  }
  clearLocalData()
  location.reload()
}

onBeforeUnmount(() => {
  if (savedTimer) clearTimeout(savedTimer)
  if (clearTimer) clearTimeout(clearTimer)
})

const SHORTCUTS = [
  { keys: 'Space', desc: '播放 / 暂停' },
  { keys: '← →', desc: '上一首 / 下一首' },
]
</script>

<template>
  <ModalShell label="设置" @close="emit('close')">
    <div class="p-6 text-[17px]">
      <h2 class="glow mb-4 text-[22px] text-cream">设置</h2>

      <section class="mb-5">
        <h3 class="mb-1.5 text-[15px] text-dim">昵称 · 聊天与专注记录的身份</h3>
        <form class="flex gap-2" @submit.prevent="saveNick">
          <input
            v-model="nickDraft"
            type="text"
            maxlength="12"
            aria-label="昵称"
            class="min-w-0 flex-1 border border-line bg-black/40 px-2.5 py-1.5 text-[17px] text-cream outline-none placeholder:text-dim/70 focus:border-accent/60"
          >
          <button
            type="submit"
            :disabled="!canSave"
            class="glow shrink-0 px-2 text-accent hover:brightness-125 disabled:opacity-40"
          >
            改
          </button>
        </form>
        <p class="mt-1.5 text-[15px] text-dim">
          <span v-if="justSaved" class="glow text-accent">已改名,聊天已用新名字重连</span>
          <span v-else>不超过 12 字。改名后会以新身份重新连接聊天。</span>
        </p>
      </section>

      <section class="mb-5">
        <h3 class="mb-1.5 text-[15px] text-dim">番茄钟默认时长</h3>
        <div class="flex gap-2">
          <button
            v-for="m in POMODORO_MINUTES"
            :key="m"
            class="border px-3 py-1 font-num text-[17px] transition-colors"
            :class="minutes === m ? 'glow border-accent/60 text-accent' : 'border-line text-cream/70 hover:text-cream'"
            :aria-pressed="minutes === m"
            @click="minutes = m"
          >
            {{ m }}
          </button>
        </div>
        <p class="mt-1.5 text-[15px] text-dim">下次打开番茄钟时使用;面板里仍可临时切换。</p>
      </section>

      <section class="mb-5">
        <h3 class="mb-1.5 text-[15px] text-dim">关于</h3>
        <p class="text-cream/90">一间线上 lofi 自习室:放着歌,和房间里的人一起学到底。</p>
        <p class="mt-0.5 text-cream/90">灯还亮着,休息一下也没关系。</p>
      </section>

      <section class="mb-5">
        <h3 class="mb-1.5 text-[15px] text-dim">快捷键</h3>
        <div class="flex flex-col gap-0.5 text-[15px]">
          <div v-for="s in SHORTCUTS" :key="s.keys" class="flex justify-between">
            <span class="font-num text-cream/85">{{ s.keys }}</span>
            <span class="text-dim">{{ s.desc }}</span>
          </div>
        </div>
      </section>

      <section class="mb-5 border-t border-line pt-4">
        <h3 class="mb-1.5 text-[15px] text-dim">本地数据</h3>
        <button
          class="text-[17px] transition-colors"
          :class="confirmingClear ? 'glow text-danger' : 'text-dim hover:text-danger'"
          @click="clearData"
        >
          {{ confirmingClear ? '再点一次确认清空(昵称 / 待办 / 设置)' : '清空本地数据' }}
        </button>
        <p class="mt-1.5 text-[15px] text-dim">音乐与场景素材自备。数据只存在这台机器上,清空后无法恢复。</p>
      </section>

      <button class="glow w-full py-2 text-[19px] text-accent hover:brightness-125" @click="emit('close')">
        [ 关闭 ]
      </button>
    </div>
  </ModalShell>
</template>
