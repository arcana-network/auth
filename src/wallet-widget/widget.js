widgetImagePath = "./assets/images/widget_logo_example.png";
widgetCompanyName = "xyz company";

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
  widgetCompanyName
);

const widgetButton = createElement(
  "button",
  {
    className: "arcana-widget_button",
  },
  widgetButtonImage,
  widgetButtonText
);

const widgetContainer = createElement(
  "div",
  {
    className: "arcana-widget",
  },
  widgetButton
);

document.body.appendChild(widgetContainer);
