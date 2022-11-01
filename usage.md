# Arcana Auth Usage Guide

**Contents**

1. [Quick Start with `ethers.js`](#quick-start-with-ethersjs)
2. [Quick Start with `web3.js`](#quick-start-with-web3js)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Auth APIs](#auth-apis)
6. [Utilities](#utilities)

---

## Quick Start with `ethers.js`

```ts
import { AuthProvider } from '@arcana/auth'
import { ethers } from 'ethers'

const auth = new AuthProvider(`${appAddress}`)

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

---

## Quick Start with `web3.js`

```ts
import { AuthProvider } from '@arcana/auth'
import Web3 from 'web3'

const auth = new AuthProvider(`${appAddress}`)

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

---

## Installation

### NPM/Yarn Install

```sh
npm install --save @arcana/auth
yarn add @arcana/auth
```

### CDN Install

```html
<script src="https://cdn.jsdelivr.net/npm/@arcana/auth"></script>
```

```html
<script src="https://unpkg.com/@arcana/auth"></script>
```

---

## Usage

### Import AuthProvider

```js
const { AuthProvider } = window.arcana.auth // From CDN
// or
import { AuthProvider } from '@arcana/auth' // From npm
```

### Initialize AuthProvider

```ts
import { AuthProvider, AppMode, CHAIN } from '@arcana/auth'

interface ChainConfig {
  chainId: CHAIN
  rpcUrl?: string
}

const auth = new AuthProvider(`${appAddress}`, {
  chainConfig: {
    chainId: CHAIN.POLYGON_MAINNET,
    rpcUrl: '',
  },
})

const position = 'left' // values - 'left' or 'right'

await auth.init({ appMode: AppMode.Widget, position })
```

See [Get Started with Auth SDK](https://docs.dev.arcana.network/docs/auth_qs) for more usage insights.

## Auth API’s

### User Authentication

#### Login

Social login

```js
// loginType - google, discord, twitter, github, twitch
const provider = await auth.loginWithSocial(`${loginType}`)
```

Passwordless login via email Link

```js
const provider = await auth.loginWithLink(`${email}`)
```

Check if a user is logged in

```js
const isloggedIn = await auth.isLoggedIn() // boolean
```

Get user information

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

#### Logout

```js
await auth.logout()
```

### Get Public Key

Get the public key associated with an email.

```js
await auth.getPublicKey(`${email}`)
```

---

## Encryption

### ECIES Encryption

The wallet uses ECIES for decryption of ciphertext so a complementary encryption method has to be used from package `eth-crypto`.

```js
import EthCrypto from 'eth-crypto'

const encrypted = await EthCrypto.encryptWithPublicKey(
  'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...', // publicKey
  'foobar' // message
)
```

See [Auth SDK Reference Guide](https://authsdk-ref-guide.netlify.app/) for details.
