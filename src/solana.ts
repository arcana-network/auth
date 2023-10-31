import type { ArcanaProvider, RequestArguments } from './provider'
import * as bs58 from 'bs58'

export class ArcanaSolanaAPI {
  constructor(private p: ArcanaProvider) {}

  async request(args: RequestArguments): Promise<unknown> {
    const response = await this.p.request(args)
    switch (args.method) {
      case 'signMessage': {
        return bs58.decode(<string>response)
      }
      default: {
        return response
      }
    }
  }

  async signMessage(data: Uint8Array, display: string): Promise<Uint8Array> {
    return (await this.p.request({
      method: 'signMessage',
      params: {
        message: data,
        display,
      },
    })) as Uint8Array
  }
}
