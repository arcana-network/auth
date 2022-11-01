import { JSX } from 'preact'

const ID = 'xar-modal'
const Overlay = (props: {
  children: preact.ComponentChildren
  closeFunc?: (error?: Error) => void
}) => {
  const clickHandler = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement)?.id == ID) {
      if (props.closeFunc)
        props.closeFunc(new Error('User closed the connect modal'))
    }
  }
  return (
    <div id={ID} onClick={clickHandler}>
      {props.children}
    </div>
  )
}

export { Overlay }
