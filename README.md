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

# What is Auth SDK?

Integrate your application with Arcana Network Auth SDK to easily onboard application users and allow authenticated users to sign blockchain transactions. Configure one or more social login and passwordless authentication options for application users. Application users don't need to manage keys or share them explicitly for enabling any blockchain transaction.

Auth SDK enables the standard [Ethereum provider](https://eips.ethereum.org/EIPS/eip-1193) that can be used by the application for Web3 operations.

The following authentication mechanisms are supported:

- Social Login

  - Discord
  - GitHub
  - Google
  - Twitter
  - Twitch

- Passwordless authentication

Application developers can choose to use plug and play feature of the Auth SDK that provides a default UI for user login.  Alternatively, they can build their own UI and simply call the Auth SDK functions for social login and passwordless authentication.

# 💪 Key Features

<p>🗝️ &nbsp; Plug and play user authentication</p>
<p>🔒 &nbsp; Onboard dApp users via social, passwordless login</p>
<p>🗝️ &nbsp; Secure Ethereum provider access for Web3 operations</p>
<p>🔒 &nbsp; Embedded Web3 Arcana wallet that can be branded and configured as per the application needs </p>
<p>⛓️ &nbsp; Sign blockchain transactions, deploy and interact with smart contracts, manage native and custom tokens, view and manage NFTs, send and receive tokens</p>
<p>⚙️ &nbsp; Configure blockchain transaction signing user experience using wallet visibility modes</p>

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

Before you can start using the Arcana Auth SDK, you need to register your dApp using [Arcana Developer Dashboard](https://dashboard.arcana.network/).

A unique **App Address** will be assigned to your dApp and you need the same to initialize the Arcana Auth SDK.

# 📚 Documentation

Check out [Arcana Network documentation](https://docs.arcana.network/) for [Auth SDK Quick Start Guide](https://docs.arcana.network/walletsdk/wallet_qs.html), [Usage Guide](https://docs.arcana.network/walletsdk/wallet_usage.html) and [API Reference Guide](https://authsdk-ref-guide.netlify.app).

# 💡 Support

For any support or integration-related queries, contact [Arcana support team](mailto:support@arcana.network).

# 🤝 Contributing

We welcome all contributions to the Arcana Auth SDK from the community. Read our [contributing guide](https://github.com/arcana-network/license/blob/main/CONTRIBUTING.md) to learn about the SDK development process, how to propose bug fixes and improvements, and the code of conduct that we expect the participants to adhere to. Refer to the build and test section of this readme for details on how to test and validate your changes to the Auth SDK code before submitting your contributions.

# ℹ️ License

Arcana Auth SDK is distributed under the [MIT License](https://fossa.com/blog/open-source-licenses-101-mit-license/).

For details see [Arcana License](https://github.com/arcana-network/license/blob/main/LICENSE.md).
