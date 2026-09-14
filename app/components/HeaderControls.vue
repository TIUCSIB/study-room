<script setup lang="ts">
/**
 * 右上角控件:全屏 / 设置,与时钟同区。
 *
 * 为什么和右下分开:这两项都是**低频的界面元信息**(进站后很少再动),
 * 而右下角放的是「房间里的活动」(学习 / 聊天)。混在一条上会让入口变长、
 * 权重不分 —— 详见 design.md §2。
 */
const emit = defineEmits<{ settings: [] }>()

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
  <div class="flex items-center gap-3">
    <button
      class="group relative transition-colors"
      :class="fullscreen ? 'glow text-accent' : 'text-cream/70 hover:text-cream'"
      :aria-pressed="fullscreen"
      :aria-label="fullscreen ? '退出全屏' : '全屏'"
      @click="toggleFullscreen"
    >
      <Icon :name="fullscreen ? 'pixelarticons:close' : 'pixelarticons:expand'" class="icon-pixel glow-icon" />
      <PixelTip :label="fullscreen ? '退出全屏' : '全屏'" align="end" />
    </button>
    <button
      class="group relative text-cream/70 transition-colors hover:text-cream"
      aria-label="设置"
      @click="emit('settings')"
    >
      <Icon name="pixelarticons:gear" class="icon-pixel glow-icon" />
      <PixelTip label="设置" align="end" />
    </button>
  </div>
</template>
