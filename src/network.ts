import { AppInfo, Theme } from './interfaces'
import { getConfig } from './config'

const BASE_URL = getConfig().GATEWAY_URL

function getImageUrls(
  appId: string,
  theme: Theme
): {
  horizontal: string
  vertical: string
} {
  const API = '/api/v2/app/'
  const URL = `${BASE_URL}${API}${appId}/logo?type=${theme}`
  return {
    horizontal: `${URL}&orientation=horizontal`,
    vertical: `${URL}&orientation=vertical`,
  }
}

async function getAppInfo(appId: string) {
  const API = '/api/v1/get-app-theme/'
  const URL = `${BASE_URL}${API}?id=${appId}`
  const appInfo: AppInfo = await (await fetch(URL)).json()
  return appInfo
}

export { getImageUrls, getAppInfo }
