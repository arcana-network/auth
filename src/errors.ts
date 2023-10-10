class ArcanaAuthError extends Error {
  constructor(code: string, public message: string) {
    super(code)
    this.message = `[XAR_AUTH_SDK] error: [${code}] ${message}`
  }
}

class ArcanaAuthWarning {
  public message: string
  constructor(code: string, message: string) {
    this.message = `[XAR_AUTH_SDK] warning: [${code}] ${message}`
  }

  public log() {
    console.warn(this.message)
  }
}

const ErrorNotLoggedIn = new ArcanaAuthError(
  'user_not_logged_in',
  'User is not logged in'
)
const ErrorNotInitialized = new ArcanaAuthError(
  'wallet_not_initialized',
  'AuthProvider is not initialized. Please run `await auth.init(...)` before calling functions'
)
const WarningDupeIframe = new ArcanaAuthWarning(
  'duplicate_iframe',
  'Duplicate iframe detected, please keep a single instance of AuthProvider'
)

export {
  WarningDupeIframe,
  ErrorNotLoggedIn,
  ErrorNotInitialized,
  ArcanaAuthError,
}
