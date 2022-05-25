[@arcana/wallet](../README.md) / [Exports](../modules.md) / WalletProvider

# Class: WalletProvider

## Table of contents

### Constructors

- [constructor](WalletProvider.md#constructor)

### Accessors

- [provider](WalletProvider.md#provider)

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

• **new WalletProvider**(`params?`)

#### Parameters

| Name     | Type                                        |
| :------- | :------------------------------------------ |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:42](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L42)

## Accessors

### provider

• `get` **provider**(): `ArcanaProvider`

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:251](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L251)

## Methods

### getProvider

▸ **getProvider**(): `ArcanaProvider`

A function to get web3 provider

**`deprecated`**

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:244](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L244)

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

[index.ts:61](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L61)

---

### isLoggedIn

▸ **isLoggedIn**(): `Promise`<`boolean`\>

A function to determine whether user is logged in

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.ts:213](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L213)

---

### logout

▸ **logout**(): `Promise`<`void`\>

A function to logout the user

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:223](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L223)

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

[index.ts:192](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L192)

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

[index.ts:233](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L233)

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

[index.ts:178](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L178)

---

### requestUserInfo

▸ **requestUserInfo**(): `Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

A function to get user info for logged in user

#### Returns

`Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

available user info

#### Defined in

[index.ts:203](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L203)

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

[index.ts:29](https://github.com/arcana-network/wallet/blob/a7c20fa/src/index.ts#L29)
