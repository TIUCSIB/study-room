import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/icon'],

  icon: {
    // 本地图标集(pixel:实心粗笔画像素图标),离线可用
    mode: 'svg',
    // 兜底尺寸:必须与图标原生网格(24px)一致,非整数缩放会把像素图插值糊边。
    // 具体组件仍应显式加 `icon-pixel` 工具类(它同时负责 crispEdges),见 AGENTS.md §5.5
    size: '24px',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'Lofi 自习室 · 一起学到底',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '一间线上 lofi 自习室:循环场景、音乐、聊天、番茄钟' },
      ],
      link: [
        { rel: 'icon', href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎧</text></svg>" },
        // VT323:终端点阵字体(数字/拉丁);Fusion Pixel:中文像素字,两者拼成完整像素字栈
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=VT323&display=swap' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-fusion-pixel-font@0.0.1/dist/12px/proportional/zh_hans/Fusion-Pixel-12px-Proportional-Simplified-Chinese.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@vp-tw/cjk-web-fonts-fusion-pixel-font@0.0.1/dist/12px/proportional/latin/Fusion-Pixel-12px-Proportional-Latin.css' },
      ],
    },
  },
})
