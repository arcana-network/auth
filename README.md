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
<a href="https://docs.beta.arcana.network/"><img src="https://raw.githubusercontent.com/arcana-network/branding/main/an_banner_docs.png" alt="Arcana Auth SDK"/></a>
</p>

# Arcana Auth

Use Arcana Auth SDK to onboard Web3 app users via social login and allow authenticated users to instantly access the built-in, embedded Arcana wallet and sign blockchain transactions from within the app context. 

Use the built-in gasless feature in the Auth SDK to enable gasless transactions in the Arcana wallet. 

Auth SDK enables the standard [Ethereum provider](https://eips.ethereum.org/EIPS/eip-1193) that can be used by the application for Web3 operations. Users are not required to install any wallet extension or manage keys or share them explicitly for enabling any blockchain transaction.

## Auth Providers

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

Auth SDK usage is easily customizable. Developers can choose to use the built-in plug and play login UI to onboard users or use a custom UI. Also, instead of the built-in Arcana wallet UI, developers can integrate with the SDK and use a custom wallet UI.

# 💪 Key Features

<p>🔒 &nbsp; Onboard users via social, passwordless login</p>
<p>🗝️ &nbsp; Allow authenticated users to sign blockchain transactions</p>
<p>🔒 &nbsp; Non-custodial, embedded Web3 Arcana wallet that can be branded and configured </p>
<p>⛓️ &nbsp; Web3 wallet operations: sign blockchain transactions, deploy and interact with smart contracts, manage native and custom tokens, view and manage NFTs, send and receive tokens</p>
<p>⚙️ &nbsp; Gaslesss transactions</p>

# 🏗️ Installation

## npm

```sh
npm install --save @arcana/auth
```

## yarn

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

# 📋 Prerequisites

Configure Auth SDK usage through the [Arcana Dashboard](https://dashboard.arcana.network), obtain a unique app identifier (client Id). Then install the SDK, use the client Id to integrate the app with the Arcana Auth SDK. [Learn more...](https://docs.arcana.network/).

# 📚 Documentation

Check out [Arcana Network documentation](https://docs.arcana.network/) for [Auth SDK Quick Start Guide](https://docs.arcana.network/quick-start/auth-sdk/index.html), [Usage Guide](https://docs.arcana.network/web-sdk/auth-usage-guide.html) and [API Reference Guide](https://authsdk-ref-guide.netlify.app).

# 💡 Support

For support or integration-related queries, contact [Arcana support team](mailto:support@arcana.network).

# 🤝 Contributing

We welcome all contributions to the Arcana Auth SDK from the community. See [contributing guide](https://github.com/arcana-network/license/blob/main/CONTRIBUTING.md) for details.

# ℹ️ License

Arcana Auth SDK is distributed under the [MIT License](https://fossa.com/blog/open-source-licenses-101-mit-license/).

For details see [Arcana License](https://github.com/arcana-network/license/blob/main/LICENSE.md).
