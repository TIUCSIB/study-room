/**
 * GET /api/pomodoros?nick=xxx → 当前用户的番茄钟统计 + 全房今日数据
 */
import { loadRecords, statsFor } from '../../utils/store'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const nick = typeof query.nick === 'string' ? query.nick : ''
  const records = loadRecords()
  return statsFor(records, nick)
})
