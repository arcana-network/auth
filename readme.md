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
import { AppMode } from '@arcana/wallet'
const wallet = new WalletProvider({
  appId: `${appId}`,
  inpageProvider: true /* sets window.arcana.provider and tries to set window.ethereum to the provider */,
})

const position = 'left' // values - 'left' or 'right'

await wallet.init({ appMode: AppMode.Widget, position })

provider = wallet.provider
// or
provider = window.arcana.provider
// or
provider = window.ethereum
```

## Wallet API’s

### Login/logout

Social login

```js
await wallet.requestSocialLogin(`${verifier}`)
```

Passwordless login

```js
await wallet.requestPasswordlessLogin(`${email}`)
```

Check is logged in

```js
const loggedIn = await wallet.isLoggedIn()
```

User Info

```js
const info = await wallet.requestUserInfo()
/* 
interface UserInfo {
  id: string
  email?: string
  name?: string
  picture?: string
}
*/
```

Logout

```js
await wallet.logout()
```

### Get public key

```js
await wallet.requestPublicKey(`${email}`, `${verifier}`)
```

## Utils

### ECIES encryption

```js
import { encryptWithPublicKey } from '@arcana/wallet'

encryptWithPublicKey({
  publicKey: '',
  message: 'test-message',
}).then((ciphertext) => {
  // Do something with ciphertext
})
```

### Compute Address

```ts
import { computeAddress } from '@arcana/wallet'

const address = computeAddress(publicKey: string);
```

## Events

Subscribing

```js
provider.on('chainChanged', handler: (chainId: number) => void);
provider.on('accountsChanged', handler: (accounts: string[]) => void);
provider.on('connect', handler: ({ chainId: number }) => void);
provider.isConnected(): Promise<boolean>;
```

Unsubscribing

```js
provider.removeListener(`${eventName}`, handler)
```

## Using with web3/ethers

### Ethers JS

Installation

```sh
npm install --save ethers
```

Usage

```js
import { ethers } from 'ethers'

const provider = new ethers.providers.Web3Provider(wallet.provider)

const signer = provider.getSigner()
const signedMessage = await signer.signMessage(originalMessage)
```

### Web3 JS

Installation

```sh
npm install --save web3
```

Usage

```js
import Web3 from 'web3'

const provider = new Web3(wallet.provider)

const signer = provider.getSigner()

const signedMessage = await signer.signMessage(originalMessage)
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
