import {
  StateUpdater,
  useEffect,
  useState,
  useRef,
  Dispatch,
} from 'preact/hooks'
import { ARCANA_LOGO, getSocialLogo, MISC_ICONS } from './icons'
import { ModalParams } from './typings'
import { Theme } from '../typings'
import { JSXInternal } from 'preact/src/jsx'
import isEmail from 'validator/es/lib/isEmail'
import ProgressOval from './loader'
import './style.css'

const Header = ({ compact, logo }: { compact: boolean; logo: string }) => {
  const [loaded, setLoaded] = useState(false)
  const showLogoContainer = () => {
    setLoaded(true)
  }
  return (
    <>
      {!loaded ? <div className="xar-header-logo__empty-container"></div> : ''}
      <div
        className="xar-header-logo__container"
        style={loaded ? {} : { display: 'none' }}
      >
        <img
          className="xar-header-logo"
          src={logo}
          alt="app-logo"
          onLoad={showLogoContainer}
        />
      </div>
      {!compact ? (
        <div className="xar-header-text">
          <h1 className="xar-header-heading">Log In</h1>
        </div>
      ) : (
        ''
      )}
    </>
  )
}

const EmailLogin = ({
  loginWithOTPStart,
  email,
  setEmail,
  mode,
}: {
  email: string
  setEmail: Dispatch<StateUpdater<string>>
  mode: Theme
} & Pick<ModalParams, 'loginWithOTPStart'>) => {
  const [disabled, setDisabled] = useState(true)
  const onInput: JSXInternal.GenericEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.currentTarget.value)
    setDisabled(!isEmail(e.currentTarget.value))
  }

  const clickHandler = async (
    e: JSXInternal.TargetedMouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    if (!email) {
      return
    }
    setDisabled(true)
    const login = await loginWithOTPStart(email)
    await login.begin()
    setDisabled(false)
    return
  }

  useEffect(() => {
    setDisabled(!isEmail(email))
  }, [])
  return (
    <form className="xar-email-login">
      <div class="xar-email-login__input-container">
        <input
          value={email}
          onInput={onInput}
          className="xar-email-login__input"
          type="text"
          placeholder={'Enter your email'}
        />
        <button onClick={clickHandler} class="xar-btn">
          <img src={MISC_ICONS[mode].arrow} alt="proceed" />
        </button>
      </div>
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
  setShowMore,
}: { setShowMore: Dispatch<StateUpdater<boolean>> } & Pick<
  ModalParams,
  'loginWithSocial' | 'loginList'
> & { mode: Theme }) => {
  const clickHandler = (p: string) => {
    return loginWithSocial(p)
  }
  return (
    <div className="xar-social-container">
      {loginList.slice(0, 4).map((l) => {
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
      {loginList.length > 4 ? (
        <div
          className="xar-social-icon__wrapper"
          onClick={() => setShowMore(true)}
        >
          <img
            src={MISC_ICONS[mode]['dots-horizontal']}
            alt="more"
            className="xar-social-icon"
          />
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

const Footer = ({ mode }: { mode: Theme }) => {
  const logo = ARCANA_LOGO[mode]
  return (
    <div className="xar-footer">
      <a
        href="https://arcana.network"
        target="_blank"
        className="xar-footer-img__link"
      >
        <img className="xar-footer-img" src={logo} alt="Powered By Arcana" />
      </a>
    </div>
  )
}

const Loader = (props: {
  text: string
  children?: preact.ComponentChildren
  mode: Theme
  compact: boolean
  header?: JSXInternal.Element
}) => {
  return (
    <>
      {props.header ? props.header : <ProgressOval />}
      {props.text ? <p className="xar-loader__text">{props.text}</p> : ''}
      {props.children ? <>{props.children}</> : ''}
    </>
  )
}

const OTPEntry = ({
  loginWithOtpStart,
  loginWithOtpComplete,
  setError,
  closeFunc,
  compact,
  email,
  mode,
  toHome,
}: {
  loginWithOtpStart: () => Promise<unknown>
  loginWithOtpComplete: (
    otp: string,
    onMFAFlow: () => unknown
  ) => Promise<unknown>
  setError(): void
  closeFunc(): void
  compact: boolean
  email: string
  mode: Theme
  toHome(): void
}) => {
  const { counter, resetCounter } = useCounter(30)
  const [attempts, setAttempts] = useState(3)
  const [isInvalidOTP, setIsInvalidOTP] = useState(false)
  const [loader, setLoader] = useState({
    loading: false,
    text: '',
  })
  const [otp, setOtp] = useState('')
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const getOTPValue = () => (otp ? otp.toString().split('') : [])
  const numInputs = 6

  const onMFAFlow = () => {
    closeFunc()
  }

  useEffect(() => {
    if (otp.length == numInputs) {
      setIsInvalidOTP(false)
      disableInput()
      setLoader({ loading: true, text: 'Processing...' })
      loginWithOtpComplete(otp, onMFAFlow)
        .then(() => setLoader({ loading: false, text: '' }))
        .catch((e) => {
          console.log(e)
          setAttempts((attempts) => attempts - 1)
          setIsInvalidOTP(true)
          setLoader({ loading: false, text: '' })
          setOtp('')
          enableInput()
        })
    }
  }, [otp])

  useEffect(() => {
    if (attempts == 0) {
      setError()
    }
  }, [attempts])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const resendCode = async () => {
    setLoader({ loading: true, text: 'Sending OTP to your email address' })
    await loginWithOtpStart()
    resetCounter()
    setLoader({ loading: false, text: '' })
  }

  const disableInput = () => {
    for (let i = 0; i < numInputs; i++) {
      const ref = inputRefs.current[i]
      if (ref) {
        ref.disabled = true
      }
    }
  }

  const enableInput = () => {
    for (let i = 0; i < numInputs; i++) {
      const ref = inputRefs.current[i]
      if (ref) {
        ref.disabled = false
      }
    }
  }
  const handleFocus =
    (event: JSXInternal.TargetedFocusEvent<HTMLInputElement>) =>
    (index: number) => {
      setActiveInput(index)
      const element = event.target as HTMLInputElement
      element.select()
    }

  const isInputValueValid = (value: string) => {
    const isTypeValid = !isNaN(Number(value))
    return isTypeValid && value.trim().length === 1
  }

  const changeCodeAtFocus = (value: string) => {
    const otp = getOTPValue()
    otp[activeInput] = value[0]
    handleOTPChange(otp)
  }

  const handleOTPChange = (otp: Array<string>) => {
    const otpValue = otp.join('')
    setOtp(otpValue)
  }

  const handleInputChange = (
    event: JSXInternal.TargetedEvent<HTMLInputElement>
  ) => {
    const element = event.target as HTMLInputElement
    if (!isInputValueValid(element.value)) {
      // @ts-expect-error some shit typing
      if (event.data === null && event.inputType === 'deleteContentBackward') {
        event.preventDefault()
        changeCodeAtFocus('')
        focusInput(activeInput - 1)
      }
      element.value = ''
    } else {
      changeCodeAtFocus(element.value)
      focusInput(activeInput + 1)
    }
  }

  const handleKeyDown = (
    event: JSXInternal.TargetedKeyboardEvent<HTMLInputElement>
  ) => {
    const otp = getOTPValue()
    if ([event.code, event.key].includes('Backspace')) {
      event.preventDefault()
      changeCodeAtFocus('')
      focusInput(activeInput - 1)
    } else if (event.code === 'Delete') {
      event.preventDefault()
      changeCodeAtFocus('')
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault()
      focusInput(activeInput - 1)
    } else if (event.code === 'ArrowRight') {
      event.preventDefault()
      focusInput(activeInput + 1)
    } else if (event.key === otp[activeInput]) {
      event.preventDefault()
      focusInput(activeInput + 1)
    } else if (
      event.code === 'Spacebar' ||
      event.code === 'Space' ||
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault()
    }
  }

  const focusInput = (index: number) => {
    const activeInput = Math.max(Math.min(numInputs - 1, index), 0)
    if (inputRefs.current[activeInput]) {
      inputRefs.current[activeInput]?.focus()
      inputRefs.current[activeInput]?.select()
      setActiveInput(activeInput)
    }
  }

  const handlePaste = (
    event: JSXInternal.TargetedClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault()

    const otp = getOTPValue()
    let nextActiveInput = activeInput

    if (!event.clipboardData) {
      return
    }
    // Get pastedData in an array of max size (num of inputs - current position)
    const pastedData = event.clipboardData
      .getData('text/plain')
      .slice(0, numInputs - activeInput)
      .split('')

    // Prevent pasting if the clipboard data contains non-numeric values for number inputs
    if (pastedData.some((value: unknown) => isNaN(Number(value)))) {
      return
    }

    // Paste data from focused input onwards
    for (let pos = 0; pos < numInputs; ++pos) {
      if (pos >= activeInput && pastedData.length > 0) {
        otp[pos] = pastedData.shift() ?? ''
        nextActiveInput++
      }
    }

    focusInput(nextActiveInput)
    handleOTPChange(otp)
  }

  if (loader.loading) {
    return (
      <>
        <ProgressOval />
        <div class="xar-loader__text">{loader.text}</div>
      </>
    )
  }

  return (
    <>
      <div class="xar-otp-heading-container">
        <button
          class="xar-btn"
          style={{ position: 'absolute' }}
          onClick={toHome}
        >
          <img src={MISC_ICONS[mode]['back-arrow']} alt="back" />
        </button>
        <p class="xar-otp-heading">Enter OTP</p>
      </div>
      <div>
        <img src={MISC_ICONS[mode].email} alt="email" />
      </div>
      <div class="xar-otp-sub-heading">
        We’ve sent a verification code to
        <br />
        <span class="xar-otp-email">{email}</span>
      </div>
      <div className="xar-otp-box-container">
        <div class="xar-otp-box">
          {Array(numInputs)
            .fill(null)
            .map((_, i) => {
              return (
                <input
                  value={getOTPValue()[i] ?? ''}
                  key={i}
                  type="text"
                  maxLength={1}
                  autoComplete="off"
                  ref={(el) => (inputRefs.current[i] = el)}
                  onFocus={(event) => handleFocus(event)(i)}
                  onInput={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className={
                    isInvalidOTP
                      ? 'xar-otp-input xar-invalid-otp'
                      : 'xar-otp-input'
                  }
                />
              )
            })}
        </div>
        {isInvalidOTP ? (
          <div>
            <p class="xar-invalid-otp-text">
              Incorrect OTP. {attempts} attempts left.
            </p>
          </div>
        ) : (
          ''
        )}
      </div>

      <div>
        {counter > 0 ? (
          <span class="xar-sub-text">Resend code in {counter} seconds</span>
        ) : (
          <div>
            <span class="xar-sub-text">Did not receive your code yet?</span>
            <Action text={'Re-send code'} method={resendCode} />
          </div>
        )}
      </div>
    </>
  )
}

const useCounter = (time = 60) => {
  const [counter, setCounter] = useState(time)

  const resetCounter = () => setCounter(time)

  useEffect(() => {
    if (counter == 0) {
      setCounter(0)
      return
    }

    const intervalId = setInterval(() => {
      setCounter(counter - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [counter])

  return { counter, resetCounter }
}

const OTPError = ({ action, mode }: { action: () => void; mode: Theme }) => {
  return (
    <>
      <img class="xar-header-logo" src={MISC_ICONS[mode].failed} alt="failed" />
      <h2 class="xar-otp-error-heading">Login Failed</h2>
      <p class="xar-otp-error-subheading">
        Please check credentials and try again
      </p>
      <button className="xar-btn" onClick={action}>
        <img src={MISC_ICONS[mode]['try-again']} alt="Try again" />
        <span class="xar-action__link">Try Again</span>
      </button>
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

const Action = ({
  text,
  method,
  disabled = false,
}: {
  text: string
  method: () => void
  disabled?: boolean
}) => {
  return (
    <div class="xar-action-container">
      <button
        disabled={disabled}
        onClick={() => method()}
        className="xar-action__link"
      >
        {text}
      </button>
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
  OTPEntry,
  OTPError,
}
