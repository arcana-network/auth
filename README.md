<p align="center">
<a href="#start"><img height="30rem" src="https://raw.githubusercontent.com/arcana-network/branding/main/an_logo_light_temp.png"/></a>
<h2 align="center"> <a href="https://arcana.network/">Arcana Network Auth SDK </a></h2>
</p>
<br/>
<p id="banner" align="center">
<br/>
<a title="MIT License" href="https://github.com/arcana-network/license/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue"/></a>
<a title="Beta release" href="https://github.com/arcana-network/auth/releases"><img src="https://img.shields.io/github/v/release/arcana-network/auth?style=flat-square&color=28A745"/></a>
<a title="Twitter" href="https://twitter.com/ArcanaNetwork"><img alt="Twitter URL" src="https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FArcanaNetwork"/></a>
<a title="CodeCov" href="https://codecov.io/gh/arcana-network/auth"> 
 <img src="https://codecov.io/gh/arcana-network/auth/branch/dev/graph/badge.svg?token=KmdjEs3enL"/></a>
</p><p id="start" align="center">
<a href="https://docs.beta.arcana.network/"><img src="https://raw.githubusercontent.com/arcana-network/branding/main/an_auth_sdk_banner_feb_24.png" alt="Arcana Auth SDK"/></a>
</p>

# Auth

Web3 apps can integrate with the [Arcana Network](https://arcana.network) Auth SDK to enable social login and embedded, in-app Arcana wallet. Users don't need to install a wallet. Developers can leverage the built-in gasless feature to sponsor gas fees for white-listed blockchain transactions.

Auth SDK exposes the standard [Ethereum provider](https://eips.ethereum.org/EIPS/eip-1193) interface for Web3 operations. 

## Supported Auth Providers

- Social Login

  - Discord
  - GitHub
  - Google
  - Steam
  - Twitter
  - Twitch

- Custom IAM
  
  - Cognito
  - Firebase

- Passwordless authentication

## Supported Blockchain Networks

The Arcana wallet is [pre-configured with a subset of supported chains](https://docs.arcana.network/state-of-the-arcana-auth#supported-blockchains). Other supported chains can be added by app developers programmatically or via the dashboard. App users can add supported chains through the wallet UI.

- EVM-chains: All. 
- Non-EVM chains: Solana, MultiversX

## Customization

- **Login UI**: Use default, built-in plug-and-play UI or use a custom one
- **Wallet UI**: Select default, built-in wallet UI or configure custom wallet UI
- **Branding**: Configure the theme and logo displayed in the wallet
- **Social Providers**: Enable one or more social login providers in addition to the default passwordless login
- **Wallet UX**: Configure Keyspace - global or app-specific (default)
- **Gasless Transactions**: Add gas tanks, deposit funds to sponsor gas fees

## Prerequisites

1. Use the [Arcana Dashboard](https://dashboard.arcana.network) to register the app and obtain a unique app identifier (client ID). 
2. Configure SDK usage, enable social providers, set up gasless (optional), select wallet UX
3. Install the SDK and use the Client ID to integrate the app. [Learn more...](https://docs.arcana.network/quick-start/auth-sdk/index.html)

## Installation

### npm

```sh
npm install --save @arcana/auth
```

### yarn

```sh
yarn add @arcana/auth
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@arcana/auth"></script>
```

```html
<script src="https://unpkg.com/@arcana/auth"></script>
```

## Documentation

See [Arcana Network documentation](https://docs.arcana.network/), [Auth SDK Quick Start Guide](https://docs.arcana.network/quick-start/auth-sdk/index.html), [Usage Guide](https://docs.arcana.network/web-sdk/auth-usage-guide.html), [API Reference Guide](https://authsdk-ref-guide.netlify.app) and [integration examples](https://docs.arcana.network/tutorials/).

## Support

Contact [Arcana Support](https://docs.arcana.network/support).

## License

Arcana Auth SDK is distributed under the [MIT License](https://fossa.com/blog/open-source-licenses-101-mit-license/). For details, see [Arcana License](https://github.com/arcana-network/license/blob/main/LICENSE.md).
