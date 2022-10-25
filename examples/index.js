const { AuthProvider, AppMode, encryptWithPublicKey } = window.arcana.auth

const auth = new AuthProvider('43')
let provider
let chainIdToChange = null

const addNetworkInfo = {
  networkName: '',
  rpcUrls: [],
  chainId: '',
  explorerUrls: [],
  nativeCurrency: {
    currencySymbol: '',
  },
}

const reqElement = document.getElementById('request')
const resElement = document.getElementById('result')
const accElement = document.getElementById('account')
const selectNetworkElement = document.getElementById('select-network')
selectNetworkElement.addEventListener('input', (evt) => {
  chainIdToChange = evt.target.value
})
const switchNetworkBtn = document.getElementById('switch-chain')
switchNetworkBtn.addEventListener('click', switchChain)

const networkNameInput = document.getElementById('networkName')
const rpcUrlInput = document.getElementById('rpcUrl')
const currencySymbolInput = document.getElementById('currencySymbol')
const chainIdInput = document.getElementById('chainId')
const explorerUrlInput = document.getElementById('explorerUrl')
const addNetworkFormEl = document.getElementById('add-network-form')

addNetworkFormEl.addEventListener('submit', addNetwork)

networkNameInput.addEventListener('input', (evt) => {
  networkInfoInput('networkName', evt.target.value)
})

rpcUrlInput.addEventListener('input', (evt) => {
  networkInfoInput('rpcUrls', evt.target.value)
})

currencySymbolInput.addEventListener('input', (evt) => {
  networkInfoInput('currencySymbol', evt.target.value)
})

chainIdInput.addEventListener('input', (evt) => {
  networkInfoInput('chainId', evt.target.value)
})

explorerUrlInput.addEventListener('input', (evt) => {
  networkInfoInput('explorerUrls', evt.target.value)
  console.log({ addNetworkInfo })
})

function networkInfoInput(type, val) {
  if (type === 'currencySymbol') {
    addNetworkInfo.nativeCurrency[type] = val
  } else if (type === 'rpcUrls' || type === 'explorerUrls') {
    addNetworkInfo[type].push(val)
  } else {
    addNetworkInfo[type] = val
  }
}

function setRequest(value) {
  reqElement.innerText = value
  setResult('-')
}
function setResult(value) {
  resElement.innerText = value
}
function setAccount(value) {
  accElement.innerText = value
}

window.onload = async () => {
  console.log('Init wallet')
  const position = 'right'
  try {
    await auth.init({ appMode: AppMode.Full, position })
    provider = auth.provider
    const connected = await auth.isLoggedIn()
    console.log({ connected })
    setHooks()
  } catch (e) {
    console.log({ e })
    console.log(e)
  }
}

// get from eth_accounts
let from = ''

function setHooks() {
  provider.on('connect', async (params) => {
    console.log({ type: 'connect', params: params })
    const isLoggedIn = await auth.isLoggedIn()
    console.log({ isLoggedIn })
  })
  provider.on('accountsChanged', (params) => {
    console.log({ type: 'accountsChanged', params: params })
  })
  provider.on('chainChanged', async (params) => {
    console.log({ type: 'chainChanged', params: params })
  })
  provider.on('disconnect', async (params) => {
    console.log({ type: 'disconnect', params: params })
  })
}

async function logout() {
  console.log('Requesting logout')
  try {
    await auth.logout()
  } catch (e) {
    console.log({ e })
  }
}

async function getAccounts() {
  console.log('Requesting accounts')
  try {
    setRequest('eth_accounts')
    const accounts = await provider.request({ method: 'eth_accounts' })
    console.log({ accounts })
    from = accounts[0]
    setAccount(from)
    setResult(from)
  } catch (e) {
    console.log(e)
    console.log({ e })
  }
}

async function switchChain() {
  console.log(chainIdToChange, 'switchChain')
  try {
    setRequest('wallet_switchEthereumChain')
    const response = await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdToChange }],
    })
    console.log({ response })
  } catch (e) {
    console.log(e)
    console.log({ e })
  }
}

async function addNetwork(event) {
  event.preventDefault()
  try {
    setRequest('wallet_addEthereumChain')
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{ networkInfo: addNetworkInfo }],
    })
  } catch (e) {
    console.log(e)
    console.log({ e })
  }
  return false
}

async function sign() {
  console.log('Requesting signature')
  setRequest('eth_sign')
  const signature = await provider.request({
    method: 'eth_sign',
    params: [from, 'some_random_data'],
  })
  setResult(signature)
  console.log({ signature })
}

async function socialLogin() {
  console.log('Requesting login')
  setRequest('social_login')
  await auth.loginWithSocial('google')
}
async function linkLogin() {
  console.log('Requesting passwordlesslogin')
  setRequest('link_login')
  await auth.loginWithLink('makyl@newfang.io')
}

async function personalSign() {
  console.log('Requesting personal signature')
  setRequest('personal_sign')

  const personalSign = await provider.request({
    method: 'personal_sign',
    params: ['0', from],
  })

  setResult(personalSign)
  console.log({ personalSign })
}

let plaintext = 'I am a plaintext!'
let ciphertext
let publicKey

async function encrypt() {
  console.log('Doing encryption')
  setRequest('encrypt')

  const c = await encryptWithPublicKey({
    publicKey,
    message: plaintext,
  })
  setResult(c)
  console.log({ ciphertext: c })
  ciphertext = c
}

async function ethDecrypt() {
  console.log('Requesting decryption')
  setRequest('eth_decrypt')

  const plaintext = await provider.request({
    method: 'eth_decrypt',
    params: [ciphertext, from],
  })
  console.log({ plaintext })
  setResult(plaintext)
}

async function sendTransaction() {
  try {
    setRequest('eth_sendTransaction')

    const hash = await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          gasPrice: 0,
          to: '0xE28F01Cf69f27Ee17e552bFDFB7ff301ca07e780',
          value: '0x0de0b6b3a7640000',
        },
      ],
    })
    setResult(hash)
    console.log({ hash })
  } catch (e) {
    console.log(e)
  }
}
async function signTransaction() {
  setRequest('eth_signTransaction')

  const sig = await provider.request({
    method: 'eth_signTransaction',
    params: [
      {
        from,
        gasPrice: 0,
        to: '0xE28F01Cf69f27Ee17e552bFDFB7ff301ca07e780',
        value: '0x0de0b6b3a7640000',
      },
    ],
  })
  setResult(sig)

  console.log({ sig })
}

async function getSelfPublicKey() {
  console.log('Requesting public key')
  setRequest('eth_getEncryptionPublicKey')

  const pk = await provider.request({
    method: 'eth_getEncryptionPublicKey',
    params: [from],
  })
  console.log({ pk })
  setResult(pk)
  publicKey = pk
}

async function getPublicKey() {
  setRequest('getPublicKey')

  console.log('Requesting others public key')
  const pk = await auth.getPublicKey('makyl@newfang.io')
  setResult(pk)

  console.log({ pk })
}

async function signTyped() {
  setRequest('eth_signTypedData_v4')

  console.log('Requesting typed signature')
  const typedSign = await provider.request({
    method: 'eth_signTypedData_v4',
    params: [from, msgParams],
  })

  setResult(typedSign)

  console.log({ typedSign })
}

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
