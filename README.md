# Lofi 自习室 🎧

一间线上 lofi 自习室:整页是循环播放的氛围场景(像 lofi 直播间),可以放音乐、和房间里的人实时聊天、记录番茄钟。

Nuxt 4 全栈 + Tailwind CSS v4,聊天走 SSE,无需数据库。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # 生产构建
```

## 用起来

- **场景视频**:把一段循环视频命名为 `scene.mp4` 放进 `public/videos/`(版权自把关)。没有视频时页面显示代码渲染的雨夜氛围场景
- **音乐**:把 lofi 音乐文件(mp3/flac/ogg/wav)丢进 `public/music/`,刷新即出现在播放器
- **聊天**:进页起个昵称就能和房间里的人实时聊
- **番茄钟**:25/50/自由三种模式,完成自动记录;数据在 `server/.data/pomodoros.json`

## 文档

- `AGENTS.md` — 工程与维护规范(单文件 ≤300 行、组件复用优先、@ alias、Tailwind 令牌纪律)
- `docs/design.md` — 设计文档(布局、色彩令牌、功能规格、路线图)

## 结构

```
app/
├── components/   # VideoBackdrop / MusicPlayer / ChatPanel / PomodoroCard / NicknameModal
├── composables/  # useChat(SSE 聊天)
└── assets/css/   # Tailwind 入口 + @theme 设计令牌
server/
├── api/          # chat(SSE+POST)/ pomodoros / tracks
└── utils/        # hub(聊天广播)/ store(持久化)
```
