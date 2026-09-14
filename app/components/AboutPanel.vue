<script setup lang="ts">
/**
 * 关于面板:静态说明 —— 这间自习室是什么 + 快捷键。纯展示,无状态。
 */
const SHORTCUTS = [
  { keys: 'Space', desc: '播放 / 暂停' },
  { keys: '← →', desc: '上一首 / 下一首' },
]
</script>

<template>
  <section class="glass w-[320px] px-3.5 py-3 text-[17px] leading-relaxed" aria-label="关于">
    <header class="mb-2 glow text-cream">Lofi 自习室</header>
    <p class="text-cream/90">
      一间线上 lofi 自习室:放着歌,和房间里的人一起学到底。
      灯还亮着,休息一下也没关系。
    </p>
    <div class="mt-2 border-t border-line pt-2 text-[15px] text-dim">
      <div v-for="s in SHORTCUTS" :key="s.keys" class="flex justify-between">
        <span class="font-num text-cream/85">{{ s.keys }}</span>
        <span>{{ s.desc }}</span>
      </div>
    </div>
    <p class="mt-2 text-[15px] text-dim">音乐与场景素材自备 · 数据只存在这台机器上</p>
  </section>
</template>
