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
    textAlign : "center",
    display : "flex",
    color : "white",
    backgroundColor : "black",
    alignItems : "center",
    width : "60px",
    height : "60px",
    borderRadius : "50%",
    right : "10px",
    bottom : "10px",
    margin : "0 auto",
    cursor : "pointer",
    zIndex : "200",
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
    roundButtonStyle,
    iframeStyle
}