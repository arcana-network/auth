const BASE_URL = 'https://auth-icons.s3.ap-south-1.amazonaws.com'

const SOCIAL_LOGO: { [k: string]: string } = {
  google: `${BASE_URL}/google.png`,
  twitter: `${BASE_URL}/twitter.png`,
  github: `${BASE_URL}/github.png`,
  github_light: `${BASE_URL}/github-light.png`,
  twitch: `${BASE_URL}/twitch.png`,
  discord: `${BASE_URL}/discord.png`,
  aws: `${BASE_URL}/aws.png`,
  aws_light: `${BASE_URL}/aws_light.png`,
  steam: `${BASE_URL}/steam.png`,
}

const MISC_ICONS = {
  light: {
    arrow: `${BASE_URL}/arrow-light.svg`,
    success: `${BASE_URL}/success.svg`,
    failed: `${BASE_URL}/failed.svg`,
    email: `${BASE_URL}/email.svg`,
    'try-again': `${BASE_URL}/try-again-light.svg`,
    change: `${BASE_URL}/change.svg`,
    send: `${BASE_URL}/send.svg`,
    'dots-horizontal': `${BASE_URL}/dots-horizontal-light.svg`,
    shrink: `${BASE_URL}/shrink-light.svg`,
    'back-arrow': `${BASE_URL}/back-arrow-light.svg`,
  },
  dark: {
    arrow: `${BASE_URL}/arrow-dark.svg`,
    success: `${BASE_URL}/success.svg`,
    failed: `${BASE_URL}/failed.svg`,
    email: `${BASE_URL}/email.svg`,
    'try-again': `${BASE_URL}/try-again.svg`,
    change: `${BASE_URL}/change.svg`,
    send: `${BASE_URL}/send.svg`,
    'dots-horizontal': `${BASE_URL}/dots-horizontal-dark.svg`,
    shrink: `${BASE_URL}/shrink-dark.svg`,
    'back-arrow': `${BASE_URL}/back-arrow-dark.svg`,
  },
}

function getSocialLogo(provider: string, theme: 'light' | 'dark') {
  if (SOCIAL_LOGO[`${provider}_${theme}`]) {
    return SOCIAL_LOGO[`${provider}_${theme}`]
  }
  return SOCIAL_LOGO[provider]
}

const ARCANA_LOGO = {
  light: `${BASE_URL}/secured-by-arcana-light.svg`,
  dark: `${BASE_URL}/secured-by-arcana-dark.svg`,
}

export { getSocialLogo, ARCANA_LOGO, MISC_ICONS }
