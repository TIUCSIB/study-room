/**
 * 番茄钟记录的持久化:单 JSON 文件,够单机自用。
 * 换 SQLite/DB 时只动这个文件。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export interface PomodoroRecord {
  nick: string
  minutes: number
  ts: number
}

const DATA_DIR = join(process.cwd(), '.data')
const DATA_FILE = join(DATA_DIR, 'pomodoros.json')

export function loadRecords(): PomodoroRecord[] {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8')) as PomodoroRecord[]
  }
  catch {
    return []
  }
}

export function saveRecords(records: PomodoroRecord[]): void {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(records))
}

export function dateKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export interface PomodoroStats {
  todayMinutes: number
  todayCount: number
  streak: number
  totalMinutes: number
  total: number
  /** 今日全房完成的番茄数(氛围用) */
  roomTodayCount: number
}

export function statsFor(records: PomodoroRecord[], nick: string, now = new Date()): PomodoroStats {
  const today = dateKey(now)
  const mine = records.filter(r => r.nick === nick)
  const todayMine = mine.filter(r => dateKey(new Date(r.ts)) === today)

  // 连续打卡:今天没学不打断,从昨天往前数
  const daysWithStudy = new Set(mine.map(r => dateKey(new Date(r.ts))))
  let streak = 0
  const cursor = new Date(now)
  if (!daysWithStudy.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (daysWithStudy.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    todayMinutes: todayMine.reduce((sum, r) => sum + r.minutes, 0),
    todayCount: todayMine.length,
    streak,
    totalMinutes: mine.reduce((sum, r) => sum + r.minutes, 0),
    total: mine.length,
    roomTodayCount: records.filter(r => dateKey(new Date(r.ts)) === today).length,
  }
}

/** 昵称与消息的统一清洗 */
export function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength)
}
