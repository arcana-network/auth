widgetImagePath = "./assets/images/widget_logo_example.png";
widgetCloseImg = "./assets/images/close_button.png";
widgetAppName = "xyz company";

function createElement(type, props, ...children) {
  const dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

const widgetButtonImage = createElement("img", {
  src: widgetImagePath,
  className: "arcana-widget_button-img",
});

const widgetButtonText = createElement(
  "span",
  { className: "arcana-widget_button-text" },
  widgetAppName
);

const widgetButton = createElement(
  "button",
  {
    className: "arcana-widget_button",
  },
  widgetButtonImage,
  widgetButtonText
);

const widgetHeaderLogo = createElement("img", {
  src: widgetImagePath,
  className: "arcana-widget_iframe-header_logo",
});

const widgetHeaderText = createElement(
  "span",
  { className: "arcana-widget_iframe-header_text" },
  widgetAppName
);

const widgetLogoText = createElement(
  "div",
  { className: "arcana-widget_iframe-header_logo-text" },
  widgetHeaderLogo,
  widgetHeaderText
);

const widgetCloseButtonImg = createElement("img", {
  src: widgetCloseImg,
  className: "arcana_widget_iframe-header-close-btn-img",
});

const widgetCloseButton = createElement(
  "button",
  { className: "arcana_widget_iframe-header-close-btn" },
  widgetCloseButtonImg
);

const widgetIframeHeader = createElement(
  "div",
  {
    className: "arcana-widget_iframe-header",
  },
  widgetLogoText,
  widgetCloseButton
);

const widgetIframe = createElement("iframe", {
  className: "arcana-widget_iframe",
});

const widgetIframeBody = createElement(
  "div",
  {
    className: "arcana-widget_iframe-body",
  },
  widgetIframe
);

const widgetIframeContainer = createElement(
  "div",
  { className: "arcana-widget_iframe-container" },
  widgetIframeHeader,
  widgetIframeBody
);

const widgetContainer = createElement(
  "div",
  {
    className: "arcana-widget",
  },
  widgetIframeContainer
);

document.body.appendChild(widgetContainer);
