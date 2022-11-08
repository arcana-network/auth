class ArcanaAuthError extends Error {
  constructor(code: string, public message: string) {
    super(code)
  }
}

const ErrorUserNotLoggedIn = new ArcanaAuthError(
  'user_not_logged_in',
  'User is not logged in'
)
const ErrorWalletNotInitialized = new ArcanaAuthError(
  'wallet_not_initialized',
  'AuthProvider is not initialized. Please run `await auth.init(...)` before calling functions'
)

export { ErrorUserNotLoggedIn, ErrorWalletNotInitialized, ArcanaAuthError }
