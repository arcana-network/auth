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

  if (loaderState.loading) {
    return (
      <Overlay>
        <Container mode={props.mode}>
          {loaderState.type == 'OTP_SENT' ? (
            <OTPEntry
              loginWithOtpStart={() => props.loginWithOTPStart(email)}
              setError={() => dispatch('OTP_ERROR')}
              closeFunc={props.closeFunc}
              loginWithOtpComplete={props.loginWithOTPComplete}
              compact={props.options.compact}
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
      <Container mode={props.mode}>
        {loaderState.type == 'OTP_ERROR' ? (
          <OTPError action={() => dispatch('RESET')} />
        ) : (
          <>
            <Header compact={props.options.compact} logo={props.logo} />
            <EmailLogin
              email={email}
              setEmail={setEmail}
              loginWithOTPStart={otpLogin}
            />
            {props.loginList.length > 0 ? (
              <>
                <Separator text="or continue with" />
                <SocialLogin
                  loginWithSocial={socialLogin}
                  loginList={props.loginList}
                  mode={props.mode}
                />
              </>
            ) : null}
          </>
        )}
      </Container>
    </Overlay>
  )
}

export { Modal }