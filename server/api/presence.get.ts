/**
 * GET /api/presence → 当前在线人数与昵称
 */
import { getPresence } from '../utils/hub'

export default defineEventHandler(() => getPresence())
