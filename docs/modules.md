[Auth SDK Reference Guide - v0.0.9-beta8](README.md) / Exports

# Auth SDK Reference Guide - v0.0.9-beta8

## Table of contents

### Enumerations

- [AppMode](enums/AppMode.md)

### Classes

- [AuthProvider](classes/AuthProvider.md)

### Interfaces

- [AppConfig](interfaces/AppConfig.md)
- [EncryptInput](interfaces/EncryptInput.md)
- [InitInput](interfaces/InitInput.md)
- [InitParams](interfaces/InitParams.md)
- [NetworkConfig](interfaces/NetworkConfig.md)
- [ThemeConfig](interfaces/ThemeConfig.md)
- [UserInfo](interfaces/UserInfo.md)

### Type Aliases

- [Position](modules.md#position)
- [Theme](modules.md#theme)

### Functions

- [computeAddress](modules.md#computeaddress)
- [encryptWithPublicKey](modules.md#encryptwithpublickey)

## Type Aliases

### Position

Ƭ **Position**: `"right"` \| `"left"`

#### Defined in

[typings.ts:7](https://github.com/arcana-network/auth/blob/main/src/typings.ts#L7)

---

### Theme

Ƭ **Theme**: `"light"` \| `"dark"`

#### Defined in

[typings.ts:3](https://github.com/arcana-network/auth/blob/main/src/typings.ts#L3)

## Functions

### computeAddress

▸ **computeAddress**(`publicKey`): `string`

A function to compute address from public key

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `publicKey` | `string` |

#### Returns

`string`

#### Defined in

[utils.ts:160](https://github.com/arcana-network/auth/blob/main/src/utils.ts#L160)

---

### encryptWithPublicKey

▸ **encryptWithPublicKey**(`input`): `Promise`<`string`\>

A function to ECIES encrypt message using public key

#### Parameters

| Name    | Type                                         |
| :------ | :------------------------------------------- |
| `input` | [`EncryptInput`](interfaces/EncryptInput.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[utils.ts:149](https://github.com/arcana-network/auth/blob/main/src/utils.ts#L149)
