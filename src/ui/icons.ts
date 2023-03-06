const BASE_URL = 'https://auth-icons.s3.ap-south-1.amazonaws.com'

const SOCIAL_LOGO: { [k: string]: string } = {
  google: `${BASE_URL}/google.png`,
  twitter: `${BASE_URL}/twitter.png`,
  github: `${BASE_URL}/github-light.png`,
  github_light: `${BASE_URL}/github.png`,
  twitch: `${BASE_URL}/twitch.png`,
  discord: `${BASE_URL}/discord.png`,
  aws: `${BASE_URL}/aws.png`,
  aws_light: `${BASE_URL}/aws_light.png`,
}

function getSocialLogo(provider: string, theme: 'light' | 'dark') {
  if (SOCIAL_LOGO[`${provider}_${theme}`]) {
    return SOCIAL_LOGO[`${provider}_${theme}`]
  }
  return SOCIAL_LOGO[provider]
}

const ARCANA_LOGO = {
  light: `${BASE_URL}/arcana-logo-dark.png`,
  dark: `${BASE_URL}/arcana-logo.png`,
}

export { getSocialLogo, ARCANA_LOGO }
