import { Theme } from '../typings'

const DARK_MODE_CLASS_NAME = 'xar-dark-mode'
const LIGHT_MODE_CLASS_NAME = 'xar-light-mode'

const getModalStyleSheet = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'data:text/css;charset=UTF-8,' + encodeURIComponent(getCssText())
  return link
}

const DarkTheme = {
  bg: '#101010',
  fg: '#f7f7f7',
  background: '#262626',
  mode: 'dark',
  inputShadow: `inset -2px -2px 4px rgb(57 57 57 / 44%),
        inset 5px 5px 10px rgb(11 11 11 / 50%);`,
}

const LightTheme = {
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

const getCssText = () => {
  return `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@100;400;600;700&display=block');
  
      .light-mode {
        --fg: '#101010',
        --bg: '#f7f7f7',
        --background: '#ffffff',
        --inputShadow: 'inset -1px -7px 7px rgba(255, 255, 255, 0.7), inset 3px 1px 6px rgba(174, 174, 192, 0.2);'
      }
      .dark-mode {
        --fg: '#f7f7f7',
        --bg: '#101010',
        --background: '#262626',
        --inputShadow: 'inset -2px -2px 4px rgb(57 57 57 / 44%), inset 5px 5px 10px rgb(11 11 11 / 50%);'
      }

      #xar-modal {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(16px);
          font-family: Sora, sans-serif;
      }
      
      .header-logo__container {
        width: 70px;
        height: 70px;
        border-radius: 60px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid black;
      }

      .header-logo {
        max-width: 70px;
        max-height: 70px;
        margin: 0 auto;
        display: inline-block;
      }

      .header-text {
        font-family: "Montserrat", sans-serif;
      }

      .header-heading {
        text-align: center;
      }

      .header-subtext {
        font-size: 12px;
        font-weight: 400;
      }

      .email-login {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .email-login > *:not(:first-child) {
        margin-top: 20px;
      }

      .email-login__label {
        text-align: left;
        font-size: 14px;
        color: #8d8d8d;
        font-weight: 400;
      }
  
      .email-login__input {
        height: 45px;
        padding: 0 16px;
        font-size: 14px;
        font-weight: 400;
        color: var(--fg);
        background: var(--bg);
        border: none;
        border-radius: 10px;
        outline: none;
        box-shadow: var(--inputShadow);
      }

      .social-container {
        display: flex;
        justify-content: center;
      }

      .social-icon__wrapper {
        display: flex;
        background: var(--fg);
        width: 42px;
        height: 42px;
        border-radius: 25px;
        align-items: center;
        margin-left: 10px;
        margin-right: 10px;
      }

      .social-icon__wrapper:hover {
        cursor: pointer;
        transition: all 0.5s;
        transform: scale(1.15, 1.15);
      }

      .social-icon {
        margin: 0 auto;
        width: 24px;
        height: 24px;
      }

      .xar-container {
        padding: 30px 30px;
        min-width: 325px;
        max-width: 325px;
        min-height: 480px;
        background-color: var(--background);
        color: var(--fg);
        margin: 0 auto;
        font-family: "Sora", sans-serif;
        box-shadow: 4px 5px 4px rgba(0, 0, 0, 0.25);
        border-radius: 10px;
      }
      
      .xar-inner-container {
        min-height: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .xar-inner-container > *:not(:first-child) {
        margin-top: 20px;
      }

      .xar-btn {
        width: 100%;
        height: 2.75rem;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--bg);
        background: var(--fg);
        border: none;
        border-radius: 10px;
      }

      .xar-btn:hover {
        cursor: pointer;
        transition: all 0.5s;
        transform: scale(1.05, 1.15);
      }

      .xar-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
      }

      .xar-footer-text {
        font-size: 12px;
        font-weight: 400;
      }
      
      .xar-footer-img__link {
        width: 60px;
        height: 15px;
        margin-left: 5px;
      }

      .xar-separator {
        width: 100%;
        display: flex;
        align-items: center;
        text-align: center;
      }

      .xar-separator:before, .xar-separator:after {
        content: "";
        flex: 1 1 auto;
        border-bottom: 1px solid #000;
      }

      .xar-separator:before {
        margin-right: 1rem;
      }

      .xar-separator:after {
        margin-left: 1rem;
      }

      .xar-action__link {
        text-transform: uppercase;
        text-decoration: underline;
        color: #13a3fd;
        font-weight: 700;
        font-size: 15px;
        line-height: 19px;
        cursor: pointer;
      }

      .loader__text {
        font-size: 20px;
        font-weight: 700;
      }
      `
}
export { getModalStyleSheet }
