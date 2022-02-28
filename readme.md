# Arcana Wallet
## Initializing

```js

const { WalletProvider } = window.arcana.wallet;

const wallet = new WalletProvider({
  appId: `${appId}`,
  iframeUrl: `${iframeUrl}`
});

await wallet.init();
provider = wallet.getProvider();
```

## Building the code
```js
npm run build
```

## Wallet API’s
Request encryption

```js
WalletProvider
  .encryptWithPublicKey({
    publicKey: "",
  	message: plaintext,
  })
  .then(ciphertext => {
	  // Do something with ciphertext
  });
```

### Trigger login

```js
await wallet.requestLogin("google")
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
provider
  .request({ method: "eth_accounts" })
  .then(accounts => {
    // Set default account to accounts[0]
    from = accounts[0]
  })
```

### eth_sign

```js
provider
  .request({
    method: "eth_sign",
    params: [from, "some_random_data"],
  })
  .then(signature => {
	  // Use signature
  })
```

### personal_sign

```js
provider
  .request({
    method: "personal_sign",
  	params: ["some personal signing data", from],
  })
  .then(personalSignature => {
	  // Use personal signature
  })
```

### eth_getEncryptionPublicKey

```js
provider
  .request({
    method: "eth_getEncryptionPublicKey",
    params: [from],
  })
  .then(publicKey => {
	  // Use public key
  })
```

### eth_decrypt

```js
provider
  .request({
    method: "eth_decrypt",
    params: [ciphertext, from],
  })
  .then(plaintext => {
    // Use plaintext
  })
```

### eth_signTypedData_v4

```js
provider
  .request({
    method: "eth_signTypedData_v4",
    params: [from, msgParams],
  })
  .then(signature => {
    // Use signature
  })
```


## Development

Update `iframeUrl` in `src/index.ts` to your wallet website.