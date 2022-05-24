[@arcana/wallet](../README.md) / [Exports](../modules.md) / WalletProvider

# Class: WalletProvider

## Table of contents

### Constructors

- [constructor](WalletProvider.md#constructor)

### Methods

- [getProvider](WalletProvider.md#getprovider)
- [init](WalletProvider.md#init)
- [isLoggedIn](WalletProvider.md#isloggedin)
- [logout](WalletProvider.md#logout)
- [requestPasswordlessLogin](WalletProvider.md#requestpasswordlesslogin)
- [requestPublicKey](WalletProvider.md#requestpublickey)
- [requestSocialLogin](WalletProvider.md#requestsociallogin)
- [requestUserInfo](WalletProvider.md#requestuserinfo)
- [encryptWithPublicKey](WalletProvider.md#encryptwithpublickey)

## Constructors

### constructor

• **new WalletProvider**(`params`)

#### Parameters

| Name     | Type                                        |
| :------- | :------------------------------------------ |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:41](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L41)

## Methods

### getProvider

▸ **getProvider**(): `ArcanaProvider`

A function to get web3 provider

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:234](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L234)

---

### init

▸ **init**(`input`): `Promise`<`void`\>

A function to initialize the wallet, should be called before getting provider

#### Parameters

| Name    | Type                                      |
| :------ | :---------------------------------------- |
| `input` | [`InitInput`](../interfaces/InitInput.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:51](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L51)

---

### isLoggedIn

▸ **isLoggedIn**(): `Promise`<`boolean`\>

A function to determine whether user is logged in

#### Returns

`Promise`<`boolean`\>

true or false

#### Defined in

[index.ts:204](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L204)

---

### logout

▸ **logout**(): `Promise`<`void`\>

A function to logout the user

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:214](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L214)

---

### requestPasswordlessLogin

▸ **requestPasswordlessLogin**(`email`): `Promise`<`string`\>

A function to trigger passwordless login in the wallet

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `email` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[index.ts:182](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L182)

---

### requestPublicKey

▸ **requestPublicKey**(`email`, `verifier?`): `Promise`<`string`\>

A function to request public key of different users

#### Parameters

| Name       | Type     | Default value |
| :--------- | :------- | :------------ |
| `email`    | `string` | `undefined`   |
| `verifier` | `string` | `'google'`    |

#### Returns

`Promise`<`string`\>

#### Defined in

[index.ts:224](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L224)

---

### requestSocialLogin

▸ **requestSocialLogin**(`loginType`): `Promise`<`void`\>

A function to trigger social login in the wallet

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `loginType` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:168](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L168)

---

### requestUserInfo

▸ **requestUserInfo**(): `Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

A function to get user info for logged in user

#### Returns

`Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

available user info

#### Defined in

[index.ts:193](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L193)

---

### encryptWithPublicKey

▸ `Static` **encryptWithPublicKey**(`input`): `Promise`<`string`\>

A helper function to encrypt supplied message with supplied public key

#### Parameters

| Name    | Type                                            |
| :------ | :---------------------------------------------- |
| `input` | [`EncryptInput`](../interfaces/EncryptInput.md) |

#### Returns

`Promise`<`string`\>

ciphertext of the message

#### Defined in

[index.ts:28](https://github.com/arcana-network/wallet/blob/e97339a/src/index.ts#L28)
