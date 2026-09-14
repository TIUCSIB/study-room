<script setup lang="ts">
/**
 * 悬停提示气泡(bottom-full,显示在元素上方),用来替代原生 `title`。
 *
 * 为什么不用原生 `title`:
 *  1. 字体、圆角、延迟、配色全由浏览器/系统决定,无法定制 —— 系统字体铺在满屏像素字里最跳;
 *  2. **在 `disabled` 元素上很多浏览器不显示**,所以禁用态按钮的说明(如番茄钟"运行中")
 *     用它根本出不来,是实打实的功能缺失。
 *
 * 用法:把本组件放在**可交互元素内部**,并给该元素加 `group relative`。
 * 不需要外层再包一层容器 —— 气泡是绝对定位的,不参与文档流,不会影响按钮原有布局。
 *
 * 无障碍:无障碍名由调用方写在元素的 `aria-label` 上;气泡本体 `aria-hidden`,
 * 否则同一句话会被屏幕阅读器读两遍。
 */
withDefaults(defineProps<{
  label: string
  /** center=居中对齐元素;start/end=贴左/贴右边,用于靠视口边缘的元素防溢出 */
  align?: 'center' | 'start' | 'end'
}>(), { align: 'center' })

const ALIGN = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
  end: 'right-0',
} as const
</script>

<template>
  <span
    aria-hidden="true"
    class="tip pointer-events-none absolute bottom-full mb-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
    :class="ALIGN[align]"
  >{{ label }}</span>
</template>
