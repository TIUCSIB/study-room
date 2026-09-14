<script setup lang="ts">
/**
 * 居中玻璃弹窗外壳:统一遮罩、入场动画、Esc 与点遮罩关闭。
 *
 * `closable={false}` 用于强制弹窗(首次昵称)—— 不绑 Esc、点遮罩也不关,
 * 否则用户能把自己关进一个没有身份的房间里。
 */
const props = withDefaults(defineProps<{ label: string, closable?: boolean }>(), { closable: true })
const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (props.closable && e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-void/70 backdrop-blur-[3px]"
    role="dialog"
    aria-modal="true"
    :aria-label="label"
    @click.self="closable && emit('close')"
  >
    <div class="glass crt-boot max-h-[86vh] w-[min(88vw,400px)] overflow-y-auto">
      <slot />
    </div>
  </div>
</template>
