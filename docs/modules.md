[@arcana/wallet](README.md) / Exports

# @arcana/wallet

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

[interfaces.ts:7](https://github.com/arcana-network/wallet/blob/99cb3f4/src/interfaces.ts#L7)

---

### Theme

Ƭ **Theme**: `"light"` \| `"dark"`

#### Defined in

[interfaces.ts:3](https://github.com/arcana-network/wallet/blob/99cb3f4/src/interfaces.ts#L3)

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

[index.ts:304](https://github.com/arcana-network/wallet/blob/99cb3f4/src/index.ts#L304)

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

[index.ts:293](https://github.com/arcana-network/wallet/blob/99cb3f4/src/index.ts#L293)
