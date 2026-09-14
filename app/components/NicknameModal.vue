<script setup lang="ts">
/** 首次访问的昵称弹窗:昵称存 localStorage,作为聊天与番茄钟记录的身份。 */
const emit = defineEmits<{ confirm: [nick: string] }>()

const draft = ref('')

function submit() {
  const nick = draft.value.trim().slice(0, 12)
  if (nick) emit('confirm', nick)
}
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-void/70 backdrop-blur-[3px]">
    <form class="glass crt-boot w-[min(88vw,380px)] p-7 text-center" @submit.prevent="submit">
      <h2 class="glow mb-2 text-[22px] text-cream">🎧 欢迎来到 Lofi 自习室</h2>
      <p class="mb-4.5 text-[16px] text-dim">给自己起个名字,让大家认识你</p>
      <input
        v-model="draft"
        type="text"
        maxlength="12"
        placeholder="昵称,比如:今晚不熬夜"
        autofocus
        aria-label="昵称"
        class="mb-3.5 w-full border border-line bg-black/40 px-3.5 py-2.5 text-center text-[19px] text-cream outline-none placeholder:text-dim/70 focus:border-accent/60"
      >
      <button
        type="submit"
        :disabled="!draft.trim()"
        class="glow w-full py-2 text-[19px] text-accent hover:brightness-125 disabled:opacity-40"
      >
        [ 进门自习 → ]
      </button>
    </form>
  </div>
</template>
