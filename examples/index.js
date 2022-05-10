const { WalletProvider } = window.arcana.wallet
const wallet = new WalletProvider({
  appId: '20',
  iframeUrl: 'http://localhost:3000',
})

let provider

window.onload = async () => {
  console.log('Init wallet')
  try {
    await wallet.init(themeConfig)
    provider = wallet.getProvider()
    const connected = await wallet.isLoggedIn()
    console.log({ connected })
    setHooks()
  } catch (e) {
    console.log({ e })
  }
}

const themeConfig = {
  assets: {
    logo: {
      dark: {
        horizontal: './assets/images/logo-horizontal-dark.png',
        vertical: './assets/images/logo-vertical-dark.png',
      },
      light: {
        horizontal: './assets/images/logo-horizontal-light.png',
        vertical: './assets/images/logo-vertical-light.png',
      },
    },
  },
  theme: 'dark',
}

// get from eth_accounts
let from = ''

console.log({ wallet })
const triggerLoginBtn = document.getElementById('trigger-login')
const triggerPasswordlessLoginBtn = document.getElementById('trigger-p-login')
const getPublicBtn = document.getElementById('get-public')
const getOthersPublicBtn = document.getElementById('get-other-public')
const encryptBtn = document.getElementById('encrypt')
const requestSignatureBtn = document.getElementById('request-signature')
const requestDecryptBtn = document.getElementById('request-decryption')
const requestTypedSignatureBtn = document.getElementById(
  'request-typed-signature'
)
const requestPersonalSignatureBtn = document.getElementById(
  'request-personal-signature'
)
const getAccountsBtn = document.getElementById('get-accounts')
const logoutBtn = document.getElementById('logout')

function setHooks() {
  provider.on('connect', async (params) => {
    console.log({ type: 'connect', params: params })
    const isLoggedIn = await wallet.isLoggedIn()
    console.log({ isLoggedIn })
  })
  provider.on('accountsChanged', (params) => {
    console.log({ type: 'accountsChanged', params: params })
  })
  provider.on('chainChanged', async (params) => {
    console.log({ type: 'chainChanged', params: params })
  })
}

logoutBtn.addEventListener('click', async () => {
  console.log('Requesting logout')
  try {
    await wallet.logout()
  } catch (e) {
    console.log({ e })
  }
})
getAccountsBtn.addEventListener('click', async () => {
  console.log('Requesting accounts')
  try {
    const accounts = await provider.request({ method: 'eth_accounts' })
    console.log({ accounts })
    from = accounts[0]
  } catch (e) {
    console.log({ e })
  }
})

requestSignatureBtn.addEventListener('click', async () => {
  console.log('Requesting signature')
  const signature = await provider.request({
    method: 'eth_sign',
    params: [from, 'some_random_data'],
  })
  console.log({ signature })
})

triggerLoginBtn.addEventListener('click', async () => {
  console.log('Requesting login')
  await wallet.requestSocialLogin('google')
  // console.log({ signature });
})
triggerPasswordlessLoginBtn.addEventListener('click', async () => {
  console.log('Requesting passwordlesslogin')
  await wallet.requestPasswordlessLogin('makyl@newfang.io')
  // console.log({ signature });
})

requestPersonalSignatureBtn.addEventListener('click', async () => {
  console.log('Requesting personal signature')
  const personalSign = await provider.request({
    method: 'personal_sign',
    params: ['some personal data', from],
  })
  console.log({ personalSign })
})

let plaintext = 'I am a plaintext!'
let ciphertext
let publicKey
encryptBtn.addEventListener('click', async () => {
  console.log('Doing encryption')
  const c = await WalletProvider.encryptWithPublicKey({
    publicKey,
    message: plaintext,
  })

  console.log({ ciphertext: c })
  ciphertext = c
})

getPublicBtn.addEventListener('click', async () => {
  console.log('Requesting public key')
  const pk = await provider.request({
    method: 'eth_getEncryptionPublicKey',
    params: [from],
  })
  console.log({ pk })
  publicKey = pk
})

getOthersPublicBtn.addEventListener('click', async () => {
  console.log('Requesting others public key')
  const pk = await wallet.requestPublicKey('makyl@newfang.io', 'google')
  console.log({ pk })
  publicKey = pk
})

requestDecryptBtn.addEventListener('click', async () => {
  console.log('Requesting decryption')
  const plaintext = await provider.request({
    method: 'eth_decrypt',
    params: [ciphertext, from],
  })
  console.log({ plaintext })
})

requestTypedSignatureBtn.addEventListener('click', async () => {
  console.log('Requesting typed signature')
  const typedSign = await provider.request({
    method: 'eth_signTypedData_v4',
    params: [from, msgParams],
  })
  console.log({ typedSign })
})

const msgParams = JSON.stringify({
  domain: {
    // Defining the chain aka Rinkeby testnet or Ethereum Main Net
    chainId: 1,
    // Give a user friendly name to the specific contract you are signing for.
    name: 'Ether Mail',
    // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    // Just let's you know the latest version. Definitely make sure the field name is correct.
    version: '1',
  },

  // Defining the message signing data content.
  message: {
    /*
     - Anything you want. Just a JSON Blob that encodes the data you want to send
     - No required fields
     - This is DApp Specific
     - Be as explicit as possible when building out the message schema.
    */
    contents: 'Hello, Bob!',
    attachedMoneyInEth: 4.2,
    from: {
      name: 'Cow',
      wallets: [
        '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
      ],
    },
    to: [
      {
        name: 'Bob',
        wallets: [
          '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
          '0xB0B0b0b0b0b0B000000000000000000000000000',
        ],
      },
    ],
  },
  // Refers to the keys of the *types* object below.
  primaryType: 'Mail',
  types: {
    // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    // Not an EIP712Domain definition
    Group: [
      { name: 'name', type: 'string' },
      { name: 'members', type: 'Person[]' },
    ],
    // Refer to PrimaryType
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person[]' },
      { name: 'contents', type: 'string' },
    ],
    // Not an EIP712Domain definition
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallets', type: 'address[]' },
    ],
  },
})
