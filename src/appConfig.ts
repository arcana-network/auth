import { AppInfo, Theme } from './typings'

function getImageUrls(
  appId: string,
  theme: Theme,
  gatewayUrl: string
): {
  horizontal: string
  vertical: string
} {
  const API = '/api/v2/app/'
  const URL = `${gatewayUrl}${API}${appId}/logo?type=${theme}`
  return {
    horizontal: `${URL}&orientation=horizontal`,
    vertical: `${URL}&orientation=vertical`,
  }
}

async function getAppInfo(appId: string, gatewayUrl: string) {
  const API = '/api/v1/get-app-theme/'
  const URL = `${gatewayUrl}${API}?id=${appId}`
  const appInfo: AppInfo = await (await fetch(URL)).json()
  return appInfo
}

export { getImageUrls, getAppInfo }
