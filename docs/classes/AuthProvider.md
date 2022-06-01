[Auth SDK Reference Guide - v0.0.9-beta5](../README.md) / [Exports](../modules.md) / AuthProvider

# Class: AuthProvider

## Table of contents

### Constructors

- [constructor](AuthProvider.md#constructor)

### Methods

- [getAvailableLogins](AuthProvider.md#getavailablelogins)
- [getPublicKey](AuthProvider.md#getpublickey)
- [getUserInfo](AuthProvider.md#getuserinfo)
- [isLoggedIn](AuthProvider.md#isloggedin)
- [loginWithOtp](AuthProvider.md#loginwithotp)
- [loginWithSocial](AuthProvider.md#loginwithsocial)
- [logout](AuthProvider.md#logout)
- [handleRedirectPage](AuthProvider.md#handleredirectpage)
- [init](AuthProvider.md#init)

## Constructors

### constructor

• **new AuthProvider**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Defined in

[index.ts:71](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L71)

## Methods

### getAvailableLogins

▸ **getAvailableLogins**(): `Promise`<`string`[]\>

A helper method to get list of available logins

#### Returns

`Promise`<`string`[]\>

#### Defined in

[index.ts:182](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L182)

___

### getPublicKey

▸ **getPublicKey**(`input`, `output?`): `Promise`<`string` \| { `x`: `string` ; `y`: `string`  }\>

A method to get public key for other users

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `input` | [`KeystoreInput`](../interfaces/KeystoreInput.md) | `undefined` |
| `output` | [`PublicKeyOutput`](../enums/PublicKeyOutput.md) | `PublicKeyOutput.uncompressed` |

#### Returns

`Promise`<`string` \| { `x`: `string` ; `y`: `string`  }\>

returns object or string based on output option provided

#### Defined in

[index.ts:229](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L229)

___

### getUserInfo

▸ **getUserInfo**(): [`GetInfoOutput`](../interfaces/GetInfoOutput.md)

A method to get user info, if logged in

#### Returns

[`GetInfoOutput`](../interfaces/GetInfoOutput.md)

#### Defined in

[index.ts:190](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L190)

___

### isLoggedIn

▸ **isLoggedIn**(): `boolean`

A helper method to determine whether user is logged in

#### Returns

`boolean`

#### Defined in

[index.ts:206](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L206)

___

### loginWithOtp

▸ **loginWithOtp**(`email`, `options?`): `Promise`<`string` \| `void` \| [`OtpLoginResponse`](../interfaces/OtpLoginResponse.md)\>

A method to trigger passwordless login

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `options` | [`PasswordlessOptions`](../interfaces/PasswordlessOptions.md) |

#### Returns

`Promise`<`string` \| `void` \| [`OtpLoginResponse`](../interfaces/OtpLoginResponse.md)\>

returns OAuth URL if autoRedirect is set to false, object if withUI is set to false

#### Defined in

[index.ts:137](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L137)

___

### loginWithSocial

▸ **loginWithSocial**(`loginType`): `Promise`<`string` \| `void`\>

A method to trigger social login

#### Parameters

| Name | Type |
| :------ | :------ |
| `loginType` | [`SocialLoginType`](../enums/SocialLoginType.md) |

#### Returns

`Promise`<`string` \| `void`\>

returns OAuth URL if autoRedirect is set to false

#### Defined in

[index.ts:93](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L93)

___

### logout

▸ **logout**(): `void`

A method to logout the user

#### Returns

`void`

#### Defined in

[index.ts:214](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L214)

___

### handleRedirectPage

▸ `Static` **handleRedirectPage**(`origin`): `void`

helper function to handle redirect params on popup mode

#### Parameters

| Name | Type |
| :------ | :------ |
| `origin` | `string` |

#### Returns

`void`

#### Defined in

[index.ts:60](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L60)

___

### init

▸ `Static` **init**(`params`): `Promise`<[`AuthProvider`](AuthProvider.md)\>

helper function to initialize the AuthProvider, should be the starting point

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`InitParams`](../interfaces/InitParams.md) |

#### Returns

`Promise`<[`AuthProvider`](AuthProvider.md)\>

#### Defined in

[index.ts:50](https://github.com/arcana-network/auth/blob/ca90bd2/src/index.ts#L50)
