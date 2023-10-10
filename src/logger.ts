export const LOG_LEVEL = {
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  ERROR: 4,
  NOLOGS: 5,
}

type ExceptionReporter = null | ((msg: string) => void)
export const setExceptionReporter = (reporter: (msg: string) => void): void => {
  state.exceptionReporter = reporter
}

const sendException = (msg: string) => {
  if (state.exceptionReporter) {
    state.exceptionReporter(msg)
  }
}

export const setLogLevel = (level: number): void => {
  state.logLevel = level
}

export const getLogger = (): Logger => {
  return state.logger
}

export class Logger {
  private prefix = '[XAR_AUTH_SDK]'

  info(message: string, params: unknown = {}): void {
    this.internalLog(LOG_LEVEL.INFO, message, params)
  }

  debug(message: string, params: unknown = {}): void {
    this.internalLog(LOG_LEVEL.DEBUG, message, params)
  }

  warn(message: string, params: unknown = {}): void {
    this.internalLog(LOG_LEVEL.WARNING, message, params)
  }

  error(message: string, err: unknown): void {
    if (err instanceof Error) {
      this.internalLog(LOG_LEVEL.ERROR, message, err.message)
      sendException(JSON.stringify({ message, error: err.message }))
      return
    }
    if (typeof err == 'string') {
      this.internalLog(LOG_LEVEL.ERROR, message, err)
      sendException(JSON.stringify({ message, error: err }))
    }
  }

  internalLog(level: number, message: string, params: unknown): void {
    const logMessage = `${
      this.prefix
    }\nMessage: ${message} \nParams: ${JSON.stringify(params)}`

    this.consoleLog(level, logMessage)
  }

  consoleLog(level: number, message: string): void {
    if (level < state.logLevel) {
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

const state: {
  logger: Logger
  logLevel: number
  exceptionReporter: ExceptionReporter | null
} = {
  logger: new Logger(),
  logLevel: LOG_LEVEL.NOLOGS,
  exceptionReporter: null,
}
