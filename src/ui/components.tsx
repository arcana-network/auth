import { ARCANA_LOGO, getSocialLogo } from './icons'
import { StateUpdater } from 'preact/hooks'
import { ModalParams, Theme } from './typings'
import { JSXInternal } from 'preact/src/jsx'
import { getFallbackImage } from '../utils'
import ProgressOval from './loader'
import './style.css'

const Header = ({ mode, logo }: { mode: Theme; logo: string }) => {
  const setfallbackLogo = (e: Event) => {
    const src = getFallbackImage(mode)
    if (e.target instanceof HTMLImageElement) {
      e.target.src = src
    }
  }
  return (
    <>
      <div className="xar-header-logo__container">
        <img
          className="xar-header-logo"
          src={logo}
          alt="app-logo"
          onError={setfallbackLogo}
        />
      </div>
      <div className="xar-header-text">
        <h1 className="xar-header-heading">Welcome</h1>
        <p className="xar-header-subtext">
          We’ll email you a login link for a password-free sign in.
        </p>
      </div>
    </>
  )
}

const EmailLogin = ({
  loginWithLink,
  email,
  setEmail,
}: {
  email: string
  setEmail: StateUpdater<string>
} & Pick<ModalParams, 'loginWithLink'>) => {
  const onInput: JSXInternal.GenericEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.currentTarget.value)
  }

  const clickHandler = async (
    e: JSXInternal.TargetedMouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    if (!email) {
      return
    }
    await loginWithLink(email)
    return
  }
  return (
    <form className="xar-email-login">
      <label className="xar-email-login__label" htmlFor="">
        Email
      </label>
      <input
        value={email}
        onInput={onInput}
        className="xar-email-login__input"
        type="text"
      />
      <button onClick={clickHandler} className="xar-btn">
        Get Link
      </button>
    </form>
  )
}

const Separator = ({ text }: { text: string }) => {
  return <div className="xar-separator">{text}</div>
}

const SocialLogin = ({
  loginWithSocial,
  loginList,
  mode,
}: Pick<ModalParams, 'loginWithSocial' | 'loginList'> & { mode: Theme }) => {
  const clickHandler = (p: string) => {
    return loginWithSocial(p)
  }
  return (
    <div className="xar-social-container">
      {loginList.map((l) => {
        return (
          <div
            className="xar-social-icon__wrapper"
            onClick={() => clickHandler(l)}
          >
            <img
              src={getSocialLogo(l, mode)}
              alt={`${l} logo`}
              className="xar-social-icon"
            />
          </div>
        )
      })}
    </div>
  )
}

const Footer = ({ mode }: { mode: Theme }) => {
  const logo = ARCANA_LOGO[mode]
  return (
    <div className="xar-footer">
      <p className="xar-footer-text">Powered by</p>
      <a href="https://arcana.network" className="xar-footer-img__link">
        <img src={logo} alt="arcana logo" />
      </a>
    </div>
  )
}

const Loader = (props: {
  text: string
  children: preact.ComponentChildren
  mode: Theme
}) => {
  return (
    <>
      <ProgressOval stroke={8} secondaryColor="#8D8D8D" />
      {props.text ? <p className="xar-loader__text">{props.text}</p> : ''}
      {props.children ? <>{props.children}</> : ''}
    </>
  )
}

const Container = ({
  children,
  mode,
}: {
  mode: Theme
  children: preact.ComponentChildren
}) => {
  return (
    <div class="xar-container">
      <div class="xar-inner-container">{children}</div>
      <Footer mode={mode} />
    </div>
  )
}

const Action = ({ text, method }: { text: string; method: () => void }) => {
  return (
    <div class="xar-action-container">
      <p onClick={() => method()} className="xar-action__link">
        {text}
      </p>
    </div>
  )
}

export {
  Action,
  Header,
  EmailLogin,
  Separator,
  SocialLogin,
  Footer,
  Loader,
  Container,
}
