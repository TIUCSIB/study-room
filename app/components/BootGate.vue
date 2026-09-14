<script setup lang="ts">
/**
 * 开机引导第二行:左下打字机输出 press any key to start + 闪烁方块光标。
 * 第一行(listening now)由常驻的 ListeningNow 组件负责,打完后通过 prop 通知这里。
 * 任意键/点击 → 进入主界面。
 */
const props = defineProps<{ showLine2: boolean }>()
const emit = defineEmits<{ start: [] }>()

const line2 = ref('')
const done = ref(false)

watch(() => props.showLine2, async (show) => {
  if (!show) return
  const text = '按任意键开始'
  for (let i = 1; i <= text.length; i++) {
    line2.value = text.slice(0, i)
    await new Promise(r => setTimeout(r, 90))
  }
  done.value = true
})

function onAny() {
  emit('start')
}

onMounted(() => {
  window.addEventListener('keydown', onAny)
  window.addEventListener('pointerdown', onAny)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onAny)
  window.removeEventListener('pointerdown', onAny)
})
</script>

<template>
  <div class="absolute inset-0 z-20">
    <p class="glow absolute bottom-3 left-5 font-body text-[19px] text-cream/90">
      {{ line2 }}<span v-if="done" class="animate-blink text-accent">▮</span>
    </p>
  </div>
</template>
