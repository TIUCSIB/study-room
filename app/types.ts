/**
 * 跨组件共享类型。
 * 放在这里而不是某个组件里:组件导出类型无法被 Nuxt 自动导入,
 * 消费方必须显式 import,否则是一个隐式的类型悬空(见 docs/handoff-review-2026-09-14.md)。
 */

/**
 * 右下角控件坞可展开的面板标识,`app.vue` 与 `ControlDock.vue` 共用。
 * 「我」展示身份与专注记录;「关于」已并入设置弹窗,不再是面板;
 * 全屏与设置都是直接动作,也没有面板。
 */
export type PanelKey = 'pomodoro' | 'todo' | 'chat' | 'user'

/**
 * `GET /api/pomodoros?nick=` 的返回结构,与 `server/utils/store.ts` 的 `PomodoroStats` 对应。
 *
 * 为什么在前端再写一份:`server/` 下的类型不参与 `app/` 的自动导入,从前端 import 服务端
 * 模块会把 Nitro 运行时拖进客户端产物。两边字段增删时**必须同步此处** —— 这是刻意选择的
 * 重复,代价是同步,换来的是 `app/` 与 `server/` 的边界不被打破。
 */
export interface PomodoroStats {
  todayMinutes: number
  todayCount: number
  /** 连续学习天数;今天没学不打断,从昨天往前数 */
  streak: number
  totalMinutes: number
  total: number
  /** 今日全房完成的番茄数(氛围用) */
  roomTodayCount: number
}
