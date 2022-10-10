import { h, JSX } from 'preact'

const Overlay = (props: {
  children: preact.ComponentChildren
  closeFunc?: () => void
}) => {
  const clickHandler = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement)?.id == 'xar-modal') {
      if (props.closeFunc) props.closeFunc()
    }
  }
  return (
    <div id="xar-modal" onClick={clickHandler}>
      {props.children}
    </div>
  )
}

export { Overlay }
