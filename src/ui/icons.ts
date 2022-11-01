const BASE_URL = 'https://auth-icons.s3.ap-south-1.amazonaws.com'

const SOCIAL_LOGO: { [k: string]: string } = {
  google: `${BASE_URL}/google-icon.png`,
  twitter: `${BASE_URL}/twitter-icon.png`,
  github: `${BASE_URL}/github-icon.png`,
  github_light: `${BASE_URL}/github-dark-icon.png`,
  twitch: `${BASE_URL}/twitch-icon.png`,
  discord: `${BASE_URL}/discord-icon.png`,
}

function getSocialLogo(provider: string, theme: 'light' | 'dark') {
  if (provider === 'github' && theme === 'light') {
    return SOCIAL_LOGO['github_light']
  }
  return SOCIAL_LOGO[provider]
}

const ARCANA_LOGO = {
  light: `${BASE_URL}/arcana-logo-dark.png`,
  dark: `${BASE_URL}/arcana-logo.png`,
}

export { getSocialLogo, ARCANA_LOGO }
