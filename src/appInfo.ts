import { AppInfo, AppThemeInfo, Theme } from './typings'

function getImageUrls(appId: string, theme: Theme, gatewayUrl: string) {
  const u = new URL(`/api/v2/app/${appId}/logo/?type=${theme}`, gatewayUrl)
  return {
    horizontal: `${u.toString()}&orientation=horizontal`,
    vertical: `${u.toString()}&orientation=vertical`,
  }
}

async function getAppThemeInfo(appId: string, gatewayUrl: string) {
  const u = new URL(`/api/v1/get-app-theme/?id=${appId}`, gatewayUrl)
  const appInfo: AppThemeInfo = await (await fetch(u.toString())).json()
  return appInfo
}

async function getAppInfo(appId: string, gatewayUrl: string) {
  const u = new URL(`/api/v1/get-app-config/?id=${appId}`, gatewayUrl)
  const appInfo: AppInfo = await (await fetch(u.toString())).json()
  return appInfo
}

export { getAppInfo, getAppThemeInfo, getImageUrls }
