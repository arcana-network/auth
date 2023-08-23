import { ModalParams } from './typings'
import {
  Header,
  EmailLogin,
  Separator,
  SocialLogin,
  Container,
  Loader,
  Action,
} from './components'
import { Overlay } from './overlay'
import { useReducer, useState } from 'preact/hooks'
import { ICONS } from '../utils'

const WAIT_TEXT = {
  SOCIAL: 'Please complete the login to proceed',
  LINK: 'Sending login link to your email',
  LINK_SENT: 'Please complete the login by clicking on email',
}

const initLoaderState = {
  text: '',
  loading: false,
  type: '',
}

const reducer = (
  state: typeof initLoaderState,
  action: 'SOCIAL' | 'LINK' | 'RESET' | 'LINK_SENT'
) => {
  if (action == 'SOCIAL' || action == 'LINK' || action == 'LINK_SENT') {
    return {
      text: WAIT_TEXT[action],
      type: action,
      loading: true,
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

  const linkLogin = async () => {
    if (!email) {
      return
    }

    dispatch('LINK')

    props
      .loginWithLink(email, () => {
        dispatch('LINK_SENT')
      })
      .finally(() => {
        dispatch('RESET')
      })
  }

  if (loaderState.loading) {
    return (
      <Overlay>
        <Container mode={props.mode}>
          <Loader
            compact={props.options.compact}
            text={loaderState.text}
            mode={props.mode}
            header={
              loaderState.type == 'LINK_SENT' ? (
                <img className="xar-success__img" src={ICONS.success} />
              ) : undefined
            }
          >
            {loaderState.type == 'LINK_SENT' ? (
              <>
                <Action
                  method={() => linkLogin()}
                  text="Resend email"
                />
                <Action
                  method={() => dispatch('RESET')}
                  text="Change email id"
                />
              </>
            ) : null}
          </Loader>
        </Container>
      </Overlay>
    )
  }

  return (
    <Overlay closeFunc={props.closeFunc}>
      <Container mode={props.mode}>
        <Header compact={props.options.compact} logo={props.logo} />
        <EmailLogin
          email={email}
          setEmail={setEmail}
          loginWithLink={linkLogin}
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
      </Container>
    </Overlay>
  )
}

export { Modal }
