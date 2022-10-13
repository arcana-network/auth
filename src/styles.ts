const closeButtonImage = {
  light:
    'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuSURBVHgB7ZTBCYAwDEW/TtBRHMGNHMG6iSO4gW5kN9AUeghiNan1UOiDoNIkj0IiUKkUjTFmoOiUNT1S8IUUB8UulVLeGGrGWE4bO3DObfSYfB+K9U0aJDZ8NkiFGtm3m7Kb+bD4ypM0u+xJ+pssIp1/ld1Ik2Qt9Bzs3VEsUKASXkZ/g3BlkrgbEMnKZJOxs7xSyehnk2r27LOU/bzFo8+kovxYA6us6VGpFM0JJh9YsfU7O7QAAAAASUVORK5CYII=)',
  dark: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACsSURBVHgB7ZTNCcQgEEZHbWhLSEdbwlrKlrAdbEnJRfy5JAoZCCEJMxM9BHwgevDzgc4I0Ok8mhDCO6X04mS89wNIKME85iwdqdIY46dkygwScthSpShbhwUpFGk1GUVaXXYlbSY7kjrnvk1le6lUpoGJ1nrGtVJqMsb8oBXbN8vX+uf2qViG18jp09sypLqUUvrVpJw+uy3Fz5tT+puWIe0/O8AyMwN0Oo9mAWX8dJ7PBgbsAAAAAElFTkSuQmCC)',
}

const baseWidgetBubbleStyle = {
  position: 'absolute',

  width: '117px',
  height: '117px',
  border: 'none',
  borderRadius: '50%',
  boxShadow: '4px 5px 4px rgba(0, 0, 0, 0.25)',
  margin: '0 auto',
  cursor: 'pointer',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}

const baseCloseButtonStyle = {
  width: '28px',
  height: '28px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  marginLeft: '5px',
}

const baseHeaderContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 16px',
  borderRadius: '10px 10px 0px 0px',
  zIndex: '1',
}

const widgetBubbleStyle = {
  light: {
    ...baseWidgetBubbleStyle,
    backgroundColor: '#ededed',
  },
  dark: {
    ...baseWidgetBubbleStyle,
    backgroundColor: '#000000',
  },
  bubbleLogo: {
    width: '60px',
    objectFit: 'contain',
  },
  closeButton: {
    ...baseCloseButtonStyle,
    width: '20px',
    height: '20px',

    position: 'absolute',
    top: '-15px',
    right: '0px',

    backgroundImage: closeButtonImage.light,
    backgroundPosition: 'center',
  },
  reqCountBadge: {
    width: '25px',
    height: '25px',
    borderRadius: '50%',
    background: 'linear-gradient(159.35deg, #F3A2A2 -22.29%, #FFB1B1 102.13%)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontWeight: 600,
    fontSize: '12px',

    position: 'absolute',
    top: '-10px',
    left: '10px',
  },
}

const widgetIframeStyle = {
  container: {
    position: 'absolute',
    // Size and position values are set in iframewrapper.ts

    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 5px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '10px',
  },
  header: {
    container: {
      light: {
        ...baseHeaderContainerStyle,
        boxShadow: '2px 2px 2px 0px #0000000D, -2px -2px 1px 0px #FFFFFFB2',
        background: '#F9F9F9',
      },
      dark: {
        ...baseHeaderContainerStyle,
        boxShadow: '0 5px 4px -4px #181818',
        background: '#262626',
      },
    },
    logo: {
      height: '25px',
    },
    closeButton: {
      light: {
        ...baseCloseButtonStyle,
        backgroundImage: closeButtonImage.light,
      },
      dark: {
        ...baseCloseButtonStyle,
        backgroundImage: closeButtonImage.dark,
      },
    },
  },
  body: {
    flex: 1,
    display: 'flex',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '0px 0px 10px 10px',
  },
}

export { widgetBubbleStyle, widgetIframeStyle }
