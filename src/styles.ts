const closeButtonStyle =  {
    position: "absolute",
    textAlign : "center",
    display : "none",
    color : "white",
    backgroundColor : "black",
    alignItems : "center",
    width : "25px",
    height : "25px",
    borderRadius : "50%",
    right : "0",
    bottom : "500px",
    margin : "0 auto",
    cursor : "pointer",
    zIndex : "400",
}

const roundButtonStyle = {
    position : "absolute",
    right : "30px",
    bottom : "30px",

    width : "117px",
    height : "117px",
    border: "none",
    borderRadius : "50%",
    boxShadow: "4px 5px 4px rgba(0, 0, 0, 0.25)",
    margin : "0 auto",
    cursor : "pointer",
    zIndex : "200",

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
}

const roundButtonStyle_theme = {
    light: {
        ...roundButtonStyle,
        backgroundColor : "#ededed",
    },
    dark: {
        ...roundButtonStyle,
        backgroundColor : "#000000",
    }
}

const iframeStyle = {
    position: "absolute",
    display: "none",
    height: "500px",
    width: "400px",
    top: "auto",
    left: "auto",
    right: "10px",
    bottom: "10px",
    zIndex: "300",
};


export {
    closeButtonStyle,
    roundButtonStyle_theme,
    iframeStyle
}