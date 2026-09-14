<script setup lang="ts">
/**
 * 学习面板:把番茄钟与 Todo 归并到一个入口下,内部 tab 切换。
 *
 * 归并理由:两者同属「私人学习工具」,面板体量相近。各占一个平级图标会让
 * 右下入口列表变长、权重不分(见 design.md §2 与 §4.8)。
 *
 * tab 用 `v-show` 而不是 `v-if`:番茄钟运行中切到 Todo 再切回来,不该让计时中断
 * —— `PomodoroPanel` 卸载时会 stopTimer 并把这一轮入账,一卸载这轮就结束了。
 */
const props = defineProps<{ nick: string }>()
const emit = defineEmits<{ toast: [text: string] }>()

const TABS = [
  { key: 'pomodoro', label: '番茄钟' },
  { key: 'todo', label: 'Todo' },
] as const

const tab = ref<(typeof TABS)[number]['key']>('pomodoro')
</script>

<template>
  <section class="glass flex w-[320px] flex-col px-3.5 py-3" aria-label="学习">
    <div class="mb-2.5 flex items-center gap-3 border-b border-line pb-2 text-[17px]">
      <button
        v-for="t in TABS"
        :key="t.key"
        class="transition-colors"
        :class="tab === t.key ? 'glow text-accent' : 'text-cream/60 hover:text-cream'"
        :aria-pressed="tab === t.key"
        @click="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-show="tab === 'pomodoro'">
      <PomodoroPanel :nick="props.nick" @toast="emit('toast', $event)" />
    </div>
    <div v-show="tab === 'todo'">
      <TodoPanel />
    </div>
  </section>
</template>
