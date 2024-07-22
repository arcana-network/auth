import { StateUpdater, Dispatch } from 'preact/hooks'
import { getSocialLogo, MISC_ICONS } from './icons'
import { Theme } from '../typings'

interface MoreProps {
  list: Array<string>
  setShow: Dispatch<StateUpdater<boolean>>
  onLoginClick: (kind: string) => void
  mode: Theme
}

export default function More(props: MoreProps) {
  const { list, setShow, mode, onLoginClick } = props

  const onSocialLoginClick = (kind: string) => {
    onLoginClick(kind)
    setShow(false)
  }

  return (
    <div class="xar-more-sheet-container">
      <div onClick={() => setShow(false)} style={{ flex: 1 }}></div>
      <div class="xar-more-sheet" onClick={(e) => e.preventDefault()}>
        <div>
          <img
            class="xar-more-shrink-icon"
            src={MISC_ICONS[mode].shrink}
            alt="close"
            onClick={() => setShow(false)}
          />
        </div>
        <p class="xar-more-sheet__title">Continue with a social account</p>
        <div class="xar-more-sheet__list-container">
          {list.map((l) => {
            return (
              <div
                className="xar-more-sheet__list-wrapper"
                onClick={() => onSocialLoginClick(l)}
              >
                <div class="xar-more-sheet__list-icon-container">
                  <img
                    src={getSocialLogo(l, mode)}
                    alt={`${l} logo`}
                    className="xar-more-sheet__list-icon"
                  />
                </div>
                <p class="xar-more-sheet__list-text">{l}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
