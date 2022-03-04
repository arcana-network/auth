const closeButtonImage = {
  light:
    "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACuSURBVHgB7ZTBCYAwDEW/TtBRHMGNHMG6iSO4gW5kN9AUeghiNan1UOiDoNIkj0IiUKkUjTFmoOiUNT1S8IUUB8UulVLeGGrGWE4bO3DObfSYfB+K9U0aJDZ8NkiFGtm3m7Kb+bD4ypM0u+xJ+pssIp1/ld1Ik2Qt9Bzs3VEsUKASXkZ/g3BlkrgbEMnKZJOxs7xSyehnk2r27LOU/bzFo8+kovxYA6us6VGpFM0JJh9YsfU7O7QAAAAASUVORK5CYII=)",
  dark: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAD6SURBVHgB7ZTNDYIwFIBfK96NP3s4gm7gAoYRHIGygRsYQ7jrBDAQUc4Cfb4STXqh9iEXEr6kCQXKV/p+ACYmRs0ywdMmfW05a9YX3Lmey86FSbUToM9azzJf6TrFCAOd0UYjtrA4znMSxnS58JG2Mq1VO9G1gL7Qn6pV0iCNZ5fUyD7v4PJaKfgXl3RwmUvaR8Y6ayNFkCYhShp3GqG5T7GLH+Fc+XyDHVxLClyZQQIXGaA1K2cB3oABS2invgCRg2fJ9BLaMnOMxVHuOXXKwpWNPnU6mGxwKafOfKXO5m3H7FfqU+9V35g2tThAH8yuue3KbBQmJkbNGx1Y4ubJGgc3AAAAAElFTkSuQmCC)",
};

const VIEWPORT_SMALL = window.matchMedia("(max-width: 768px)").matches;
const VIEWPORT_MEDIUM = window.matchMedia(
  "(min-width: 769px) and (max-width: 1024px)"
).matches;
const VIEWPORT_LARGE = window.matchMedia("(min-width: 1025px)").matches;

const baseWidgetBubbleStyle = {
  position: "absolute",
  right: VIEWPORT_SMALL ? "20px" : "30px",
  bottom: VIEWPORT_SMALL ? "20px" : "30px",

  width: "117px",
  height: "117px",
  border: "none",
  borderRadius: "50%",
  boxShadow: "4px 5px 4px rgba(0, 0, 0, 0.25)",
  margin: "0 auto",
  cursor: "pointer",

  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const baseCloseButtonStyle = {
  width: "28px",
  height: "28px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const baseHeaderContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: "5px 5px 0px 0px",
};

const widgetBubbleStyle = {
  light: {
    ...baseWidgetBubbleStyle,
    backgroundColor: "#ededed",
  },
  dark: {
    ...baseWidgetBubbleStyle,
    backgroundColor: "#000000",
  },
};

const widgetIframeStyle = {
  container: {
    position: "absolute",
    height: VIEWPORT_SMALL ? "375px" : "540px",
    width: VIEWPORT_SMALL ? "235px" : "360px",
    right: VIEWPORT_SMALL ? "20px" : "30px",
    bottom: VIEWPORT_SMALL ? "20px" : "30px",

    display: "flex",
    flexDirection: "column",
  },
  header: {
    container: {
      light: {
        ...baseHeaderContainerStyle,
        boxShadow:
          "-1px -1px 3px #FFFFFF, 1.5px 1.5px 3px rgba(174, 174, 192, 0.4)",
        background:
          "linear-gradient(138.99deg, #F0F0F0 22.29%, rgba(254, 254, 255, 0) 101.74%)",
      },
      dark: {
        ...baseHeaderContainerStyle,
        boxShadow: "0px 9px 25px rgba(15, 15, 15, 0.25)",
        background: "#1F1F1F",
      },
    },
    logo: {
      width: "126px",
      height: "25px",
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
  },
  iframe: {
    height: "100%",
    width: "100%",
    border: "none",
  },
};

export { widgetBubbleStyle, widgetIframeStyle };
