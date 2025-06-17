import { Logtail } from '@logtail/node'


const isProduction = process.env.NODE_ENV === 'production'

// Initialize Logtail if token is available
const logtail = process.env.LOGTAIL_TOKEN 
  ? new Logtail(process.env.LOGTAIL_TOKEN, {
    sendLogsToConsoleOutput: !isProduction,
    sendLogsToBetterStack: isProduction,
      endpoint: process.env.LOGTAIL_SOURCE || 's1349170.eu-nbg-2.betterstackdata.com',
    })
  : null

console.log('logtail', logtail)

console.log('token set', process.env.LOGTAIL_TOKEN  || 'not set')
console.log('source set', process.env.LOGTAIL_SOURCE || 'not set')
console.log('isProduction', isProduction)


type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogData {
  message: string
  level: LogLevel
  service?: string
  data?: Record<string, unknown>
  error?: Error
}

export function log({ message, level, service, data, error }: LogData) {
  const logEntry = {
    message,
    level,
    service: service || 'elal-notification',
    timestamp: new Date().toISOString(),
    ...(data && { data }),
    ...(error && { error: error.message, stack: error.stack }),
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify(logEntry, null, 2))
  }

  // Send to Logtail in production
  if (logtail && process.env.NODE_ENV === 'production') {
    switch (level) {
      case 'info':
        logtail.info(message, logEntry)
        break
      case 'warn':
        logtail.warn(message, logEntry)
        break
      case 'error':
        logtail.error(message, logEntry)
        break
      case 'debug':
        logtail.debug(message, logEntry)
        break
    }
  }
}

// Convenience functions following project guidelines (named exports)
export function logInfo(message: string, data?: Record<string, unknown>) {
  log({ message, level: 'info', data })
}

export function logWarn(message: string, data?: Record<string, unknown>) {
  log({ message, level: 'warn', data })
}

export function logError(message: string, error?: Error, data?: Record<string, unknown>) {
  log({ message, level: 'error', error, data })
}

export function logDebug(message: string, data?: Record<string, unknown>) {
  log({ message, level: 'debug', data })
} 