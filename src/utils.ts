import { ethers } from "ethers";
import { getConfig } from "./config";
import {
  IWalletPosition,
  IWalletSize,
  IWidgetThemeConfig,
  Orientation,
} from "./interfaces";

const getContract = (rpcUrl: string, appAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const appContract = new ethers.Contract(
    appAddress,
    ["function walletType() view returns (uint)"],
    provider
  );

  return appContract;
};

const getWalletType = async (appId: string) => {
  const config = getConfig();

  const appAddress = await getAppAddress(appId);
  if (!appAddress) {
    console.log("App address not found");
    return null;
  }
  const c = getContract(config.RPC_URL, appAddress);
  try {
    const res = await c.functions.walletType();
    const walletType = res[0].toNumber();
    return walletType;
  } catch (e) {
    console.log({ e });
    return null;
  }
};

const getAppAddress = async (id: string) => {
  const config = getConfig();
  const res = await fetch(`${config.GATEWAY_URL}/get-address/?id=` + id);
  const json = await res.json();
  let address = json?.address;
  return address;
};

const getLogo = (themeConfig: IWidgetThemeConfig, orientation: Orientation) => {
  const { theme, assets } = themeConfig;
  return assets.logo[theme][orientation];
};

const createDomElement = (
  type: string,
  props: object,
  ...children: (string | HTMLElement)[]
): HTMLElement => {
  let dom = document.createElement(type);
  if (props) {
    Object.assign(dom, props);
    if (props.style) Object.assign(dom.style, props.style);
  }
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
};

const setWalletSize = (element: HTMLElement, sizes: IWalletSize): void => {
  const { height, width } = sizes;
  element.style.height = height;
  element.style.width = width;
};

const setWalletPosition = (
  element: HTMLElement,
  position: IWalletPosition
): void => {
  const { right, bottom } = position;
  element.style.right = right;
  element.style.bottom = bottom;
};

const getWalletSize = (isViewportSmall: Boolean): IWalletSize => {
  const sizes = { height: "", width: "" };
  if (isViewportSmall) {
    sizes.height = "375px";
    sizes.width = "235px";
  } else {
    sizes.height = "540px";
    sizes.width = "360px";
  }
  return sizes;
};

const getWalletPosition = (isViewportSmall: Boolean): IWalletPosition => {
  const position = { right: "", bottom: "" };
  if (isViewportSmall) {
    position.right = "20px";
    position.bottom = "20px";
  } else {
    position.right = "30px";
    position.bottom = "30px";
  }
  return position;
};

export {
  getWalletType,
  getLogo,
  createDomElement,
  setWalletSize,
  getWalletSize,
  setWalletPosition,
  getWalletPosition,
};
