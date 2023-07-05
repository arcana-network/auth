import { ARCANA_LOGO, getSocialLogo } from './icons'
import { StateUpdater, useState } from 'preact/hooks'
import { ModalParams } from './typings'
import { Theme } from '../typings'
import { JSXInternal } from 'preact/src/jsx'
import ProgressOval from './loader'
import './style.css'

const Header = ({ logo }: { logo: string }) => {
  const [renderLogoContainer, setRenderLogoContainer] = useState(true)
  const removeLogoContainer = () => {
    setRenderLogoContainer(false)
  }
  return (
    <>
      {renderLogoContainer && logo ? (
        <div className="xar-header-logo__container">
            <img
              className="xar-header-logo"
              src={logo}
              alt="app-logo"
              onError={removeLogoContainer}
            />
        </div>
      ): <div className="xar-header-logo__empty-container"></div>}
    </>
  )
}

function maybeValidEmail (email: string) { return /^\S+@\S+\.\S+$/.test(email); }

const EmailLogin = ({
  loginWithLink,
  email,
  setEmail,
}: {
  email: string
  setEmail: StateUpdater<string>
} & Pick<ModalParams, 'loginWithLink'>) => {
  const [disabled, setDisabled] = useState(true)
  const onInput: JSXInternal.GenericEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.currentTarget.value)
    setDisabled(!maybeValidEmail(e.currentTarget.value))
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
      <input
        value={email}
        onInput={onInput}
        className="xar-email-login__input"
        type="text"
        placeholder={'Enter your email'}
      />
      <button disabled={disabled} onClick={clickHandler} className="xar-btn">
        Get login link
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
      <a href="https://arcana.network" className="xar-footer-img__link">
        <img className="xar-footer-img" src={logo} alt="Secured By Arcana" />
      </a>
    </div>
  )
}

const Loader = (props: {
  text: string
  children: preact.ComponentChildren
  mode: Theme
  header?: JSXInternal.Element
}) => {
  return (
    <>
      {props.header ? (
        props.header
      ) : (
        <ProgressOval stroke={8} secondaryColor="#8D8D8D" />
      )}
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
