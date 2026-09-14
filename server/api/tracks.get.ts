/**
 * GET /api/tracks → 扫描 public/music 目录,返回歌单
 * 把 lofi mp3/flac/ogg/wav 丢进 public/music 即可出现在播放器里
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const AUDIO_EXT = new Set(['.mp3', '.flac', '.ogg', '.wav', '.m4a'])

export default defineEventHandler(() => {
  try {
    const dir = join(process.cwd(), 'public', 'music')
    const files = readdirSync(dir)
      .filter(f => AUDIO_EXT.has(f.slice(f.lastIndexOf('.')).toLowerCase()))
      .sort()
    return {
      tracks: files.map(file => ({
        name: file.replace(/\.[^.]+$/, ''),
        url: `/music/${encodeURIComponent(file)}`,
      })),
    }
  }
  catch {
    return { tracks: [] }
  }
})
