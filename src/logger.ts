export const LOG_LEVEL: { [k: string]: number } = {
  NOTSET: 0,
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  ERROR: 4,
  NOLOGS: 5,
}

const loggers: { [key: string]: Logger } = {}

let logLevel = LOG_LEVEL.NOLOGS
let logLevelFrozen = false

let exceptionReporter: null | ((msg: string) => void) = null
export const setExceptionReporter = (reporter: (msg: string) => void): void => {
  exceptionReporter = reporter
}

const sendException = (msg: string) => {
  if (exceptionReporter) {
    exceptionReporter(msg)
  }
}

export const setLogLevel = (level: number): void => {
  if (logLevelFrozen) return
  logLevel = level
}

export const freezeLogLevel = (): void => {
  logLevelFrozen = true
}

export const unfreezeLogLevel = (): void => {
  logLevelFrozen = false
}

export const getLogger = (name: string): Logger => {
  if (!loggers[name]) {
    loggers[name] = new Logger(logLevel, name)
  }
  return loggers[name]
}

export class Logger {
  private prefix = '[ARCANA_AUTH]'
  constructor(public logLevel: number, prefix: string) {
    if (prefix) {
      this.prefix += `[${prefix}]`
    }
  }

  log(level: string, message: string, params = {}): void {
    this.internalLog(LOG_LEVEL[level], message, params)
  }

  info(message: string, params: unknown = {}): void {
    this.internalLog(LOG_LEVEL.INFO, message, params)
  }

  debug(message: string, params: unknown = {}): void {
    this.internalLog(LOG_LEVEL.DEBUG, message, params)
  }

  warn(message: string, params: unknown = {}): void {
    this.internalLog(LOG_LEVEL.WARNING, message, params)
  }

  error(message: string, params: unknown = {}): void {
    if (params instanceof Error) {
      this.internalLog(
        LOG_LEVEL.ERROR,
        message,
        `${params.name}: ${params.message}: ${params.stack}`
      )
    }
    this.internalLog(LOG_LEVEL.ERROR, message, params)
    sendException(JSON.stringify({ message, params }))
  }

  internalLog(level: number, message: string, params: unknown): void {
    const logMessage = `${this.prefix} - ${this.getLogLevelName(
      level
    )} ${this.getTime()} ${message} \n[PARAMS]: ${JSON.stringify(params)}
          `

    this.consoleLog(level, logMessage)
  }

  getLogLevelName(level: number): string {
    switch (level) {
      case LOG_LEVEL.DEBUG:
        return 'DEBUG'
      case LOG_LEVEL.INFO:
        return 'INFO'
      case LOG_LEVEL.WARNING:
        return 'WARN'
      case LOG_LEVEL.ERROR:
        return 'ERROR'
      default:
        return 'NOTSET'
    }
  }

  getTime(): string {
    return new Date().toLocaleTimeString()
  }

  consoleLog(level: number, message: string): void {
    if (level < this.logLevel) {
      return
    }

    switch (level) {
      case LOG_LEVEL.DEBUG:
        console.debug(message)
        break
      case LOG_LEVEL.WARNING:
        console.warn(message)
        break
      case LOG_LEVEL.ERROR:
        console.error(message)
        break
      case LOG_LEVEL.INFO:
        console.info(message)
        break
      default:
        console.log(message)
    }
  }
}
