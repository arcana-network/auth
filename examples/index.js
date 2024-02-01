const { AuthProvider } = window.arcana.auth
const { Transaction, TransactionPayload, Account } = window.multiversxSdkCore

let provider
const auth = new AuthProvider('fd9c8ccd8e5f1591c597b0c8167a7f51868b9cbf', {
  network: {
    authUrl: 'http://localhost:8080',
    gatewayUrl: 'https://gateway-dev.arcana.network',
    walletUrl: 'http://localhost:3000',
  },
  theme: 'dark',
})
console.log({ auth })
provider = auth.provider
setHooks()

console.log('Before load')
window.onload = async () => {
  try {
    console.time('auth_init')
    await auth.init()
    console.timeEnd('auth_init')
    console.log('Init auth complete!')
  } catch (e) {
    console.log({ e })
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
  if (value !== '-') {
    resElement.title = value
  }
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
  provider.on('addressChanged', async (params) => {
    console.log({ type: 'addressChanged', params: params })
  })
}

async function logout() {
  console.log('Requesting logout')
  try {
    setRequest('Logout')
    await auth.logout()
    setResult('Logged out')
  } catch (e) {
    console.log({ e })
  }
}

async function addChain() {
  try {
    setRequest('wallet_addEthereumChain')
    const response = await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x1',
          chainName: 'Ethereum',
          blockExplorerUrls: ['https://etherscan.io/'],
          rpcUrls: ['https://rpc.ankr.com/eth'],
          nativeCurrency: {
            symbol: 'ETH',
          },
        },
      ],
    })
    setResult(response)
  } catch (e) {
    console.log({ e })
  }
}

async function showWallet() {
  console.log('Requesting showWallet')
  setRequest('show_wallet')
  await auth.showWallet()
}

async function reconnect() {
  console.log('Requesting showWallet')
  setRequest('reconnect')
  await auth.reconnect()
}

async function canReconnect() {
  console.log('Requesting canReconnect')
  setRequest('can_reconnect')
  const val = await auth.canReconnect()
  console.log({ canReconnect: val })
  setResult(val)
}

async function switchChain() {
  try {
    setRequest('wallet_switchEthereumChain')
    const response = await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '8081',
        },
      ],
    })
    setResult(response)
  } catch (e) {
    console.log({ e })
  }
}

let contractAddress

async function addToken() {
  try {
    setRequest('wallet_watchAsset')
    const response = await provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address:
            contractAddress || '0xB983E01458529665007fF7E0CDdeCDB74B967Eb6',
          symbol: 'FOO',
          decimals: 18,
          image: 'https://foo.io/token-image.svg',
        },
      },
    })
    setResult(response)
  } catch (e) {
    console.log({ e })
  }
}

async function getAccounts() {
  console.log('Requesting accounts')
  try {
    setRequest('getAccounts')
    const accounts = await provider.request({ method: 'getAccounts' })
    console.log({ accounts })
    from = accounts[0]
    setAccount(accounts)
    setResult(JSON.stringify(accounts))
  } catch (e) {
    console.log({ e })
  }
}

async function requestAccounts() {
  console.log('Requesting accounts')
  try {
    setRequest('getAccounts')
    const accounts = await provider.request({ method: 'getAccounts' })
    console.log({ accounts })
    from = accounts[0]
    setAccount(from)
    setResult(JSON.stringify(accounts))
  } catch (e) {
    console.log({ e })
  }
}

async function sign() {
  console.log('Requesting signature')
  setRequest('eth_sign')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }
  const signature = await provider.request({
    method: 'eth_sign',
    params: [from, 'some_random_data'],
  })
  setResult(signature)
  console.log({ signature })
}

async function connect() {
  console.log('Requesting connect wallet')
  setRequest('Connect Wallet')
  try {
    const provider = await auth.connect()
    console.log({ provider })
    setResult('Logged in using connect_wallet')
  } catch (error) {
    console.log({ error })
  }
}

async function getAddressType() {
  console.log('Requesting address type')
  setRequest('getAddressType')
  try {
    const addressType = auth.addressType
    console.log({ addressType })
    setResult(addressType)
  } catch (error) {
    console.log({ error })
  }
}

async function getPrivateKey() {
  try {
    setRequest('_arcana_getPrivateKey')
    const privateKey = await provider.request({
      method: '_arcana_getPrivateKey',
    })
    setResult(privateKey)
  } catch (e) {
    console.log({ e })
    setResult(e)
  }
}

async function socialLogin() {
  try {
    console.log('Requesting login')
    setRequest('Social Login')
    await auth.loginWithSocial('google')
    setResult('Logged in using social login')
  } catch (e) {
    console.log({ e })
  }
}

async function linkLogin() {
  console.log('Requesting passwordlesslogin')
  setRequest('Passwordless Login')
  await auth.loginWithLink('karthik@newfang.io')
  setResult('Logged in using email')
}

async function personalSign() {
  console.log('Requesting personal signature')
  setRequest('mvx_signMessage')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }
  const personalSign = await provider.request({
    method: 'mvx_signMessage',
    params: {
      message: 'food for cats',
      address: from,
    },
  })

  setResult(personalSign.signature)
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
  console.log('Requesting decryption')
  setRequest('eth_decrypt')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }
  if (!ciphertext) {
    return setResult('No ciphertext, ignoring event')
  }
  const plaintext = await provider.request({
    method: 'eth_decrypt',
    params: [ciphertext, from],
  })
  console.log({ plaintext })
  setResult(plaintext)
}

async function sendTransaction() {
  setRequest('mvx_signTransaction')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }

  const params = {
    transaction: {
      gasLimit: 70000,
      sender: from,
      receiver:
        'erd12d5qk7jdxapwa06jxpu4p0cuxvq9325wm5tdy7lcl59dtmev39rs6qhlz4',
      value: '1',
      chainID: 'D',
      data: 'helloWorld',
      version: 1,
    },
  }

  const data = await provider.request({
    method: 'mvx_signTransaction',
    params,
  })

  console.log(data, 'data-data')

  fetch('https://devnet-api.multiversx.com/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then(console.log)
    .catch(console.log)
}

async function signTransaction() {
  setRequest('eth_signTransaction')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }
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
  setRequest('getPublicKey')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }
  const pk = await provider.request({
    method: 'getPublicKey',
    params: [from],
  })
  console.log({ pk })
  setResult(pk)
  publicKey = pk
}

async function getPublicKey() {
  setRequest('getPublicKey')

  console.log('Requesting others public key')
  const pk = await auth.getPublicKey('karthik@newfang.io')
  setResult(pk)

  console.log({ pk })
}

async function signTyped() {
  setRequest('eth_signTypedData_v4')
  if (!from) {
    return setResult('ERROR: Click get accounts to continue')
  }
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

async function deploy() {
  setRequest('Ethers ContractFactory Deploy method')
  const { abi20, byteCode } = await (await fetch('./artifact-lib.json')).json()
  const web3pro = new window.ethers.providers.Web3Provider(provider)
  console.log({ web3pro })
  const signer = await web3pro.getSigner()
  console.log({ signer })
  const cFactory = new window.ethers.ContractFactory(abi20, byteCode, signer)
  console.log({ cFactory })
  const contract = await cFactory.deploy(20000)
  contractAddress = contract.address
  console.log({ contract })
  setResult(contract.address)
}

async function interact() {
  setRequest('Ethers Contract Transfer method')
  if (!contractAddress) {
    return setResult('ERROR: Deploy Contract to interact with it')
  }
  const { abi20 } = await (await fetch('./artifact-lib.json')).json()
  const web3pro = new window.ethers.providers.Web3Provider(provider)
  const signer = await web3pro.getSigner()
  const contract = new window.ethers.Contract(contractAddress, abi20, signer)
  let tx = await contract.transfer(
    '0xd5485e03893854078C4d825C7794162643C38158',
    1
  )
  await tx.wait()
  console.log(await contract.balanceOf(await signer.getAddress()))
  setResult('Balance: ' + (await contract.balanceOf(await signer.getAddress())))
}
