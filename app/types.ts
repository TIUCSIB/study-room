/**
 * 跨组件共享类型。
 * 放在这里而不是某个组件里:组件导出类型无法被 Nuxt 自动导入,
 * 消费方必须显式 import,否则是一个隐式的类型悬空(见 docs/handoff-review-2026-09-14.md)。
 */

/** 右下角控件坞可展开的面板标识,`app.vue` 与 `ControlDock.vue` 共用 */
export type PanelKey = 'pomodoro' | 'todo' | 'chat' | 'about'
