[Wallet SDK Reference Guide - v0.0.5-beta1](../README.md) / [Exports](../modules.md) / WalletProvider

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

## Constructors

### constructor

• **new WalletProvider**(`params?`)

#### Parameters

| Name     | Type                                        |
| :------- | :------------------------------------------ |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:42](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L42)

## Accessors

### provider

• `get` **provider**(): `ArcanaProvider`

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:265](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L265)

## Methods

### getProvider

▸ **getProvider**(): `ArcanaProvider`

A function to get web3 provider

**`deprecated`**

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:257](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L257)

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

[index.ts:69](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L69)

---

### isLoggedIn

▸ **isLoggedIn**(): `Promise`<`boolean`\>

A function to determine whether user is logged in

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.ts:223](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L223)

---

### logout

▸ **logout**(): `Promise`<`void`\>

A function to logout the user

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:234](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L234)

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

[index.ts:200](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L200)

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

[index.ts:245](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L245)

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

[index.ts:185](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L185)

---

### requestUserInfo

▸ **requestUserInfo**(): `Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

A function to get user info for logged in user

#### Returns

`Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

available user info

#### Defined in

[index.ts:212](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L212)
