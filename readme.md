# Arcana Wallet

## Installation

### Using NPM/Yarn

```sh
npm install --save @arcana/wallet
yarn add @arcana/wallet
```

### Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@arcana/wallet"></script>
```

```html
<script src="https://unpkg.com/@arcana/wallet"></script>
```

## Usage

### Import

```js
const { WalletProvider } = window.arcana.wallet
// or
import { WalletProvider } from '@arcana/wallet'
```

### Initialize

```js
const wallet = new WalletProvider({
  appId: `${appId}`,
  inpageProvider: true /* sets window.arcana.provider and tries to set window.ethereum to the provider */,
})

await wallet.init()

provider = wallet.getProvider()
// or
provider = window.arcana.provider
// or
provider = window.ethereum
```

## Wallet API’s

### Request encryption

```js
WalletProvider.encryptWithPublicKey({
  publicKey: '',
  message: plaintext,
}).then((ciphertext) => {
  // Do something with ciphertext
})
```

### Trigger login

Social login

```js
await wallet.requestSocialLogin('google')
```

Passwordless login

```js
await wallet.requestPasswordlessLogin(`${email}`)
```

### Get public key

```js
await wallet.getPublicKey(`${email}`, `${verifier}`)
```

## Events

```js
provider.on('chainChanged', handler: (chainId: number) => void);
provider.on('accountsChanged', handler: (accounts: string[]) => void);
provider.on('connect', handler: ({ chainId: number }) => void);
provider.isConnected(): Promise<boolean>;
```

## RPC API’s

### eth_accounts

```js
provider.request({ method: 'eth_accounts' }).then((accounts) => {
  // Set default account to accounts[0]
  from = accounts[0]
})
```

### eth_sign

```js
provider
  .request({
    method: 'eth_sign',
    params: [from, 'some_random_data'],
  })
  .then((signature) => {
    // Use signature
  })
```

### personal_sign

```js
provider
  .request({
    method: 'personal_sign',
    params: ['some personal signing data', from],
  })
  .then((personalSignature) => {
    // Use personal signature
  })
```

### eth_getEncryptionPublicKey

```js
provider
  .request({
    method: 'eth_getEncryptionPublicKey',
    params: [from],
  })
  .then((publicKey) => {
    // Use public key
  })
```

### eth_decrypt

```js
provider
  .request({
    method: 'eth_decrypt',
    params: [ciphertext, from],
  })
  .then((plaintext) => {
    // Use plaintext
  })
```

### eth_signTypedData_v4

```js
provider
  .request({
    method: 'eth_signTypedData_v4',
    params: [from, msgParams],
  })
  .then((signature) => {
    // Use signature
  })
```
