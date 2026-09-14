/**
 * 跨组件共享类型。
 * 放在这里而不是某个组件里:组件导出类型无法被 Nuxt 自动导入,
 * 消费方必须显式 import,否则是一个隐式的类型悬空(见 docs/handoff-review-2026-09-14.md)。
 */

/**
 * 可展开面板的标识,`app.vue` 与 `ControlDock.vue` 共用。
 *
 * 只有两个:番茄钟与 Todo 已归并为 `study`(面板内再用 tab 分);
 * 「关于」已并入设置弹窗,不再是面板;全屏是直接操作,也没有面板。
 */
export type PanelKey = 'study' | 'chat'
