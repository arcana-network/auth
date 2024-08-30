import { ModalParams } from './typings'
import {
  Header,
  EmailLogin,
  Separator,
  SocialLogin,
  Container,
  Loader,
  OTPEntry,
  OTPError,
} from './components'
import { Overlay } from './overlay'
import More from './more'
import { useReducer, useState } from 'preact/hooks'

const WAIT_TEXT = {
  SOCIAL: 'Please complete the login to proceed',
  OTP_INIT: 'Sending login OTP to your email address',
  OTP_SENT: '',
  OTP_SENT_GLOBAL: 'Please complete the login to proceed',
  OTP_ERROR: 'Invalid OTP, please try again',
}

const initLoaderState = {
  text: '',
  loading: false,
  type: '',
}

const reducer = (
  state: typeof initLoaderState,
  action:
    | 'SOCIAL'
    | 'RESET'
    | 'OTP_SENT'
    | 'OTP_INIT'
    | 'OTP_ERROR'
    | 'OTP_SENT_GLOBAL'
) => {
  if (
    action == 'OTP_SENT_GLOBAL' ||
    action == 'SOCIAL' ||
    action == 'OTP_SENT' ||
    action == 'OTP_INIT' ||
    action == 'OTP_ERROR'
  ) {
    return {
      text: WAIT_TEXT[action],
      type: action,
      loading: action == 'OTP_ERROR' ? false : true,
    }
  } else if (action == 'RESET') {
    return initLoaderState
  } else {
    return state
  }
}

const Modal = (props: ModalParams) => {
  const [loaderState, dispatch] = useReducer(reducer, initLoaderState)
  const [email, setEmail] = useState('')
  const [showMore, setShowMore] = useState(false)

  const socialLogin = async (kind: string) => {
    dispatch('SOCIAL')

    props.loginWithSocial(kind).finally(() => {
      dispatch('RESET')
    })
  }

  const otpLogin = async (email: string) => {
    dispatch('OTP_INIT')
    const login = await props.loginWithOTPStart(email)
    dispatch(login.isCompleteRequired ? 'OTP_SENT' : 'OTP_SENT_GLOBAL')
    return login
  }

  function onShowMore(val: boolean) {
    setShowMore(val)
  }

  if (loaderState.loading) {
    return (
      <Overlay>
        <Container mode={props.mode} theme_settings={props.theme_settings}>
          {loaderState.type == 'OTP_SENT' ? (
            <OTPEntry
              toHome={() => dispatch('RESET')}
              loginWithOtpStart={() => props.loginWithOTPStart(email)}
              setError={() => dispatch('OTP_ERROR')}
              closeFunc={props.closeFunc}
              loginWithOtpComplete={props.loginWithOTPComplete}
              compact={props.options.compact}
              email={email}
              mode={props.mode}
            />
          ) : (
            <Loader
              compact={props.options.compact}
              text={loaderState.text}
              mode={props.mode}
            ></Loader>
          )}
        </Container>
      </Overlay>
    )
  }

  return (
    <Overlay closeFunc={props.closeFunc}>
      <Container mode={props.mode} theme_settings={props.theme_settings}>
        {loaderState.type == 'OTP_ERROR' ? (
          <OTPError action={() => dispatch('RESET')} mode={props.mode} />
        ) : (
          <>
            <Header compact={props.options.compact} logo={props.logo} />
            <EmailLogin
              email={email}
              setEmail={setEmail}
              loginWithOTPStart={otpLogin}
              mode={props.mode}
            />
            {props.loginList.length > 0 ? (
              <>
                <Separator text="or" />
                <SocialLogin
                  loginWithSocial={socialLogin}
                  loginList={props.loginList}
                  mode={props.mode}
                  setShowMore={() => onShowMore(true)}
                  theme_settings={props.theme_settings}
                />
              </>
            ) : null}
            {showMore ? (
              <More
                list={props.loginList.slice(5)}
                setShow={() => onShowMore(false)}
                mode={props.mode}
                onLoginClick={socialLogin}
              />
            ) : (
              ''
            )}
          </>
        )}
      </Container>
    </Overlay>
  )
}

export { Modal }
