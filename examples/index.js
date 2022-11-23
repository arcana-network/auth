const { AuthProvider } = window.arcana.auth

let provider
const auth = new AuthProvider('...')

window.onload = async () => {
  try {
    console.time('auth_init')
    await auth.init()
    console.timeEnd('auth_init')
    provider = auth.provider
    console.log('Init auth complete!')
    setHooks()
  } catch (e) {
    console.log({ e })
    console.log(e)
  }
}

const reqElement = document.getElementById('request')
const resElement = document.getElementById('result')
const accElement = document.getElementById('account')

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

// get from eth_accounts
let from = ''

function setHooks() {
  provider.on('connect', async (params) => {
    console.log({ type: 'connect', params: params })
  })
  provider.on('accountsChanged', (params) => {
    console.log({ type: 'accountsChanged', params: params })
  })
  provider.on('chainChanged', async (params) => {
    console.log({ type: 'chainChanged', params: params })
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

async function addChain() {
  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x64',
          chainName: 'Ethereum',
          blockExplorerUrls: ['https://etherscan.io/'],
          rpcUrls: ['https://cloudflare-eth.com/'],
          nativeCurrency: {
            symbol: 'ETH',
          },
        },
      ],
    })
  } catch (e) {
    console.log({ e })
  }
}

async function switchChain() {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x64',
        },
      ],
    })
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

async function connect() {
  console.log('Requesting connect wallet')
  setRequest('connect_wallet')
  try {
    const provider = await auth.connect()
    console.log({ provider })
  } catch (error) {
    console.log({ error })
  }
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
  // console.log('Doing encryption')
  // setRequest('encrypt')
  // const c = await encryptWithPublicKey({
  //   publicKey,
  //   message: plaintext,
  // })
  // setResult(c)
  // console.log({ ciphertext: c })
  // ciphertext = c
}

async function ethDecrypt() {
  if (!ciphertext) {
    setResult('No ciphertext, ignoring event')
    return
  }
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
