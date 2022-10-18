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

const WAIT_TEXT = {
  SOCIAL: 'Please complete the login to proceed',
  LINK: 'Please complete the login by clicking on email',
}

const initLoaderState = {
  text: '',
  loading: false,
  type: '',
}

const reducer = (
  state: typeof initLoaderState,
  action: 'SOCIAL' | 'LINK' | 'RESET'
) => {
  if (action == 'SOCIAL' || action == 'LINK') {
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

    props.loginWithLink(email).finally(() => {
      dispatch('RESET')
    })
  }

  if (loaderState.loading) {
    return (
      <Overlay>
        <Container mode={props.mode}>
          <Loader text={loaderState.text} mode={props.mode}>
            {loaderState.type == 'LINK' ? (
              <>
                <Action
                  method={() => linkLogin()}
                  text="Send the email again"
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
        <Header mode={props.mode} />
        <EmailLogin
          email={email}
          setEmail={setEmail}
          loginWithLink={linkLogin}
        />
        <Separator text="or continue with" />
        <SocialLogin
          loginWithSocial={socialLogin}
          loginList={props.loginList}
        />
      </Container>
    </Overlay>
  )
}

export { Modal }
