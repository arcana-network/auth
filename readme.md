# Arcana Auth
Arcana SDK to perform logins on your app.

## Installation

### Using NPM/Yarn

```sh
npm install --save @arcana/auth
yarn add @arcana/auth
```

### Using CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@arcana/auth"></script>
```
```html
<script src="https://unpkg.com/@arcana/auth"></script>
```

## Usage

### Import 

```js
const { AuthProvider, SocialLoginType } = window.arcana.auth;
// or
import { AuthProvider } from '@arcana/auth';
```
### Initialise

```js
const auth = await AuthProvider.init({
   appId: `${appId}`,
   flow: 'redirect', // 'popup' or 'redirect'
   redirectUri:'' // Can be ignored for redirect flow if same as login page
});
```

### Initiate social login

```js
await auth.loginWithSocial(SocialLoginType.google);
```

### Initiate passwordless login

```js
const result = await auth.loginWithOtp(`${emailAddress}`, { withUI: boolean });
```
Options:
- `{ withUI: true }` - the user is redirected to `email-sent` or `error` page
- `{ withUI: false }` - gets a `json` response back with no redirection

### Get login status
```js
const loggedIn = auth.isLoggedIn(); /* boolean response */
```

The user info is saved in memory after successful login, before `unload` event of the page it gets stored in `session-storage` and is refetched to memory and removed from `session-storage` after successful page reload.

### Get user info

```js
const userInfo = auth.getUserInfo();
/* 
  UserInfo: {
    loginType: 'google',
    userInfo: {
      id: 'abc@example.com',
      name: 'ABC DEF',
      email: '',
      picture: ''
    },
    privateKey: ''
  }
*/
```

### Get public key

```js
const publicKey = await auth.getPublicKey({
  verifier: SocialLoginType.google,
  id: `${email}`,
}, output); /* output can be 'point', 'compressed' or 'uncompressed'; */
```
Output:
- `point` will be output with `{ x: string, y: string }`
- `compressed` will be `string` like `0x03...`
- `uncompressed` will be a `string` like `0x04...`
- defaults to `uncompressed` 

### Clear login session

```js
await auth.logout();
```

## Flow modes

### **Redirect**

`login.js`
```js
window.onload = async () => {
  const auth = await AuthProvider.init({
    appId: `${appId}`,
    flow: 'redirect',
    redirectUri:'path/to/redirect' 
  });

  googleLoginBtn.addEventListener('click', async () => {
    await auth.loginWithSocial(SocialLoginType.google);
  });
}
```

- Skip `redirectUri` in params if the it is same as login page.

### **Popup**

`login.js`
```js
window.onload = async () => {
  const auth = await AuthProvider.init({
    appId: `${appId}`,
    redirectUri:'path/to/redirect' 
  });

  googleLoginBtn.addEventListener('click', async () => {
    await auth.loginWithSocial(SocialLoginType.google);
    if(auth.isLoggedIn()) {
      const info = auth.getUserInfo();
      // Store info and redirect accordingly
    }
  });
}
```

`redirect.js`
```js
window.onload = async () => {
  AuthProvider.handleRedirectPage(<origin>);
};
```
### Variables

* `SocialLoginType` - discord, twitter, github, google, twitch, reddit
* `origin` - Base url of your app. 
