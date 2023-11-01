import type { ArcanaProvider, RequestArguments } from './provider'
import type * as Web3Module from '@solana/web3.js'
import * as bs58 from 'bs58'

type SignatureRes = {
  publicKey: Web3Module.PublicKey // can use new solanaWeb3.PublicKey(address),
  signature: Uint8Array
}
type SignatureResRaw = {
  signature: string
  publicKey: string
}

export class ArcanaSolanaAPI {
  static async create(p: ArcanaProvider) {
    const [w3, bs58] = await Promise.all([
      import('@solana/web3.js'),
      import('bs58'),
    ])
    return new ArcanaSolanaAPI(p, w3, bs58)
  }
  constructor(
    private p: ArcanaProvider,
    private web3Module: typeof Web3Module,
    private bs58Module: typeof bs58
  ) {}

  get isConnected() {
    return this.p.connected
  }

  async request(args: RequestArguments): Promise<unknown> {
    const response = await this.p.request(args)
    switch (args.method) {
      case 'signMessage': {
        return this.parseSignatureResponse(response as SignatureResRaw)
      }
      default: {
        return response
      }
    }
  }

  private parseSignatureResponse(input: SignatureResRaw): SignatureRes {
    return {
      signature: this.bs58Module.decode(input.signature),
      publicKey: new this.web3Module.PublicKey(input.publicKey),
    }
  }

  async signMessage(data: Uint8Array, display: string): Promise<SignatureRes> {
    const response = (await this.p.request({
      method: 'signMessage',
      params: {
        message: this.bs58Module.encode(data),
        display,
      },
    })) as SignatureResRaw

    return this.parseSignatureResponse(response)
  }
}
