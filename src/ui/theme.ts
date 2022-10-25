import { Theme } from '../typings'

export const DarkTheme = {
  bg: '#101010',
  fg: '#f7f7f7',
  background: '#262626',
  mode: 'dark',
  inputShadow: `inset -2px -2px 4px rgb(57 57 57 / 44%),
          inset 5px 5px 10px rgb(11 11 11 / 50%);`,
}

export const LightTheme = {
  fg: '#101010',
  bg: '#f7f7f7',
  background: '#ffffff',
  mode: 'light',
  inputShadow: `inset -1px -7px 7px rgba(255, 255, 255, 0.7),
          inset 3px 1px 6px rgba(174, 174, 192, 0.2);`,
}

export const getTheme = (theme: Theme) => {
  if (theme === 'light') {
    return LightTheme
  }
  return DarkTheme
}
