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
import { useState } from 'preact/hooks'

const loaderInitValue = {
  text: '',
  loading: false,
  type: '',
}

const WAIT_TEXT = {
  SOCIAL: 'Please complete the login to proceed',
  LINK: 'Please complete the login by clicking on email',
}

const Modal = (props: ModalParams) => {
  const [loaderState, setLoaderState] = useState(loaderInitValue)

  const socialLogin = async (kind: string) => {
    setLoaderState({
      text: WAIT_TEXT.SOCIAL,
      type: 'SOCIAL',
      loading: true,
    })

    props.loginWithSocial(kind).finally(() => {
      setLoaderState(loaderInitValue)
    })
  }

  const linkLogin = async (email: string) => {
    setLoaderState({
      text: WAIT_TEXT.LINK,
      type: 'LINK',
      loading: true,
    })

    props.loginWithLink(email).finally(() => {
      setLoaderState(loaderInitValue)
    })
  }

  if (loaderState.loading) {
    return (
      <Overlay shouldClose={false}>
        <Container mode={props.mode}>
          <Loader text={loaderState.text}>
            {loaderState.type == 'LINK' ? (
              <>
                <Action url="" text="Send the email again" />
                <Action url="" text="Change email id" />
              </>
            ) : (
              ''
            )}
          </Loader>
        </Container>
      </Overlay>
    )
  }

  return (
    <Overlay shouldClose={true}>
      <Container mode={props.mode}>
        <Header mode={props.mode} />
        <EmailLogin loginWithLink={linkLogin} />
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
