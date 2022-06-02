[Wallet SDK Reference Guide - v0.0.5-beta1](README.md) / Exports

# Wallet SDK Reference Guide - v0.0.5-beta1

## Table of contents

### Enumerations

- [AppMode](enums/AppMode.md)

### Classes

- [WalletProvider](classes/WalletProvider.md)

### Interfaces

- [EncryptInput](interfaces/EncryptInput.md)
- [IAppConfig](interfaces/IAppConfig.md)
- [IWidgetThemeConfig](interfaces/IWidgetThemeConfig.md)
- [InitInput](interfaces/InitInput.md)
- [InitParams](interfaces/InitParams.md)
- [UserInfo](interfaces/UserInfo.md)

### Type aliases

- [Position](modules.md#position)
- [Theme](modules.md#theme)

### Functions

- [computeAddress](modules.md#computeaddress)
- [encryptWithPublicKey](modules.md#encryptwithpublickey)

## Type aliases

### Position

Ƭ **Position**: `"right"` \| `"left"`

#### Defined in

[interfaces.ts:7](https://github.com/arcana-network/wallet/blob/f7a8dce/src/interfaces.ts#L7)

---

### Theme

Ƭ **Theme**: `"light"` \| `"dark"`

#### Defined in

[interfaces.ts:3](https://github.com/arcana-network/wallet/blob/f7a8dce/src/interfaces.ts#L3)

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

[index.ts:310](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L310)

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

[index.ts:299](https://github.com/arcana-network/wallet/blob/f7a8dce/src/index.ts#L299)
