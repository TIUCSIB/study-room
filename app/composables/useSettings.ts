/**
 * 本地设置登记处。
 *
 * 为什么单独一个文件:localStorage 的键名此前散落在各组件里(app.vue 写 nick、
 * TodoPanel 写 todos),多一处就多一次拼错的机会。所有键集中在此登记。
 *
 * 设置只存本机、不上服务端 —— 与「关于」里那句「数据只存在这台机器上」一致。
 */

export const LS_KEYS = {
  nick: 'lofi-room:nick',
  todos: 'lofi-room:todos',
  pomodoroMinutes: 'lofi-room:pomodoro-minutes',
} as const

/** 番茄钟可选时长(分钟)。设置页与番茄钟面板共用,避免两处各写一份而漂移。 */
export const POMODORO_MINUTES = [5, 25, 50] as const

/** 默认时长沿用改动前的行为(即 PRESETS[0]),不在做设置页时顺手改掉用户已有的习惯。 */
const DEFAULT_MINUTES = 5

/**
 * 番茄钟默认时长,模块级共享 ref:设置页写,番茄钟面板读,两边自动同步。
 * 只在客户端 hydrate —— SSR 期间没有 localStorage。
 * 读与写(watch)都在首次调用时挂一次,避免每个调用方各挂一个 watch。
 */
const pomodoroMinutes = ref<number>(DEFAULT_MINUTES)
let hydrated = false

export function usePomodoroMinutes() {
  if (!hydrated && import.meta.client) {
    hydrated = true
    const saved = Number(localStorage.getItem(LS_KEYS.pomodoroMinutes))
    if ((POMODORO_MINUTES as readonly number[]).includes(saved)) pomodoroMinutes.value = saved
    // 模块级 ref,不随组件卸载销毁 —— 用普通 watch,不用 effectScope
    watch(pomodoroMinutes, v => localStorage.setItem(LS_KEYS.pomodoroMinutes, String(v)))
  }
  return pomodoroMinutes
}

/** 恢复出厂:只清 `lofi-room:*` 前缀的键,不动同域下其他应用的存储。 */
export function clearLocalData() {
  if (!import.meta.client) return
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('lofi-room:')) localStorage.removeItem(key)
  }
}
