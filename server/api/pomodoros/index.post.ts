/**
 * POST /api/pomodoros { nick, minutes } → 记录一个完成的番茄钟,返回最新统计
 */
import { dateKey, loadRecords, sanitizeText, saveRecords, statsFor } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ nick?: unknown, minutes?: unknown }>(event)
  const nick = sanitizeText(body.nick, 12)
  const minutes = Number(body.minutes)
  if (!nick) throw createError({ statusCode: 400, statusMessage: 'nick required' })
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 600) {
    throw createError({ statusCode: 400, statusMessage: 'invalid minutes' })
  }

  const records = loadRecords()
  records.push({ nick, minutes: Math.round(minutes), ts: Date.now() })
  saveRecords(records)
  return statsFor(records, nick)
})
