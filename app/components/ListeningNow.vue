<script setup lang="ts">
/**
 * 左上角在线人数:引导页与主界面共用这同一个元素(常驻挂载,不重复渲染)。
 * 首次拿到在线数时打字机逐字输出;之后数字随 SSE 实时更新;末尾大号闪烁点。
 */
const props = defineProps<{ count: number | null }>()
const emit = defineEmits<{ typed: [] }>()

const typed = ref('')
const done = ref(false)
let started = false

watch(() => props.count, async (c) => {
  if (c === null || started) return
  started = true
  const text = `正在自习 ${c} 人`
  for (let i = 1; i <= text.length; i++) {
    typed.value = text.slice(0, i)
    await new Promise(r => setTimeout(r, 90))
  }
  done.value = true
  emit('typed')
}, { immediate: true })
</script>

<template>
  <p class="glow pointer-events-none flex items-baseline gap-2 p-5 font-body text-[24px] text-cream/90">
    <template v-if="done">
      <span>正在自习 {{ count }} 人</span>
      <span class="animate-blink self-center text-[36px] leading-none text-accent"> ·</span>
    </template>
    <template v-else>
      <span>{{ typed }}</span>
      <span class="animate-blink self-center text-[20px] leading-none text-accent">▮</span>
    </template>
  </p>
</template>
