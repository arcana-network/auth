[Auth SDK Reference Guide - v0.0.9-beta8](../README.md) / [Exports](../modules.md) / AuthProvider

# Class: AuthProvider

## Table of contents

### Constructors

- [constructor](AuthProvider.md#constructor)

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

• **new AuthProvider**(`appId`, `p?`)

#### Parameters

| Name    | Type                                        |
| :------ | :------------------------------------------ |
| `appId` | `string`                                    |
| `p?`    | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:65](https://github.com/arcana-network/auth/blob/main/src/index.ts#L65)

## Methods

### getProvider

▸ **getProvider**(): `ArcanaProvider`

A function to get web3 provider

**`deprecated`** use .provider instead

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:192](https://github.com/arcana-network/auth/blob/main/src/index.ts#L192)

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

[index.ts:180](https://github.com/arcana-network/auth/blob/main/src/index.ts#L180)

---

### getUser

▸ **getUser**(): `Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

A function to get user info for logged in user

#### Returns

`Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

available user info

#### Defined in

[index.ts:147](https://github.com/arcana-network/auth/blob/main/src/index.ts#L147)

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

[index.ts:92](https://github.com/arcana-network/auth/blob/main/src/index.ts#L92)

---

### isLoggedIn

▸ **isLoggedIn**(): `Promise`<`boolean`\>

A function to determine whether user is logged in

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.ts:158](https://github.com/arcana-network/auth/blob/main/src/index.ts#L158)

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

[index.ts:133](https://github.com/arcana-network/auth/blob/main/src/index.ts#L133)

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

[index.ts:120](https://github.com/arcana-network/auth/blob/main/src/index.ts#L120)

---

### logout

▸ **logout**(): `Promise`<`void`\>

A function to logout the user

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:169](https://github.com/arcana-network/auth/blob/main/src/index.ts#L169)
