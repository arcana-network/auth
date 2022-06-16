class ArcanaWalletError extends Error {
  constructor(code: string, public message: string) {
    super(code)
  }
}

const UserNotLoggedInError = new ArcanaWalletError(
  'user_not_logged_in',
  'User is not logged in'
)
const WalletNotInitializedError = new ArcanaWalletError(
  'wallet_not_initialized',
  'Wallet is not initialized. Please run `await wallet.init(...)` before calling functions'
)

const InvalidAppId = new ArcanaWalletError(
  'invalid_constructor_params',
  'App Id is invalid.'
)
export {
  InvalidAppId,
  UserNotLoggedInError,
  WalletNotInitializedError,
  ArcanaWalletError,
}
