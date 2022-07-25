class ArcanaAuthError extends Error {
  constructor(code: string, public message: string) {
    super(code)
  }
}

const UserNotLoggedInError = new ArcanaAuthError(
  'user_not_logged_in',
  'User is not logged in'
)
const WalletNotInitializedError = new ArcanaAuthError(
  'wallet_not_initialized',
  'Wallet is not initialized. Please run `await wallet.init(...)` before calling functions'
)

const InvalidAppId = new ArcanaAuthError(
  'invalid_constructor_params',
  'App Id is invalid.'
)
export {
  InvalidAppId,
  UserNotLoggedInError,
  WalletNotInitializedError,
  ArcanaAuthError,
}
