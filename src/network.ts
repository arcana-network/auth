import axios from 'axios'
import { ImagesURLs, Theme } from './interfaces'

const BASE_URL = 'https://gateway-dev.arcana.network/api/'

function getImageUrls(appId: string, theme: Theme): ImagesURLs {
  const url = `https://gateway-dev.arcana.network/api/v2/app/${appId}/logo?type=${theme}`
  return {
    horizontal: `${url}&orientation=horizontal`,
    vertical: `${url}&orientation=vertical`,
  }
}

const networkInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
})

export { getImageUrls }

export default networkInstance
