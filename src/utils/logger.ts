/**
 * Debug logger that stores logs in memory
 * Can be exported for debugging without flooding console
 */

interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: unknown
}

const MAX_LOGS = 1000
const logs: LogEntry[] = []

/**
 * Add a log entry
 */
function addLog(level: LogEntry['level'], message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  }

  logs.push(entry)

  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }
}

/**
 * Log debug message (stored only, not printed)
 */
export function logDebug(message: string, data?: unknown): void {
  addLog('debug', message, data)
}

/**
 * Log info message
 */
export function logInfo(message: string, data?: unknown): void {
  addLog('info', message, data)
  console.info(`[map2places] ${message}`, data ?? '')
}

/**
 * Log warning message
 */
export function logWarn(message: string, data?: unknown): void {
  addLog('warn', message, data)
  console.warn(`[map2places] ${message}`, data ?? '')
}

/**
 * Log error message
 */
export function logError(message: string, data?: unknown): void {
  addLog('error', message, data)
  console.error(`[map2places] ${message}`, data ?? '')
}

/**
 * Get all logs
 */
export function getLogs(): LogEntry[] {
  return [...logs]
}

/**
 * Get logs as JSON string
 */
export function exportLogs(): string {
  return JSON.stringify(logs, null, 2)
}

/**
 * Download logs as a file
 */
export function downloadLogs(): void {
  const blob = new Blob([exportLogs()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `map2places-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logs.length = 0
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { map2placesLogs: { get: () => LogEntry[], export: () => string, download: () => void, clear: () => void } }).map2placesLogs = {
    get: getLogs,
    export: exportLogs,
    download: downloadLogs,
    clear: clearLogs
  }
}
