import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

const Overlay = (props: {
  shouldClose: boolean
  children: preact.ComponentChildren
}) => {
  const [display, setDisplay] = useState('flex')
  const clickHandler = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement)?.id == 'xar-modal' && props.shouldClose) {
      setDisplay('none')
    }
  }
  return (
    <div id="xar-modal" style={{ display }} onClick={clickHandler}>
      {props.children}
    </div>
  )
}

export { Overlay }
