const googleLoginBtn = document.getElementById('google-login');
const githubLoginBtn = document.getElementById('github-login');
const twitterLoginBtn = document.getElementById('twitter-login');
const discordLoginBtn = document.getElementById('discord-login');
const twitchLoginBtn = document.getElementById('twitch-login');
const redditLoginBtn = document.getElementById('reddit-login');
const passwordlessLoginBtn = document.getElementById('passwordless-login');
const { AuthProvider } = window.arcana.auth;
const userIDElement = document.getElementById('user-id');
const keyElement = document.getElementById('pvt-key');
const typeElement = document.getElementById('login-type');

const setUserInfo = (id, key, type) => {
  userIDElement.innerText = id;
  keyElement.innerText = key;
  typeElement.innerText = type;
};
window.onload = async function () {
  let auth;
  try {
    auth = await AuthProvider.init({
      appId: '16',
      network: 'testnet',
      flow: 'redirect',
      // Skip redirectUri if it is same as current url
    });

    const logins = await auth.getAvailableLogins();
    console.log({ logins });

    if (auth.isLoggedIn()) {
      const info = auth.getUserInfo();
      console.log({ info });
      setUserInfo(info.userInfo.id, info.privateKey, info.loginType);
    }
  } catch (e) {
    console.log(e);
  }
  const login = async (verifier) => {
    await auth.loginWithSocial(verifier);
    if (auth.isLoggedIn()) {
      const info = await auth.getUserInfo();
      setUserInfo(info.userInfo.id, info.privateKey, verifier);
    }
  };

  githubLoginBtn.addEventListener('click', () => {
    login('github');
  });
  twitterLoginBtn.addEventListener('click', () => {
    login('twitter');
  });
  googleLoginBtn.addEventListener('click', () => {
    login('google');
  });
  discordLoginBtn.addEventListener('click', () => {
    login('discord');
  });
  twitchLoginBtn.addEventListener('click', () => {
    login('twitch');
  });
  redditLoginBtn.addEventListener('click', () => {
    login('reddit');
  });
  passwordlessLoginBtn.addEventListener('click', async () => {
    const response = await auth.loginWithOtp('abc@example.com', {
      withUI: false,
    });
    console.log({ response });
    if (auth.isLoggedIn()) {
      const info = await auth.getUserInfo();
      setUserInfo(info.userInfo.id, info.privateKey, 'passwordless');
    }
  });
};
// const checkLogin = async () => {
//   const isLoggedIn = arcanaLogin.isLoggedIn('google');
//   if (isLoggedIn) {
//     const pk = await arcanaLogin.signIn('google');
//     console.log({ pk });
//   }
// };

// checkLogin();

// github twitter twitch reddit
