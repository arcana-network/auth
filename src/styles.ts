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
}

const baseHeaderContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 16px',
  borderRadius: '10px 10px 0px 0px',
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
    width: '40px',
    height: '40px',
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
  },
  header: {
    container: {
      light: {
        ...baseHeaderContainerStyle,
        boxShadow:
          '-1px -1px 3px #FFFFFF, 1.5px 1.5px 3px rgba(174, 174, 192, 0.4)',
        background:
          'linear-gradient(138.99deg, #F0F0F0 22.29%, rgba(254, 254, 255, 0) 101.74%)',
      },
      dark: {
        ...baseHeaderContainerStyle,
        boxShadow: '0px 9px 25px rgba(15, 15, 15, 0.25)',
        background: '#1F1F1F',
      },
    },
    logo: {
      width: '126px',
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
