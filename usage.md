# Arcana Auth Usage guide

## Quick start with ethers.js

```ts
import { AuthProvider } from '@arcana/auth'
import { ethers } from 'ethers'

const auth = new AuthProvider(`${appId}`)

window.onload = async () => {
  try {
    await auth.init()

    const arcanaProvider = await auth.loginWithSocial('google')
    const provider = new ethers.providers.Web3Provider(arcanaProvider)

    await provider.getBlockNumber()
    // 14983200
  } catch (e) {
    // log error
  }
}
```

## Quick start with Web3

```ts
import { AuthProvider } from '@arcana/auth'
import Web3 from 'web3'

const auth = new AuthProvider(`${appId}`)

window.onload = async () => {
  try {
    await auth.init()

    const arcanaProvider = await auth.loginWithSocial('google')
    const provider = new Web3(arcanaProvider)

    await provider.getBlockNumber()
    // 14983200
  } catch (e) {
    // log error
  }
}
```

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
const { AuthProvider } = window.arcana.auth // From CDN
// or
import { AuthProvider } from '@arcana/auth' // From npm
```

### Initialize

```ts
import { AuthProvider, AppMode, CHAIN } from '@arcana/auth'

interface ChainConfig {
  chainId: CHAIN
  rpcUrl?: string
}

const auth = new AuthProvider(`${appId}`, {
  chainConfig: {
    chainId: CHAIN.POLYGON_MAINNET,
    rpcUrl: '',
  },
})

const position = 'left' // values - 'left' or 'right'

await auth.init({ appMode: AppMode.Widget, position })
```

## Auth API’s

### Login/logout

Social login

```js
// loginType - google, discord, twitter, github, twitch
const provider = await auth.loginWithSocial(`${loginType}`)
```

Email link login

```js
const provider = await auth.loginWithLink(`${email}`)
```

Check is logged in

```js
const isloggedIn = await auth.isLoggedIn() // boolean
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
  address: string
  publicKey: string
}
*/
```

Logout

```js
await auth.logout()
```

### Get public key associated with an email

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
