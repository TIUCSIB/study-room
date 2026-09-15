<script setup lang="ts">
/**
 * Lofi 自习室:开机引导 → 全屏场景 + 音乐 + 实时聊天 + 番茄钟。
 * 身份 = 昵称(localStorage),无登录。风格:像素电台 CRT 终端(lofi.cafe 式)。
 */
import type { PanelKey } from '@/types'
import { LS_KEYS } from '@/composables/useSettings'

useHead({ title: 'Lofi 自习室 · 一起学到底' })

const started = ref(false)
const nick = ref<string | null>(null)
const nickReady = ref(false)
const chat = useChat(nick)
const toast = ref('')
const bootCount = ref<number | null>(null)
const line1Done = ref(false)

/** 引导期用 REST 探测的在线数,SSE 连上后切实时数据 —— 同一个数字的两种来源 */
const listeningCount = computed(() =>
  chat.connected.value ? chat.online.value : bootCount.value,
)

/** 右上角本地时间 HH:MM(冒号闪烁)与日期 MM/DD */
const clock = ref('')
const dateText = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function tickClock() {
  const d = new Date()
  clock.value = `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
  dateText.value = `${`${d.getMonth() + 1}`.padStart(2, '0')}/${`${d.getDate()}`.padStart(2, '0')} ${WEEKDAYS[d.getDay()]!}`
}

const clockParts = computed(() => clock.value.split(':'))

onMounted(async () => {
  nick.value = localStorage.getItem(LS_KEYS.nick)
  nickReady.value = true
  tickClock()
  clockTimer = setInterval(tickClock, 1000)
  try {
    bootCount.value = (await $fetch<{ count: number }>('/api/presence')).count
  }
  catch { bootCount.value = null }
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})

/** 首次进页与设置页改名都走这里。改昵称后 useChat 会以新身份重连 SSE */
function confirmNick(value: string) {
  nick.value = value
  localStorage.setItem(LS_KEYS.nick, value)
}

/** 右下角控件坞:同一时刻最多展开一个面板,再点一次收起 */
const activePanel = ref<PanelKey | null>(null)
const settingsOpen = ref(false)

function togglePanel(key: PanelKey) {
  activePanel.value = activePanel.value === key ? null : key
}

/** 面板是模态后,坞按钮被遮罩挡住点不到,收起只能靠 Esc / 点遮罩 / 面板里的「关闭」 */
function closePanel() {
  activePanel.value = null
}

/**
 * 未读数。聊天是否「有人说话」不该只有点开才知道 —— 那是 §1 说的陪伴感。
 * 只算别人的聊天消息,系统消息与自己的发言不计。
 */
const unread = ref(0)

watch(() => chat.messages.value.length, () => {
  const last = chat.messages.value[chat.messages.value.length - 1]
  if (last && activePanel.value !== 'chat' && last.kind === 'chat' && !last.mine) unread.value += 1
})

watch(activePanel, (v) => {
  if (v === 'chat') unread.value = 0
})

let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(text: string) {
  toast.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 4000)
}
</script>

<template>
  <div class="crt-boot relative h-screen">
    <VideoBackdrop />

    <!-- 左上角在线人数:引导页与主界面共用同一个元素,常驻不重建。位置由组件内部 padding 控制 -->
    <ListeningNow class="absolute left-0 top-0 z-30" :count="listeningCount" @typed="line1Done = true" />

    <!-- 开机引导:任意键/点击进入 -->
    <BootGate v-if="!started" :show-line2="line1Done" @start="started = true" />

    <!-- 主界面 -->
    <div v-else class="relative h-full">
      <!-- 右上角时钟:上/右内边距与左侧 ListeningNow 的 p-5 对齐,否则两角错位 -->
      <header class="relative z-2 flex items-start justify-end px-5 pt-5">
        <div class="flex flex-col items-end">
          <div class="glow font-num text-[30px] leading-none text-cream">
            {{ clockParts[0] }}<span class="animate-colon">:</span>{{ clockParts[1] }}
          </div>
          <div class="mt-1 text-[16px] text-dim">{{ dateText }}</div>
        </div>
      </header>

      <MusicPlayer class="absolute bottom-5 left-5 z-2" />

      <!-- 右下角只剩控件坞本身:面板已改为居中模态(见文件末尾),不再贴着坞向上展开。
           四角内边距统一 20px,见 design.md §2 -->
      <ControlDock class="absolute right-5 bottom-5 z-2" :active="activePanel" :unread="unread"
        @toggle="togglePanel" @settings="settingsOpen = true" />

      <!-- z 必须高于模态遮罩(z-50):番茄钟入账的提示要在模态之上才看得见 -->
      <Transition name="fade">
        <div v-if="toast" class="glass glow fixed top-[60px] left-1/2 z-[60] -translate-x-1/2 px-4 py-2 text-accent">
          {{ toast }}
        </div>
      </Transition>
    </div>

    <!-- 面板统一以居中模态呈现(2026-09-15 定)。外壳走 ModalShell,面板自身只出内容 -->
    <ModalShell v-if="nick && activePanel === 'pomodoro'" label="番茄钟" @close="closePanel">
      <PomodoroPanel :nick="nick" @toast="showToast" @close="closePanel" />
    </ModalShell>

    <ModalShell v-if="activePanel === 'todo'" label="今日待办" @close="closePanel">
      <TodoPanel @close="closePanel" />
    </ModalShell>

    <ModalShell v-if="nick && activePanel === 'chat'" label="自习室聊天" @close="closePanel">
      <ChatPanel :messages="chat.messages.value" :online="chat.online.value"
        :nick-list="chat.nickList.value" :connected="chat.connected.value" @send="chat.send"
        @close="closePanel" />
    </ModalShell>

    <ModalShell v-if="activePanel === 'user'" label="我的信息" @close="closePanel">
      <UserPanel :nick="nick" :online="chat.online.value" :nick-list="chat.nickList.value"
        :connected="chat.connected.value" @nick="confirmNick" @close="closePanel" />
    </ModalShell>

    <SettingsModal v-if="settingsOpen" :nick="nick" @close="settingsOpen = false" @nick="confirmNick" />
    <NicknameModal v-if="nickReady && started && !nick" @confirm="confirmNick" />
  </div>
</template>
