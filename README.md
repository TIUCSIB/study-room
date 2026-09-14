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

- **场景背景**:三级回退 —— 把循环视频命名为 `scene.mp4` 放进 `public/videos/`(版权自把关);没有视频时用 `public/videos/scene.gif`;两者都没有则显示代码渲染的雨夜霓虹场景
- **音乐**:把 lofi 音乐文件(mp3/flac/ogg/wav/m4a)丢进 `public/music/`,刷新即出现在播放器
- **聊天**:进页起个昵称就能和房间里的人实时聊(SSE)
- **番茄钟**:控件坞打开,时长在 5/25/50 分钟间轮换;完成或结束(满 1 分钟)自动记录,数据在项目根 `.data/pomodoros.json`
- **Todo**:控件坞打开,纯本地 localStorage,不进服务端

## 文档

- `AGENTS.md` — 工程与维护规范(单文件 ≤300 行、组件复用优先、@ alias、Tailwind 令牌纪律)
- `docs/design.md` — 设计文档(布局、色彩令牌、功能规格、路线图)

## 结构

```
app/
├── components/   # VideoBackdrop / BootGate / ListeningNow / MusicPlayer / ChatPanel
│                 # PomodoroPanel / TodoPanel / AboutPanel / ControlDock / NicknameModal
├── composables/  # useChat(SSE 聊天)
├── assets/css/   # Tailwind 入口 + @theme 设计令牌(唯一色源)
└── types.ts      # 跨组件共享类型(PanelKey)
server/
├── api/          # chat(SSE+POST)/ pomodoros / tracks / presence
└── utils/        # hub(聊天广播)/ store(持久化+清洗)
.data/            # 运行时数据 pomodoros.json(.gitignore 已排除)
```
