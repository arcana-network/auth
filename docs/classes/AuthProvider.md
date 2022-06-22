[Wallet SDK Reference Guide - v0.0.9-beta5](../README.md) / [Exports](../modules.md) / AuthProvider

# Class: AuthProvider

## Table of contents

### Constructors

- [constructor](AuthProvider.md#constructor)

### Accessors

- [provider](AuthProvider.md#provider)

### Methods

- [getProvider](AuthProvider.md#getprovider)
- [getPublicKey](AuthProvider.md#getpublickey)
- [getUser](AuthProvider.md#getuser)
- [init](AuthProvider.md#init)
- [isLoggedIn](AuthProvider.md#isloggedin)
- [loginWithLink](AuthProvider.md#loginwithlink)
- [loginWithSocial](AuthProvider.md#loginwithsocial)
- [logout](AuthProvider.md#logout)

## Constructors

### constructor

• **new AuthProvider**(`appId`, `params?`)

#### Parameters

| Name     | Type                                        |
| :------- | :------------------------------------------ |
| `appId`  | `string`                                    |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:46](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L46)

## Accessors

### provider

• `get` **provider**(): `ArcanaProvider`

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:222](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L222)

## Methods

### getProvider

▸ **getProvider**(): `ArcanaProvider`

A function to get web3 provider

**`deprecated`** use .provider instead

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:180](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L180)

---

### getPublicKey

▸ **getPublicKey**(`email`): `Promise`<`string`\>

A function to request public key of different users

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `email` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[index.ts:168](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L168)

---

### getUser

▸ **getUser**(): `Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

A function to get user info for logged in user

#### Returns

`Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

available user info

#### Defined in

[index.ts:135](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L135)

---

### init

▸ **init**(`input?`): `Promise`<`void`\>

A function to initialize the wallet, should be called before getting provider

#### Parameters

| Name    | Type                                      |
| :------ | :---------------------------------------- |
| `input` | [`InitInput`](../interfaces/InitInput.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:79](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L79)

---

### isLoggedIn

▸ **isLoggedIn**(): `Promise`<`boolean`\>

A function to determine whether user is logged in

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.ts:146](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L146)

---

### loginWithLink

▸ **loginWithLink**(`email`): `Promise`<`void`\>

A function to trigger passwordless login in the wallet

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `email` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:121](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L121)

---

### loginWithSocial

▸ **loginWithSocial**(`loginType`): `Promise`<`void`\>

A function to trigger social login in the wallet

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `loginType` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:108](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L108)

---

### logout

▸ **logout**(): `Promise`<`void`\>

A function to logout the user

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:157](https://github.com/arcana-network/wallet/blob/6f4dd20/src/index.ts#L157)
