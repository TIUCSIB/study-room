<script setup lang="ts">
/**
 * 右下角控件坞:一排像素图标按钮 —— 番茄钟 / Todo / 聊天 / 全屏 / 设置。
 * 前二(番茄钟 / Todo)按「同一时刻最多展开一个面板,再点一次收起」切换;
 * 全屏直接操作系统 API;设置打开设置弹窗。
 * 悬停时在**按钮上方**显示自定义提示气泡(PixelTip),不用原生 `title`。
 */
import type { PanelKey } from '@/types'

const props = defineProps<{ active: PanelKey | null, unread: number }>()
const emit = defineEmits<{ toggle: [key: PanelKey], settings: [] }>()

const ITEMS: { key: PanelKey, icon: string, label: string }[] = [
  { key: 'pomodoro', icon: 'pixelarticons:clock', label: '番茄钟' },
  { key: 'todo', icon: 'pixelarticons:checklist', label: 'Todo' },
  { key: 'chat', icon: 'pixelarticons:comment', label: '聊天' },
]

/** 有未读时把条数写进提示文案,这样不点开也知道有人在说话 */
const items = computed(() => ITEMS.map(i => ({
  ...i,
  label: i.key === 'chat' && props.unread > 0 ? `聊天 · ${props.unread} 条新消息` : i.label,
})))

const fullscreen = ref(false)

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen()
}

function syncFullscreen() {
  fullscreen.value = !!document.fullscreenElement
}

onMounted(() => document.addEventListener('fullscreenchange', syncFullscreen))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', syncFullscreen))
</script>

<template>
  <nav class="flex items-center gap-3.5" aria-label="功能控件">
    <button v-for="item in items" :key="item.key" class="group relative transition-colors"
      :class="props.active === item.key ? 'glow text-accent' : 'text-cream/80 hover:text-cream'"
      :aria-pressed="props.active === item.key" :aria-label="item.label" @click="emit('toggle', item.key)">
      <Icon :name="item.icon" class="icon-pixel glow-icon" />
      <!-- 未读点:用方块而非圆点,与 ▮ 的字符块语言一致 -->
      <span v-if="item.key === 'chat' && props.unread > 0"
        class="animate-breathe absolute -top-0.5 -right-0.5 size-1.5 bg-accent" />
      <PixelTip :label="item.label" />
    </button>

    <button class="group relative transition-colors"
      :class="fullscreen ? 'glow text-accent' : 'text-cream/80 hover:text-cream'" :aria-pressed="fullscreen"
      :aria-label="fullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
      <Icon :name="fullscreen ? 'pixelarticons:close' : 'pixelarticons:expand'" class="icon-pixel glow-icon" />
      <PixelTip :label="fullscreen ? '退出全屏' : '全屏'" align="end" />
    </button>

    <button class="group relative text-cream/80 transition-colors hover:text-cream" aria-label="设置"
      @click="emit('settings')">
      <Icon name="pixelarticons:settings-2-sharp" class="icon-pixel glow-icon" />
      <PixelTip label="设置" align="end" />
    </button>
  </nav>
</template>
