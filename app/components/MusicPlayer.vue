<script setup lang="ts">
/**
 * 音乐播放器(lofi.cafe 式裸文字传输条):
 * 像素图标传输条(play/shuffle/prev/next)+ 10 格音量块,下方歌名行。
 * 歌单来自 GET /api/tracks(扫描 public/music)。
 */
interface Track {
  name: string
  url: string
}

const tracks = ref<Track[]>([])
const current = ref(-1)
const playing = ref(false)
const shuffled = ref(false)
const volume = ref(0.6)
const audio = ref<HTMLAudioElement | null>(null)

const trackName = computed(() => tracks.value[current.value]?.name ?? '歌单还是空的')

function playIndex(i: number) {
  if (tracks.value.length === 0) return
  current.value = (i + tracks.value.length) % tracks.value.length
  const el = audio.value
  if (el) {
    el.src = tracks.value[current.value]!.url
    void el.play()
  }
}

const toggle = () => (playing.value ? audio.value?.pause() : playIndex(current.value === -1 ? 0 : current.value))

function next() {
  if (tracks.value.length < 2) return
  if (shuffled.value) {
    let r = current.value
    while (r === current.value) r = Math.floor(Math.random() * tracks.value.length)
    playIndex(r)
  }
  else {
    playIndex(current.value + 1)
  }
}

const prev = () => playIndex(current.value - 1)

const VOL_BLOCKS = 10
const filledVol = computed(() => Math.round(volume.value * VOL_BLOCKS))
function setVolume(i: number) {
  volume.value = i / VOL_BLOCKS
}

// 键盘:空格播放/暂停,←→ 切歌(输入框聚焦时不管)
function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.code === 'Space') {
    e.preventDefault()
    toggle()
  }
  else if (e.code === 'ArrowRight') next()
  else if (e.code === 'ArrowLeft') prev()
}

onMounted(async () => {
  try {
    tracks.value = (await $fetch<{ tracks: Track[] }>('/api/tracks')).tracks
  }
  catch { /* 接口挂了就当空歌单 */ }
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

watch(volume, (v) => {
  if (audio.value) audio.value.volume = v
})
</script>

<template>
  <div class="glow text-[19px]">
    <div class="flex items-center gap-3">
      <button :aria-label="playing ? '暂停' : '播放'" @click="toggle">
        <Icon name="pixel:pause-solid" v-if="playing" class="size-5" />
        <Icon name="pixel:play-solid" v-else class="size-5" />
      </button>
      <button :aria-label="shuffled ? '关闭随机' : '随机播放'"
        :class="shuffled ? 'text-accent' : 'text-cream/85 hover:text-cream'" @click="shuffled = !shuffled">
        <Icon name="pixel:shuffle-solid" class="size-5" />
      </button>
      <button class="text-cream/85 hover:text-cream" aria-label="上一首" @click="prev">
        <Icon name="pixel:arrow-left-solid" class="size-5" />
      </button>
      <button class="text-cream/85 hover:text-cream" aria-label="下一首" @click="next">
        <Icon name="pixel:arrow-right-solid" class="size-5" />
      </button>
      <span class="ml-1 flex items-center gap-[3px]">
        <button v-for="i in VOL_BLOCKS" :key="i" class="h-[14px] w-[6px]"
          :class="i <= filledVol ? 'bg-cream' : 'bg-cream/25'"
          :aria-label="`音量 ${Math.round((i / VOL_BLOCKS) * 100)}%`" @click="setVolume(i)" />
      </span>
    </div>

    <button class="glow-info mt-1 block max-w-[560px] truncate text-left text-[19px] text-cream/90 hover:brightness-125"
      :title="`${trackName}(点击切歌)`" @click="next">
      <span class="text-dim">... </span>{{ trackName }}
    </button>

    <audio ref="audio" @play="playing = true" @pause="playing = false" @ended="next" />
  </div>
</template>
