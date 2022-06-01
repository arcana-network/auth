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

## Constructors

### constructor

• **new WalletProvider**(`params?`)

#### Parameters

| Name     | Type                                        |
| :------- | :------------------------------------------ |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:36](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L36)

## Accessors

### provider

• `get` **provider**(): `ArcanaProvider`

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:259](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L259)

## Methods

### getProvider

▸ **getProvider**(): `ArcanaProvider`

A function to get web3 provider

**`deprecated`**

#### Returns

`ArcanaProvider`

#### Defined in

[index.ts:251](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L251)

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

[index.ts:63](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L63)

---

### isLoggedIn

▸ **isLoggedIn**(): `Promise`<`boolean`\>

A function to determine whether user is logged in

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.ts:217](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L217)

---

### logout

▸ **logout**(): `Promise`<`void`\>

A function to logout the user

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:228](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L228)

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

[index.ts:194](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L194)

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

[index.ts:239](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L239)

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

[index.ts:179](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L179)

---

### requestUserInfo

▸ **requestUserInfo**(): `Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

A function to get user info for logged in user

#### Returns

`Promise`<[`UserInfo`](../interfaces/UserInfo.md)\>

available user info

#### Defined in

[index.ts:206](https://github.com/arcana-network/wallet/blob/fc05803/src/index.ts#L206)
