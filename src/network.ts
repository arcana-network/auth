import axios from 'axios'
import { AppInfo, Theme } from './interfaces'
import { getConfig } from './config'

const BASE_URL = getConfig().GATEWAY_URL

const gateWay = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

function getImageUrls(
  appId: string,
  theme: Theme
): {
  horizontal: string
  vertical: string
} {
  const API = '/api/v2/app/'
  const url = `${BASE_URL}${API}${appId}/logo?type=${theme}`
  return {
    horizontal: `${url}&orientation=horizontal`,
    vertical: `${url}&orientation=vertical`,
  }
}

async function getAppInfo(appId: string) {
  const API = '/api/v1/get-app-theme/'
  const { data }: { data: AppInfo } = await gateWay.get(API, {
    params: { id: appId },
  })
  return data
}

export { getImageUrls, getAppInfo }
