function createElement(type, props, ...children) {
  const dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

function setElementAttribute(element, props) {
  Object.assign(element, props);
}

const widgetButtonImage = createElement("img", {
  className: "arcana-widget_button-img",
});

const widgetButton = createElement(
  "button",
  {
    className: "arcana-widget_button",
    onclick: onWidgetButtonClick,
  },
  widgetButtonImage
);

const widgetHeaderLogo = createElement("img", {
  className: "arcana-widget_iframe-header_logo",
});

const widgetCloseButton = createElement("button", {
  className: "arcana_widget_iframe-header-close-btn",
  onclick: onCloseWidgetClick,
});

const widgetIframeHeader = createElement(
  "div",
  {
    className: "arcana-widget_iframe-header",
  },
  widgetHeaderLogo,
  widgetCloseButton
);

const widgetIframe = createElement("iframe", {
  className: "arcana-widget_iframe",
  src: "http://arcana.network",
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
  { className: "arcana-widget_iframe-container arcana_widget-component-hide" },
  widgetIframeHeader,
  widgetIframeBody
);

const widgetContainer = createElement(
  "div",
  {
    className: "arcana-widget",
  },
  widgetButton,
  widgetIframeContainer
);

function onWidgetButtonClick() {
  widgetIframeContainer.classList.remove("arcana_widget-component-hide");
  widgetButton.classList.add("arcana_widget-component-hide");
}

function onCloseWidgetClick() {
  widgetIframeContainer.classList.add("arcana_widget-component-hide");
  widgetButton.classList.remove("arcana_widget-component-hide");
}

function initWidgetUI(config = {}) {
  setElementAttribute(widgetButtonImage, { src: config.logo_button });
  setElementAttribute(widgetHeaderLogo, { src: config.logo_header });
  document.body.appendChild(widgetContainer);
}
