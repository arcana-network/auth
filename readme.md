<p align="center">
<a href="#start"><img height="30rem" src="https://raw.githubusercontent.com/arcana-network/branding/main/an_logo_light_temp.png"></a>
<h2 align="center"> <a href="https://arcana.network/">Arcana Network Auth SDK </a></h2>
</p>
<br>
<p id="banner" align="center">
<br>
<a title="License BSL 1.1" href="https://github.com/arcana-network/license/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/License-BSL%201.1-purple"></a>
<a title="Beta release" href="https://github.com/arcana-network/wallet/releases"><img src="https://img.shields.io/github/v/release/arcana-network/wallet?style=flat-square&color=28A745"></a>
<a title="Twitter" href="https://twitter.com/ArcanaNetwork"><img alt="Twitter URL" src="https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FArcanaNetwork"></a>
</p><p id="start" align="center">
<a href="https://docs.dev.arcana.network/docs/wallet_qs/#using-auth-sdk"><img src="https://raw.githubusercontent.com/arcana-network/branding/main/an_banner_temp.png" alt="Arcana Auth SDK"></a>
</p>

# Arcana Auth

## Installation

### Using NPM/Yarn

```sh
npm install --save @arcana/auth
yarn add @arcana/auth
```

### Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@arcana/auth"></script>
```

```html
<script src="https://unpkg.com/@arcana/auth"></script>
```

## Usage

### Import

```js
const { AuthProvider } = window.arcana.auth
// or
import { AuthProvider } from '@arcana/auth'
```

### Initialize

```js
import { AppMode } from '@arcana/auth'
const auth = new AuthProvider(`${appId}`)

const position = 'left' // values - 'left' or 'right'

await auth.init({ appMode: AppMode.Widget, position })

provider = auth.provider
// or
provider = window.arcana.provider
// or
provider = window.ethereum
```

## Auth API’s

### Login/logout

Social login

```js
await auth.loginWithSocial(`${verifier}`)
```

Email link login

```js
await auth.loginWithLink(`${email}`)
```

Check is logged in

```js
const loggedIn = await auth.isLoggedIn()
```

User Info

```js
const info = await auth.getUser()
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
await auth.logout()
```

### Get public key

```js
await auth.getPublicKey(`${email}`)
```

## Utils

### ECIES encryption

```js
import { encryptWithPublicKey } from '@arcana/auth'

encryptWithPublicKey({
  publicKey: '',
  message: 'test-message',
}).then((ciphertext) => {
  // Do something with ciphertext
})
```

### Compute Address

```ts
import { computeAddress } from '@arcana/auth'

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

const provider = new ethers.providers.Web3Provider(auth.provider)

const signer = provider.getSigner()

const signedMessage = await signer.signMessage('sample_message')
```

### Web3 JS

Installation

```sh
npm install --save web3
```

Usage

```js
import Web3 from 'web3'

const provider = new Web3(auth.provider)

const signer = provider.getSigner()

const signedMessage = await signer.signMessage('sample_message')
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
