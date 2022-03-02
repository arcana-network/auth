import { ethers } from 'ethers'
import { getConfig } from "./config"
import { IWidgetThemeConfig, Orientation } from './interfaces'

const getContract = (rpcUrl: string, appAddress: string) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const appContract = new ethers.Contract(
        appAddress, ['function walletType() view returns (uint)'],
        provider
    );

    return appContract;
}


const getWalletType = async (appId: string) => {
    const config = getConfig();

    const appAddress = await getAppAddress(appId);
    if(!appAddress) {
        console.log("App address not found")
        return null
    }
    const c = getContract(config.RPC_URL, appAddress);
    try {
        const res = await c.functions.walletType();
        const walletType = res[0].toNumber()
        return walletType;
    } catch(e) {
        console.log({ e })
        return null;
    }
}

const getAppAddress = async (id: string) => {
    const config = getConfig();
    const res = await fetch(
      `${config.GATEWAY_URL}/get-address/?id=` + id
    );
    const json = await res.json();
    let address = json?.address;
    return address;
  };

const getWidgetButtonImage = (theme: string, assets: object) => {
    if(theme === "dark") {
        return assets.logo_vertical_dark
    } else if(theme = "light") {
        return assets.logo_vertical_light
    }
}

export { getWalletType, getWidgetButtonImage }