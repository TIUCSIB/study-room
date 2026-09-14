<script setup lang="ts">
/**
 * 右下角控件坞:只剩两个高频入口 —— 学习(番茄钟 + Todo)与聊天。
 * 全屏与设置移到右上角与时钟同区(见 HeaderControls):那两项是低频的界面元信息,
 * 和「房间里的活动」不是一类,混在一起会让入口列表变长、权重不分。
 */
import type { PanelKey } from '@/types'

const props = defineProps<{ active: PanelKey | null, unread: number }>()
const emit = defineEmits<{ toggle: [key: PanelKey] }>()

const ITEMS: { key: PanelKey, icon: string, label: string }[] = [
  { key: 'study', icon: 'pixelarticons:notebook', label: '学习' },
  { key: 'chat', icon: 'pixelarticons:comment', label: '聊天' },
]

/** 有未读时把条数写进提示文案,这样不点开也知道有人在说话 */
const items = computed(() => ITEMS.map(i => ({
  ...i,
  label: i.key === 'chat' && props.unread > 0 ? `聊天 · ${props.unread} 条新消息` : i.label,
})))
</script>

<template>
  <nav class="flex items-center gap-3.5" aria-label="功能控件">
    <button
      v-for="item in items"
      :key="item.key"
      class="group relative transition-colors"
      :class="props.active === item.key ? 'glow text-accent' : 'text-cream/80 hover:text-cream'"
      :aria-pressed="props.active === item.key"
      :aria-label="item.label"
      @click="emit('toggle', item.key)"
    >
      <Icon :name="item.icon" class="icon-pixel glow-icon" />
      <!-- 未读点:用方块而非圆点,与 ▮ 的字符块语言一致 -->
      <span
        v-if="item.key === 'chat' && props.unread > 0"
        class="animate-breathe absolute -top-0.5 -right-0.5 size-1.5 bg-accent"
      />
      <PixelTip :label="item.label" />
    </button>
  </nav>
</template>
