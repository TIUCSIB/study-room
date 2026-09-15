<script setup lang="ts">
/**
 * 番茄钟面板(lofi.cafe 式,docs/design.md §4.3):
 * 大号像素倒计时;空闲点数字在预设间轮换;运行中 +5:00 随时加时。
 * Pause/Resume/End;完成或结束满 1 分钟 → POST /api/pomodoros 入账。
 */
import { POMODORO_MINUTES, usePomodoroMinutes } from '@/composables/useSettings'

const props = defineProps<{ nick: string }>()
const emit = defineEmits<{ toast: [text: string], close: [] }>()

const PRESETS = POMODORO_MINUTES
const MAX_SEC = 600 * 60

function indexOfPreset(minutes: number) {
  const i = (PRESETS as readonly number[]).indexOf(minutes)
  return i >= 0 ? i : 0
}

/** 默认时长来自设置页;面板里点数字只是**临时**切换,不写回设置 */
const defaultMinutes = usePomodoroMinutes()
const presetIdx = ref(indexOfPreset(defaultMinutes.value))
const leftSec = ref(PRESETS[presetIdx.value]! * 60)
const elapsedSec = ref(0)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const display = computed(() => {
  const m = Math.floor(leftSec.value / 60)
  const s = leftSec.value % 60
  return `${`${m}`.padStart(2, '0')}:${`${s}`.padStart(2, '0')}`
})

function stopTimer() {
  if (timer) clearInterval(timer)
  timer = null
  running.value = false
}

function reset() {
  stopTimer()
  leftSec.value = PRESETS[presetIdx.value]! * 60
  elapsedSec.value = 0
}

function cyclePreset() {
  if (running.value) return
  presetIdx.value = (presetIdx.value + 1) % PRESETS.length
  reset()
}

/** 设置页改了默认时长:空闲时立即跟上;正在计时就不打断这一轮 */
watch(defaultMinutes, (m) => {
  if (running.value) return
  presetIdx.value = indexOfPreset(m)
  reset()
})

function addFive() {
  leftSec.value = Math.min(leftSec.value + 300, MAX_SEC)
}

/** 入账:满 1 分钟才上报(server 侧同样校验) */
async function record(reason: 'done' | 'end') {
  const minutes = Math.round(elapsedSec.value / 60)
  if (minutes < 1) {
    emit('toast', reason === 'end' ? '还差一点点,这次就不记录啦' : '')
    return
  }
  try {
    await $fetch('/api/pomodoros', { method: 'POST', body: { nick: props.nick, minutes } })
    emit('toast', `已记录 ${minutes} 分钟专注${reason === 'done' ? ',辛苦了' : ''}`)
  }
  catch {
    emit('toast', '记录没送出去,不过专注是真的')
  }
}

function start() {
  if (running.value || leftSec.value <= 0) return
  running.value = true
  timer = setInterval(() => {
    leftSec.value -= 1
    elapsedSec.value += 1
    if (leftSec.value <= 0) {
      leftSec.value = 0
      stopTimer()
      void record('done')
      reset()
    }
  }, 1000)
}

const pause = () => stopTimer()

async function end() {
  stopTimer()
  await record('end')
  reset()
}

onBeforeUnmount(() => {
  // 关页面/卸载时未结束的会话自动入账(设计 §4.3)
  if (elapsedSec.value >= 60) {
    void $fetch('/api/pomodoros', {
      method: 'POST',
      body: { nick: props.nick, minutes: Math.round(elapsedSec.value / 60) },
      keepalive: true,
    })
  }
  stopTimer()
})
</script>

<template>
  <!-- 外壳(glass 边框与宽度)由 ModalShell 提供,面板自身只出内容,不再自带 glass -->
  <section class="flex flex-col items-center px-6 py-6" aria-label="番茄钟">
    <h2 class="glow mb-3 text-[22px] text-cream">番茄钟</h2>

    <button
      class="group font-num glow relative text-[56px] leading-none text-accent"
      :aria-label="running ? '运行中,不能改时长' : '点击切换时长预设'"
      :disabled="running"
      @click="cyclePreset"
    >
      {{ display }}
      <!-- 必须用自定义气泡:原生 title 在 disabled 的按钮上多数浏览器不显示,
           而"运行中"这句提示恰恰只在禁用时才有意义。
           向下弹出:模态卡片是 overflow-y-auto,向上弹会被裁掉上缘 -->
      <PixelTip :label="running ? '运行中' : '点击切换时长预设'" side="bottom" />
    </button>

    <div class="mt-3 flex items-center gap-4 text-[19px]">
      <template v-if="!running">
        <button class="glow text-accent" @click="start">Start</button>
        <button class="glow text-cream/80 hover:text-cream" @click="addFive">+5:00</button>
      </template>
      <template v-else>
        <button class="glow text-accent" @click="pause">Pause</button>
        <button class="glow text-cream/80 hover:text-cream" @click="addFive">+5:00</button>
        <button class="text-danger hover:brightness-125" @click="end">End</button>
      </template>
    </div>

    <p class="mt-2 text-[15px] text-dim">{{ running ? '专注中,别分心太久哦' : '点数字换时长,开始就少看手机' }}</p>

    <button class="glow mt-5 w-full py-2 text-[19px] text-accent hover:brightness-125" @click="emit('close')">
      [ 关闭 ]
    </button>
  </section>
</template>
