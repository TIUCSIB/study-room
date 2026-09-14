# AGENTS.md — Lofi 自习室工程规范

> 本文件是所有开发者与 AI 助手在本仓库工作的最高行为准则。
> 设计决策的唯一事实来源是 `docs/design.md`,两者冲突时以设计文档为准。

## 1. 项目是什么

一间线上 lofi 自习室:整页是循环播放的 lofi 氛围场景(像 lofi 直播间),可以放音乐、和房间里的人实时聊天、记录番茄钟。
产品价值 = **陪伴感 + 氛围感**,一切取舍向这两点对齐。

## 2. 技术栈(不得随意变更)

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Nuxt 4(Vue 3 + TS) | 全栈:前端 `app/`,服务端 `server/` |
| 样式 | **Tailwind CSS v4** | `@tailwindcss/vite` 插件,见 §5 |
| 实时 | **SSE + POST**(`server/api/chat/`) | 不用 WebSocket:Nuxt 4.5 新引擎兼容性差,SSE 纯 HTTP 更稳 |
| 存储 | JSON 文件(**项目根** `.data/pomodoros.json`) | 单机自用够;换 DB 只动 `server/utils/store.ts` |
| 字体 | VT323(数字/拉丁)+ Fusion Pixel(中文) | 像素字栈见 `nuxt.config.ts`,全站禁用其他字体 |

## 3. 常用命令

```bash
pnpm dev        # 开发服务器 http://localhost:3000
pnpm build      # 生产构建(提交前必须通过)
pnpm preview    # 预览生产构建
```

## 4. 目录结构与职责边界

```
app/
├── components/     # UI 组件,自动导入
├── composables/    # useChat 等,状态与通信逻辑
├── assets/css/     # main.css:Tailwind 入口 + @theme 设计令牌(唯一色源)
└── types.ts        # 跨组件共享类型(如 PanelKey)
server/
├── api/            # REST:chat(SSE+POST)、pomodoros、tracks、presence
└── utils/          # hub.ts(聊天广播中心)、store.ts(持久化+清洗)
public/
├── videos/         # scene.mp4 / scene.gif(用户自备循环场景,可选)
├── music/          # 用户自备音乐文件,自动扫描进歌单
└── cursors/        # 自绘像素光标 PNG(由 tools/gen-cursors.py 生成)
tools/               # 一次性资源生成脚本(不进构建产物)
.data/              # 运行时数据(pomodoros.json),已在 .gitignore
```

> `.data/` 的路径由 `server/utils/store.ts` 的 `join(process.cwd(), '.data')` 决定,
> 即**项目根**,不是 `server/.data/`。dev 与 build 的 cwd 都是项目根。

职责红线:
- 组件只管展示与交互;通信逻辑进 `composables/`,广播逻辑进 `server/utils/hub.ts`
- 持久化读写只允许出现在 `server/utils/store.ts`
- 输入(昵称/消息)必须过 `sanitizeText()` 清洗

## 5. 维护硬性规范(重要)

1. **单文件 ≤ 300 行**(含模板与注释)。超了就拆组件 / 抽 composable / 抽常量文件。提交前自查:`wc -l`
2. **组件复用优先**:写新 UI 前先看 `app/components/` 有没有现成的可复用或小改可用(如 `glass` 面板、按钮样式);确实没有才新建,且新组件尽量做成无业务依赖的可复用形态
3. **路径别名**:跨目录 import 一律用 `@/`(指向 `app/`),如 `import type { ChatMessage } from '@/composables/useChat'`;禁止 `../../` 相对路径攀升(同目录内 `./` 除外)。**该规则只作用于 `app/`**:`server/` 侧没有 `@/`,`server/utils/*` 由 Nitro 自动导入,需显式引用时用相对路径(如 `server/api/chat/` 内写 `../../utils/hub`)
4. **样式只用 Tailwind 工具类**:
   - 颜色/字体/动效一律引用 `main.css` `@theme` 里的令牌(`text-accent`、`bg-panel`、`animate-breathe`…),**组件内禁止硬编码色值/字号/圆角**
   - 风格工具类复用优先:`glass`(终端面板)、`glow` / `glow-info`(荧光字)、`crt-lines`(扫描线)、`crt-boot`(开机动画)
   - 组件不写 `<style>` 块;确有必要(复杂 keyframes 等)时集中放 `main.css`
5. **图标统一用 `pixelarticons` 图标集**:通过 `@nuxt/icon` + `@iconify-json/pixelarticons` 本地渲染,写法 `<Icon name="pixelarticons:xxx" class="icon-pixel" />`;新增图标前先在 `node_modules/.pnpm/@iconify-json+pixelarticons@*/node_modules/@iconify-json/pixelarticons/icons.json` 里确认图标名存在(1300+ 个,命名与旧库不同,别凭记忆写)。
   **为什么是它**:MIT 许可(旧库 `pixel` 即 HackerNoon "Pixel Icon" 是 CC BY 4.0,**要求署名**,而本仓库是公开仓库);且它提供 `chevron-left` / `chevron-right` 等旧库没有的图标。
   注意历史上本项目曾弃用 pixelarticons(旧记录写「细线图标缩小后发虚」),**那个结论是在 20px 渲染下得出的**;改用 24px 1:1 + `crispEdges` 后成因已消除,故现在重新采用。该库绝大多数图标是**描边风格**(1306 个里只有 53 个 `-solid`),视觉比旧库的实心剪影更轻 —— 这是有意的取舍,不要再去找不存在的 `-solid`。
   三条渲染硬性要求(都踩过坑):
   - **尺寸只用 `icon-pixel` 工具类,不要写 `size-5` 这类尺寸类**。该图标集原生网格是 24px,`icon-pixel` 同时钉住 24px(1:1)与 `shape-rendering: crispEdges`。20px 之类的非整数缩放会让浏览器插值像素图,边缘发虚,与硬边的像素字并排必然违和。注意 **inline SVG 上 `image-rendering: pixelated` 是无效的**,别指望它。
   - **图标要发辉光必须用 `glow-icon`**。`glow` / `glow-info` 是 `text-shadow`,**对 SVG 图形完全无效** —— 曾经的 bug 就是两者混用导致"文字发光、图标死平"。`glow-icon` 才是 `filter: drop-shadow`,且参数是 `glow` 的弱化版(图标墨色面积大,照抄会过曝)。只加在"周围文字也发光"的地方;周围是素文字时不要加,否则制造新的不一致。
   - **图标要和文字排在同一行,容器必须是 flex**。Tailwind 的 preflight 会把 `svg` 设为 `display: block`,所以图标放在普通块级容器里会**强制把后面的文字挤到下一行**(曾因此把播放器歌名行拆成两行)。正确写法:`class="flex items-center gap-1.5"`,图标加 `shrink-0`,文字加 `min-w-0 truncate`。
   - **禁止混用 emoji / 其他图标集**。例外:`▮`(块光标)、`▣` / `▢`(Todo 勾选)、音量块 `▮▮▮▯▯` 是 design.md §3.5/§4.7 刻意规定的**字符块**用法,属于风格元素而非图标,不算违规,不要"顺手改成图标"。
6. 新增 npm 依赖前必须说明不可替代的理由
7. **光标用自绘像素光标(`public/cursors/`)**:资源由 `tools/gen-cursors.py` 生成(**改形状/配色一律改脚本重跑,不要直接编辑 PNG**);脚本的 `DEFAULT_STYLE` 必须与入库的那套保持一致(**当前 D「暖边」:奶白实心 + 琥珀描边**),否则谁裸跑一次就会把资源悄悄换成别的样式。`main.css` 的 `@layer base` 里统一挂载:`html` → `default.png`、`a`/`button`/`[role=button]`/`summary` → `pointer.png`、`input`/`textarea` → `text.png`、`button:disabled`/`[aria-disabled=true]` → `not-allowed.png`。四条硬约束:
   - **尺寸必须 ≤32×32** —— 浏览器普遍不接受更大的 url 光标,生成器网格就定死 32。
   - **坐标是热区,必须与生成器输出一致**。指针类取图案**左上角极值像素**(描边会把尖端顶出去 1px,当前是 `1 1`);居中类取外接框中心(当前 `15 15`)。**写错会让点击位置偏移,比「不好看」严重得多**;脚本每次运行都会打印各文件的热区,照抄即可。
   - **列表末尾必须留原生关键字兜底**(`..., default`),图片加载失败时浏览器会回退。
   - **禁用态必须有 `not-allowed`**。它是**语义信号**,刻意用灰色而非主题色 —— 缺了它,禁用按钮看起来和可点按钮一样。
   **禁止引入第三方光标素材**:这类素材常是「独立产品、许可未明」(pixelarticons 的免费光标即如此,与它 MIT 的图标集不是一回事),不得放进公开仓库。需要新光标就照着 `tools/gen-cursors.py` 的网格与配色自绘。
8. **悬停提示统一用自绘气泡,禁止原生 `title`**:写 `<PixelTip label="..."/>`(放在可交互元素**内部**,并给该元素加 `group relative`),样式由 `main.css` 的 `tip` 工具类提供(复用 `glass` 的面板语言,更紧凑)。两条理由:
   - 原生提示的字体、圆角、延迟、配色全由浏览器/系统决定,**系统字体铺在满屏像素字里最跳**;
   - **原生 `title` 在 `disabled` 元素上多数浏览器不显示** —— 番茄钟"运行中"这类只在禁用时有意义的提示,用它根本出不来。
   约定:无障碍名写在元素的 `aria-label` 上,气泡本体带 `aria-hidden`(否则同一句话被读两遍);气泡默认居中,元素贴近视口边缘(如控件坞最右的全屏键)时用 `align="end"` 防溢出。

## 6. 验收流程(Definition of Done)

1. `pnpm build` 通过(零类型错误)
2. `pnpm dev` 浏览器实际操作:开两个标签页(或隔离上下文)验证聊天互发;番茄钟开始/暂停/记录联动顶部统计
3. 控制台无 error
4. `wc -l` 检查改动文件 ≤ 300 行
5. 视觉对照 `docs/design.md` 自检(令牌使用、布局、文案语气)

## 7. 明确禁止

- 禁止引入 UI 组件库(Element/Ant 等)—— 本项目视觉高度定制,组件库是负资产
- 禁止绕过 `sanitizeText` 直接落库/广播
- 禁止在组件里写 fetch 封装(统一走 `$fetch` + composable)
- 禁止把测试数据提交进 `.data/`
