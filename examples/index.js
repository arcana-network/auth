console.log(window);

const { WalletProvider } = window.arcana.wallet;
const wallet = new WalletProvider({
  appId: "20",
});

// get from eth_accounts
let from = "";

console.log({ wallet });
const initWalletBtn = document.getElementById("init-wallet");
const triggerLoginBtn = document.getElementById("trigger-login");
const getPublicBtn = document.getElementById("get-public");
const encryptBtn = document.getElementById("encrypt");
const requestSignatureBtn = document.getElementById("request-signature");
const requestDecryptBtn = document.getElementById("request-decryption");
const sendTransactionBtn = document.getElementById("send-transaction");
const requestTypedSignatureBtn = document.getElementById(
  "request-typed-signature"
);
const requestPersonalSignatureBtn = document.getElementById(
  "request-personal-signature"
);
const requestTransactionSignatureBtn = document.getElementById(
  "request-transaction-signature"
);
const getAccountsBtn = document.getElementById("get-accounts");
// const requestEncryptionBtn = document.getElementById("request-encryption");
let provider;
initWalletBtn.addEventListener("click", async () => {
  console.log("Init wallet");
  try {
    await wallet.init();
    provider = wallet.getProvider();
    const connected = await provider.isConnected();
    console.log({ connected });
    setHooks();
  } catch (e) {
    console.log({ e });
  }
});

function setHooks() {
  provider.on("connect", async (params) => {
    console.log({ type: "connect", params: params });
    const connected = await provider.isConnected();
    console.log({ connected });
  });
  provider.on("accountsChanged", (params) => {
    console.log({ type: "accountsChanged", params: params });
  });
  provider.on("chainChanged", async (params) => {
    console.log({ type: "chainChanged", params: params });
  });
}

getAccountsBtn.addEventListener("click", async () => {
  console.log("Requesting accounts");
  try {
    const accounts = await provider.request({ method: "eth_accounts" });
    console.log({ accounts });
    from = accounts[0];
  } catch (e) {
    console.log({ e });
  }
});

requestSignatureBtn.addEventListener("click", async () => {
  console.log("Requesting signature");
  const signature = await provider.request({
    method: "eth_sign",
    params: [from, "some_random_data"],
  });
  console.log({ signature });
});

triggerLoginBtn.addEventListener("click", async () => {
  console.log("Requesting login");
  await wallet.requestLogin("google");
  // console.log({ signature });
});

requestPersonalSignatureBtn.addEventListener("click", async () => {
  console.log("Requesting personal signature");
  const personalSign = await provider.request({
    method: "personal_sign",
    params: ["some personal data", from],
  });
  console.log({ personalSign });
});

let plaintext = "I am a plaintext!";
let ciphertext;
let publicKey;
encryptBtn.addEventListener("click", async () => {
  console.log("Doing encryption");
  const c = await WalletProvider.encryptWithPublicKey({
    publicKey,
    message: plaintext,
  });

  console.log({ ciphertext: c });
  ciphertext = c;
});

getPublicBtn.addEventListener("click", async () => {
  console.log("Requesting public key");
  const pk = await provider.request({
    method: "eth_getEncryptionPublicKey",
    params: [from],
  });
  console.log({ pk });
  publicKey = pk;
});

requestDecryptBtn.addEventListener("click", async () => {
  console.log("Requesting decryption");
  const plaintext = await provider.request({
    method: "eth_decrypt",
    params: [ciphertext, from],
  });
  console.log({ plaintext });
});

requestTypedSignatureBtn.addEventListener("click", async () => {
  console.log("Requesting typed signature");
  const typedSign = await provider.request({
    method: "eth_signTypedData_v4",
    params: [from, msgParams],
  });
  console.log({ typedSign });
});
sendTransactionBtn.addEventListener("click", async () => {
  console.log("Requesting send transaction");
  const plaintext = await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        nonce: "0x00", // ignored by MetaMask
        gasPrice: "0x09184e72a000", // customizable by user during MetaMask confirmation.
        gas: "0x2710", // customizable by user during MetaMask confirmation.
        to: "0x0000000000000000000000000000000000000000", // Required except during contract publications.
        from, // must match user's active address.
        value: "0x00", // Only required to send ether to the recipient from the initiating external account.
        data:
          "0x7f7465737432000000000000000000000000000000000000000000000000000000600057", // Optional, but used for defining smart contract creation and interaction.
      },
    ],
  });
  console.log({ plaintext });
});

requestTransactionSignatureBtn.addEventListener("click", async () => {
  console.log("Requesting transaction signature");
  const signature = await provider.request({
    method: "eth_signTransaction",
    params: [
      {
        from,
        gasPrice: "20000000000",
        gas: "21000",
        to: "0x3535353535353535353535353535353535353535",
        value: "1000000000000000000",
        data: "",
      },
    ],
  });
  console.log({ transactionSignature: signature });
});

const msgParams = JSON.stringify({
  domain: {
    // Defining the chain aka Rinkeby testnet or Ethereum Main Net
    chainId: 1,
    // Give a user friendly name to the specific contract you are signing for.
    name: "Ether Mail",
    // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    // Just let's you know the latest version. Definitely make sure the field name is correct.
    version: "1",
  },

  // Defining the message signing data content.
  message: {
    /*
     - Anything you want. Just a JSON Blob that encodes the data you want to send
     - No required fields
     - This is DApp Specific
     - Be as explicit as possible when building out the message schema.
    */
    contents: "Hello, Bob!",
    attachedMoneyInEth: 4.2,
    from: {
      name: "Cow",
      wallets: [
        "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
      ],
    },
    to: [
      {
        name: "Bob",
        wallets: [
          "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
          "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
          "0xB0B0b0b0b0b0B000000000000000000000000000",
        ],
      },
    ],
  },
  // Refers to the keys of the *types* object below.
  primaryType: "Mail",
  types: {
    // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    // Not an EIP712Domain definition
    Group: [
      { name: "name", type: "string" },
      { name: "members", type: "Person[]" },
    ],
    // Refer to PrimaryType
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person[]" },
      { name: "contents", type: "string" },
    ],
    // Not an EIP712Domain definition
    Person: [
      { name: "name", type: "string" },
      { name: "wallets", type: "address[]" },
    ],
  },
});
