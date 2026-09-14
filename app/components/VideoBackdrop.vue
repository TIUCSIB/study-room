<script setup lang="ts">
/**
 * 全屏 lofi 场景,三级回退:
 * 1. public/videos/scene.mp4(循环视频)
 * 2. public/videos/scene.gif(循环 GIF)
 * 3. 代码渲染的"雨夜霓虹"氛围场景
 */
const scene = ref<'video' | 'gif' | 'fallback'>('fallback')
// 动态绑定,避免 Vite 把 public 资源当模块解析(场景资产是可选的)
const VIDEO_SRC = '/videos/scene.mp4'
const GIF_SRC = '/videos/scene.gif'

// 挂载时探测资产是否存在:缺失文件的请求会被 SPA 回退成 200 的 HTML,
// 所以必须看 content-type,不能只看状态码
onMounted(async () => {
  const probes = [
    { kind: 'video' as const, url: VIDEO_SRC, mime: 'video/' },
    { kind: 'gif' as const, url: GIF_SRC, mime: 'image/' },
  ]
  for (const p of probes) {
    try {
      const res = await fetch(p.url, { method: 'HEAD' })
      if (res.ok && (res.headers.get('content-type') ?? '').startsWith(p.mime)) {
        scene.value = p.kind
        return
      }
    }
    catch { /* 网络失败继续探测下一级 */ }
  }
})

// 伪随机雨丝参数:确定性,避免 SSR 水合不一致
function rainStyle(i: number) {
  return {
    left: `${(i * 61) % 100}%`,
    animationDelay: `${((i * 37) % 20) / 10}s`,
    animationDuration: `${0.8 + ((i * 29) % 10) / 12}s`,
    height: `${40 + ((i * 17) % 40)}px`,
    opacity: 0.08 + ((i * 13) % 10) / 60,
  }
}

const GLOWS = [
  'left-[-10vw] bottom-[-15vw] w-[45vw] h-[45vw] bg-[radial-gradient(circle,rgb(246_193_119/0.5),transparent_65%)]',
  'right-[-8vw] top-[-10vw] w-[38vw] h-[38vw] bg-[radial-gradient(circle,rgb(120_140_220/0.4),transparent_65%)] [animation-delay:-7s]',
  'left-[40vw] top-[30vh] w-[22vw] h-[22vw] bg-[radial-gradient(circle,rgb(232_138_138/0.28),transparent_65%)] [animation-delay:-3s]',
]
</script>

<template>
  <div class="fixed inset-0 z-0 overflow-hidden bg-void" aria-hidden="true">
    <video
      v-if="scene === 'video'"
      class="h-full w-full object-cover"
      :src="VIDEO_SRC"
      autoplay
      muted
      loop
      playsinline
      @error.once="scene = 'gif'"
    />
    <img
      v-else-if="scene === 'gif'"
      class="h-full w-full object-cover"
      :src="GIF_SRC"
      alt=""
      @error.once="scene = 'fallback'"
    >

    <!-- 降级场景:雨夜 + 霓虹光斑 -->
    <div v-if="scene === 'fallback'" class="absolute inset-0 bg-[linear-gradient(160deg,#1B1626_0%,#17131F_45%,#101019_100%)]">
      <div
        v-for="(g, i) in GLOWS"
        :key="i"
        class="absolute rounded-full blur-[90px] opacity-50 animate-drift"
        :class="g"
      />
      <div class="absolute inset-0">
        <span
          v-for="i in 48"
          :key="i"
          class="absolute top-[-15%] w-px animate-fall bg-[linear-gradient(to_bottom,transparent,rgb(168_196_232/0.5))]"
          :style="rainStyle(i)"
        />
      </div>
    </div>

    <!-- CRT 扫描线 + 暗角,保证 UI 可读 -->
    <div class="absolute inset-0 z-10 pointer-events-none crt-lines opacity-40" />
    <div
      class="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(8_6_12/0.6)_100%),linear-gradient(to_bottom,rgb(8_6_12/0.3),transparent_30%,transparent_70%,rgb(8_6_12/0.5))]"
    />
  </div>
</template>
