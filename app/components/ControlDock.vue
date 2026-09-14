<script setup lang="ts">
/**
 * 右下角控件坞:像素图标按钮,切换番茄钟 / Todo / 聊天 / 关于面板;
 * 全屏按钮直接操作系统 API。悬停有中文 tooltip。
 */
import type { PanelKey } from '@/types'

const props = defineProps<{ active: PanelKey | null }>()
const emit = defineEmits<{ toggle: [key: PanelKey] }>()

const ITEMS: { key: PanelKey, icon: string, label: string }[] = [
  { key: 'pomodoro', icon: 'pixel:clock-solid', label: '番茄钟' },
  { key: 'todo', icon: 'pixel:check-list-solid', label: 'Todo' },
  { key: 'chat', icon: 'pixel:comment-solid', label: '聊天' },
  { key: 'about', icon: 'pixel:info-circle-solid', label: '关于' },
]

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
    <button
      v-for="item in ITEMS"
      :key="item.key"
      class="transition-colors"
      :class="props.active === item.key ? 'glow text-accent' : 'text-cream/80 hover:text-cream'"
      :aria-pressed="props.active === item.key"
      :title="item.label"
      @click="emit('toggle', item.key)"
    >
      <Icon :name="item.icon" class="icon-pixel glow-icon" />
    </button>
    <button
      class="transition-colors"
      :class="fullscreen ? 'glow text-accent' : 'text-cream/80 hover:text-cream'"
      :aria-pressed="fullscreen"
      :title="fullscreen ? '退出全屏' : '全屏'"
      @click="toggleFullscreen"
    >
      <Icon :name="fullscreen ? 'pixel:times-solid' : 'pixel:expand-solid'" class="icon-pixel glow-icon" />
    </button>
  </nav>
</template>
