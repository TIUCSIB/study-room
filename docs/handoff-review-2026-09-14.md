# 交接文件核对报告 —— lofi-study-room-handoff.md

> 核对时间:2026-09-14 · 核对方式:逐组件读源码 + 实跑 `pnpm build` + 依赖树与目录实测
> 结论:**架构描述可信,状态描述与建议 skills 已过期**。下文 A 节为已核实项,B 节为必须修正的错误,C 节为交接遗漏。

## A. 已核实(可信,可直接依赖)

| # | 交接文件断言 | 核实结果 |
|---|---|---|
| 1 | Nuxt 4.5.2 | ✅ 实装 `nuxt@4.5.2`(package.json 写 `^4.1.0`,以实装为准) |
| 2 | `pnpm build` 通过 | ✅ 实测 35s 完成,输出 `Build complete!`,零报错 |
| 3 | 只用 `pixel` 图标集(`-solid`),pixelarticons 已卸载 | ✅ 依赖中仅 `@iconify-json/pixel@1.2.2`;全部 `<Icon>` 均为 `pixel:*-solid` |
| 4 | SSE 下行 + POST 上行,不用 WebSocket | ✅ `chat/index.get.ts` 用 `createEventStream`;`chat/index.post.ts` 走 `broadcastChat` |
| 5 | 三级回退 + `fetch(HEAD)` 探测 content-type | ✅ `VideoBackdrop.vue` 逐行吻合;`public/videos/` 仅有 `scene.gif`,无 `scene.mp4`,确实走第 2 档 |
| 6 | 聊天客户端保留最近 200 条 | ✅ `useChat.ts:29` |
| 7 | 番茄钟记录落 `.data/pomodoros.json` | ✅ 文件存在,含 2 条记录(nick `今晚不熬夜`,25 / 6 分钟) |
| 8 | 单文件 ≤300 行 | ✅ 全部合规,最大为 `app/app.vue` 131 行 |
| 9 | 时钟冒号每秒闪烁、日期随系统星期 | ✅ `app.vue:88` `animate-colon`;`WEEKDAYS` 数组派生 |
| 10 | Git Bash 发中文按 GBK 编码的坑 | ✅ 仍成立,维护此条 |

## B. 与代码不符(须修正,否则误导下个会话)

1. **Pinia 不在技术栈。** `package.json` 无 `pinia`,全仓零 `defineStore`;`pnpm-lock.yaml` 中出现的 pinia 只是 nuxt 的**未启用的可选 peer**。§2 技术栈表与 §6「建议 pinia skill」均不成立。若确实要引入,须先按 AGENTS.md §5.6 说明不可替代理由。

2. **Todo 面板不是空壳。** `TodoPanel.vue`(80 行)已实现:添加(≤60 字)、`▣/▢` 勾选、悬浮删除、`剩 N 件` 计数、`localStorage('lofi-room:todos')` 持久化。§3「内容暂为占位」与 §5「当前为空壳,没有增删改逻辑」**已过期**,该待办项应直接划掉。

3. **番茄钟描述过简。** `PomodoroPanel.vue`(124 行)已完整实现 design.md §4.3:5/25/50 预设轮换、`Start`/`Pause`/`Resume`/`End`、`+5:00` 加时、满 1 分钟才入账、`onBeforeUnmount` 时 `keepalive` 补录。§3 只写「05:00/Start/+5:00 裸文字」明显失真。

4. **存储路径:文档与代码不一致(三处文档均错)。** `store.ts:14` 为 `join(process.cwd(), '.data')`,即**项目根** `.data/`,而非 `server/.data/`。需要更正的文档:AGENTS.md §2 存储行、AGENTS.md §7「禁止把测试数据提交进 `server/.data/`」、design.md §5。建议统一表述为「项目根 `.data/pomodoros.json`,已在 `.gitignore` 中」。

5. **`src/domain` 与 vitest 不存在。** §6 自称「本项目已建 `src/domain` 测试模式」,但仓库无 `src/` 目录、无 vitest 依赖、无 test 脚本。§6 中 `pinia`、`vitest` 两条建议对本项目无效,应删。

6. **`ws` 是死依赖。** `package.json` 仍带 `ws@8.18.0` + `@types/ws@8.18.0`,与 §2「不要改回 WebSocket」自相矛盾,应从 dependencies 与 devDependencies 移除(nuxt 4.5 自身不依赖它)。移除后须重跑 `pnpm build` 验证。

## C. 交接遗漏(下个会话必须知道)

1. **项目没有 git 仓库**(无 `.git`)。§4.1 只提醒「用户也在改代码、不要覆盖」,但没有任何版本控制兜底——这是当前**最大的工程风险**:一次误覆盖即不可回滚。**最优先动作:`git init` + 提交基线。** 这比任何文字交接都可靠。

2. **4 个组件未在交接文件中点名**,下个会话容易漏读:
   - `NicknameModal.vue` —— 首次进站的昵称弹窗(身份入口,§4.1 的实现体)
   - `BootGate.vue` —— 任意键/任意点击跳过引导(打字中途按也跳过)
   - `VideoBackdrop.vue` —— 三级回退场景
   - `ListeningNow.vue` —— 常驻在线数;引导页与主界面**共用同一实例**、打字机只跑一次,这是 §4.6「逐像素同位」的实现体

3. **`server/api/presence.get.ts` 未提及。** 它是引导页在线数的 REST 来源(`getPresence()`),与 SSE 的 `presence` 事件构成「同一数字的两种来源」(`app.vue:19-21` 的 `listeningCount` computed)。design.md §4.8 有写,交接文件漏了。

4. **`app.vue` 带 `<style>` 块**(`.fade-*` 过渡),违反 AGENTS.md §5.4「组件不写 `<style>` 块,必要 keyframes 集中放 main.css」。建议迁移。

5. **`PanelKey` 类型存在隐式依赖风险。** 它只在 `ControlDock.vue:3` 的 `<script lang="ts">` 块中导出,但 `app.vue:59/61` 裸用而未 `import`;`.nuxt` 生成的 `.d.ts` 中**不含**该类型。因 `nuxt build` 默认不做类型检查(未配 `typeCheck`),所以当前不报错;一旦开启类型检查会成为错误。建议抽到 `app/types.ts` 或 composable,两处显式 `import type { PanelKey }`。

6. **server 侧 import 规范空白。** `server/api/*` 用 `../../utils/hub` 相对路径,而 AGENTS.md §5.3 要求「跨目录一律用 `@/`」——`@/` 指向 `app/`,对 `server/` 无意义。规范未覆盖 server 侧,建议补一条:server 优先用 Nitro 自动导入(其实 `utils/hub.ts` 已被自动导入,现有相对路径可去掉)。

7. **`useChat` 的 EventSource 只建一次。** `watch(nick)` 仅在 `null → 值` 时 `connect()`,且 `if (... || source) return` 会阻断重连;改昵称不会以新昵称重连。当前 UI 无改昵称入口,属隐患而非 bug。

8. **design.md 自身也有脱节**(修文档时顺手处理):§2 与 §4.8 把 ControlDock 描述为 `[ 方括号 ]` 文本按钮,实际已是 pixel 图标按钮;§4.6「开机引导(BootGate)」是**空标题**,无正文。

## D. 建议动作顺序(已于 2026-09-14 全部执行完毕)

| # | 动作 | 状态 |
|---|---|---|
| 1 | `git init -b main` + 基线提交(消除不可回滚风险) | ✅ 基线 `552c87f`,34 个文件入库;`node_modules`/`.nuxt`/`.output`/`.data` 已由 `.gitignore` 排除 |
| 2 | 修正文档:`.data` 路径、ControlDock 图标按钮、design.md §4.6 空标题、README 番茄钟模式 | ✅ 涉及 AGENTS.md §2/§4/§7、design.md §2/§4.5/§4.6/§4.8/§5(版本升至 v3.1)、README.md |
| 3 | 清理 `ws` + `@types/ws`,重跑 `pnpm build` | ✅ 已移除,构建通过 |
| 4 | `PanelKey` 显式化 + 迁移 `app.vue` 的 `<style>` | ✅ 新增 `app/types.ts`;过渡类迁入 `main.css` |
| 5 | 重写交接文件为核对后版本 | ✅ `%TEMP%\lofi-study-room-handoff.md` 已重写,待用户拍板产品方向 |

下一步(未执行,等用户拍板):音乐源 / 多场景电台切换 / 专注报告。注意 `statsFor()` 返回的统计前端完全没用到,是现成的未接线能力。

