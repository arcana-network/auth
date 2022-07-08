[![codecov](https://codecov.io/gh/arcana-network/auth/branch/dev/graph/badge.svg?token=KmdjEs3enL)](https://codecov.io/gh/arcana-network/auth)
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
</p><p id="start" align="center">
<a href="https://docs.beta.arcana.network/"><img src="https://raw.githubusercontent.com/arcana-network/branding/main/an_banner_temp.png" alt="Arcana Auth SDK"/></a>
</p>

# What is Auth SDK?

You can integrate your application with Arcana Network Auth SDK to securely sign blockchain transactions and easily onboard application users. Auth SDK can be used to enable one or more authentication mechanisms. After authentication, each user is internally assigned a unique key that is secure, private and never exposed. Application users don't need to manage keys or share them explicitly for enabling any blockchain transaction. At the same time, application users get complete flexibility to choose the way they onboard a dApp using familiar Web2 signup/login mechanisms configured by the application developer.

Auth SDK enables secure [Ethereum provider](https://eips.ethereum.org/EIPS/eip-1193) for dApps. If the dApp requires to provide blockchain enabled secure and private file storage and access functionality, Auth SDK seamlessly works with [Arcana Storage SDK](https://github.com/arcana-network/storage) to enable file based transaction signing and approval by the user.

If your application use case requires you to have a **secure, private file store for user data** while managing your own keys, or using your own wallet, or a third party wallet, then you can directly integrate your application with Storage SDK. Otherwise, it is recommended that you use Arcana Auth SDK and Storage SDK together for a seamless experience.

Following authentication mechanisms are supported:

- Social OAuth

  - Discord
  - GitHub
  - Google
  - Reddit
  - Twitter
  - Twitch

- Passwordless authentication

# 💪 Key Features

<p>🗝️ &nbsp; Enables secure Ethereum provider access to dApps</p>
<p>🔒 &nbsp; Onboard dApp users via social, passwordless login</p>
<p>👛 &nbsp; Encrypt/Decrypt data using Ethereum Provider interface</p>
<p>⛓️ &nbsp; Sign blockchain transactions using Ethereum Provider interface</p>
<p>⚙️ &nbsp; Configure transaction signing user experience (no UI, popup UI) as per dApp use case</p>

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

Before you can start using the Arcana Auth SDK, you need to register your dApp using [Arcana Developer Dashboard](https://dashboard.beta.arcana.network/).

A unique **AppId** will be assigned to your dApp and you need the same to initialize the Arcana Auth SDK.

# 📚 Documentation

Check out [Arcana Network documentation](https://docs.beta.arcana.network/) for [Auth SDK Quick Start Guide](https://docs.beta.arcana.network/docs/auth_qs), [Usage Guide](https://docs.beta.arcana.network/docs/auth_usage) and [API Reference Guide](https://docs.beta.arcana.network/docs/auth_ref).

Refer to the [demo dApp](https://docs.beta.arcana.network/docs/demo-app) and [How To Integrate with Auth SDK](https://docs.beta.arcana.network/docs/setupwallet) guide for details.

# 💡 Support

For any support or integration related queries, contact [Arcana support team](mailto:support@arcana.network).

# 🤝 Contributing

We welcome all contributions to the Arcana Auth SDK from the community. Read our [contributing guide](https://github.com/arcana-network/license/blob/main/CONTRIBUTING.md) to learn about the SDK development process, how to propose bug fixes and improvements, and the code of conduct that we expect the participants to adhere to. Refer to the build and test section of this readme for details on how to test and validate your changes to the Auth SDK code before submitting your contributions.

# ℹ️ License

Arcana Auth SDK is distributed under the [MIT License](https://fossa.com/blog/open-source-licenses-101-mit-license/).

For details see [Arcana License](https://github.com/arcana-network/license/blob/main/LICENSE.md).
