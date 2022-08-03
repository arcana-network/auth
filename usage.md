# Arcana Auth Usage guide

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

## Advanced Usage

### Initialization

Typically, dApps can initialize the AuthProvider as follows:

```
const auth = new AuthProvider('nn')
```

Here 'nn' refers to the dApp identifier assigned via Arcana Dashboard during new dApp entry creation and registration.

You can utilize the optional AuthProvider initialization parameters. The optional parameters are:

- debug - boolean
- inpageProvider - boolean
- network - [networkConfig](https://authsdk-ref-guide.netlify.app/interfaces/networkconfig)]

The network parameter can take on one of these values:

- [networkConfig](https://authsdk-ref-guide.netlify.app/interfaces/networkconfig)]
- "testnet" (default)
- "dev"

By default, if you do not specify these optional parameters, debug is disabled, inpageProvider is enabled and network is set to "testnet".

Here is an example where AuthProvider is initialized by specifying networkconfig values appropriate for local build, setup and testing of dApps integrating with Arcana Auth SDK:

Note, in this case the AUTH_URL and WALLET_URL point to local deployment of the Auth SDK.

```
const auth = new AuthProvider('nn', {
  network: {
    AUTH_URL: 'http://localhost:3000',
    RPC_URL: 'https://blockchain001-testnet.arcana.network/',
    CHAIN_ID: '0x9dd5',
    NET_VERSION: '40405',
    GATEWAY_URL: 'https://gateway001-testnet.arcana.network',
    WALLET_URL: 'http://localhost:8080',
  },
})
```

If you specify "testnet" as the network, the Auth SDK uses the following network settings by default.

```
const auth = new AuthProvider('nn', {
  network: {
    AUTH_URL: 'https://verify.beta.arcana.network',
    RPC_URL: 'https://blockchain001-testnet.arcana.network/',
    CHAIN_ID: '0x9dd5',
    NET_VERSION: '40405',
    GATEWAY_URL: 'https://gateway001-testnet.arcana.network',
    WALLET_URL: 'https://wallet.beta.arcana.network',
  }
}
```

Similarly, if you specify "dev" as the network, the Auth SDK uses the following network settings:

```
const auth = new AuthProvider('nn', {
  network: {
    AUTH_URL: 'https://verify.dev.arcana.network',
    RPC_URL: 'https://blockchain-dev.arcana.network',
    CHAIN_ID: '0x9dd4',
    NET_VERSION: '40404',
    GATEWAY_URL: 'https://gateway-dev.arcana.network',
    WALLET_URL: 'https://wallet.dev.arcana.network',
  }
}
```
