# Arcana Auth Usage Guide

**Contents**

1. [Installation](#installation)
2. [Quick Start with `ethers.js`](#quick-start-with-ethersjs)
3. [Quick Start with `web3.js`](#quick-start-with-web3js)
4. [Usage](#usage)
   - [AuthProvider](#authprovider)
   - [Auth APIs](#auth-apis)
   - [Arcana Wallet Method](#arcana-wallet-methods)

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

## Quick Start with `ethers.js`

```ts
import { AuthProvider } from '@arcana/auth'
import { ethers } from 'ethers'

const auth = new AuthProvider(`${clientId}`)

window.onload = async () => {
  try {
    await auth.init()

    const arcanaProvider = await auth.connect()
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

const auth = new AuthProvider(`${clientId}`)

window.onload = async () => {
  try {
    await auth.init()

    const arcanaProvider = await auth.connect()
    const provider = new Web3(arcanaProvider)

    await provider.getBlockNumber()
  } catch (e) {
    // log error
  }
}
```

---

## Usage

### AuthProvider

#### Import AuthProvider

```js
const { AuthProvider } = window.arcana.auth // From CDN
// or
import { AuthProvider } from '@arcana/auth' // From npm
```

#### Initialize AuthProvider

```ts
import { AuthProvider } from '@arcana/auth'

const auth = new AuthProvider(`${clientId}`, {
  position: 'left', // default - right
  theme: 'light', // default - dark
  alwaysVisible: false, // default - true
  setWindowProvider: true, // default - false
  connectOptions: {
    compact: true, // default - false
  },
})

await auth.init()
```

See [Get Started with Auth SDK](https://docs.dev.arcana.network/walletsdk/wallet_qs.html) for more Auth SDK usage insights.

### Auth APIs

#### Plug and Play Authentication

The size of the connect modal can be changed by setting `connectOptions.compact` to true or false

```js
const provider = await auth.connect()
```

#### Login

Social login

```js
// loginType - Google, Discord, Twitter, GitHub, Twitch
const provider = await auth.loginWithSocial(`${loginType}`)
```

[DEPRECATED] Passwordless login via an email verification link

```js
const provider = await auth.loginWithLink(`${email}`)
```

Passwordless login via an OTP

```js
const login = await auth.loginWithOTPStart(`${email}`)
await login.begin()

if(login.isCompleteRequired) {
  await loginWithOTPComplete(`${otp}`, onMFARequired() => {
    // Hide overlay(if used) so that user can recover device share via wallet ui
  })
}
```

Check if a user is logged in

```js
const isloggedIn = await auth.isLoggedIn() // boolean
```

Check and reconnect, if required, within a 30-minute window after logout.

```js
// canReconnect can be used to conditionally render connect or reconnect button
const canReconnect = await auth.canReconnect()
if (canReconnect) {
  // auth.reconnect() should be on a click event since it opens in a new tab
  await auth.reconnect()
}
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

Show wallet UI

```js
auth.showWallet()
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

### Encryption

#### ECIES Encryption

The wallet uses ECIES to decrypt cipher text, so a complementary encryption method has to be used from package `eth-crypto`.

```js
import EthCrypto from 'eth-crypto'

const encrypted = await EthCrypto.encryptWithPublicKey(
  'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...', // publicKey
  'foobar' // message
)
```

---

## Arcana Wallet Methods

Arcana wallet is an embedded Web3 wallet offered via the Auth SDK. It uses [Ethereum JSON-RPC](https://ethereum.github.io/execution-apis/api-documentation/) to interact with the blockchains.

### JSON RPC Support

Arcana wallet implements the following common interfaces exposed by all Ethereum clients:

- [eth_accounts](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
- [eth_getBalance](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
- [eth_sendTransaction](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
- [eth_sign](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_signtransaction)
- [eth_call](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)

### Switching Chains

#### `wallet_addEthereumChain`

This method is specified by [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085).

```ts
try {
  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0xABCDEF',
      chainName: 'My Custom Chain',
      rpcUrls: ['...']
    }]
  })
} catch(error) {
  ...
}

interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

```

#### `wallet_switchEthereumChain`

This method is specified by [EIP-3326](https://eips.ethereum.org/EIPS/eip-3326).

```ts
try {
  await provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xf00' }],
  });
} catch(error) {
  ...
}

interface SwitchEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
}
```

If the error code (error.code) is 4902, then the requested chain has not been added, and you have to request to add it via `wallet_addEthereumChain`.

### Track New Assets

#### `wallet_watchAsset`

This method is specified by [EIP-747](https://eips.ethereum.org/EIPS/eip-747).

```ts
await provider.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC20',
    options: {
      address: '0xB983E01458529665007fF7E0CDdeCDB74B967Eb6',
      symbol: 'FOO',
      decimals: 18,
      image: 'https://foo.io/token-image.svg',
    },
  },
})
```

Check out [Auth SDK Reference Guide](https://authsdk-ref-guide.netlify.app/) for details.
