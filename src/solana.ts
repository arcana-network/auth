import type { ArcanaProvider, RequestArguments } from './provider'
import type * as Web3Module from '@solana/web3.js'
import type * as BS58Module from 'bs58'

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
    private bs58Module: typeof BS58Module
  ) {}

  get isConnected() {
    return this.p.connected
  }

  async request(_args: RequestArguments): Promise<unknown> {
    const args = structuredClone(_args)

    switch (args.method) {
      case 'signMessage': {
        const p = args.params as {
          message: string | Uint8Array | Buffer
          display: string
        }
        if (p.message instanceof Uint8Array) {
          p.message = this.bs58Module.encode(p.message)
        }
      }
    }

    const response = await this.p.request(args)

    switch (args.method) {
      case 'signMessage': {
        return this.parseSignatureResponse(response as SignatureResRaw)
      }
      case 'signTransaction': {
        return this.web3Module.VersionedTransaction.deserialize(
          this.bs58Module.decode(response as string)
        )
      }
      case 'signAllTransactions': {
        return (response as string[]).map((x) =>
          this.web3Module.VersionedTransaction.deserialize(
            this.bs58Module.decode(x)
          )
        )
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

  signMessage(data: Uint8Array, display: string): Promise<SignatureRes> {
    const r = this.request({
      method: 'signMessage',
      params: {
        message: this.bs58Module.encode(data),
        display,
      },
    })
    return r as Promise<SignatureRes>
  }

  signTransaction(
    tx: Web3Module.VersionedTransaction | Web3Module.Transaction
  ): Promise<Web3Module.VersionedTransaction> {
    const r = this.request({
      method: 'signTransaction',
      params: {
        message: this.bs58Module.encode(tx.serialize()),
      },
    })
    return r as Promise<Web3Module.VersionedTransaction>
  }

  signAndSendTransaction(
    tx: Web3Module.VersionedTransaction | Web3Module.Transaction
  ): Promise<{ signature: string; publicKey: string }> {
    const r = this.request({
      method: 'signAndSendTransaction',
      params: {
        message: this.bs58Module.encode(tx.serialize()),
      },
    })
    return r as Promise<{ signature: string; publicKey: string }>
  }

  signAllTransactions(
    txes: (Web3Module.VersionedTransaction | Web3Module.Transaction)[]
  ): Promise<Web3Module.VersionedTransaction[]> {
    const r = this.request({
      method: 'signAllTransactions',
      params: {
        message: txes.map((x) => this.bs58Module.encode(x.serialize())),
      },
    })
    return r as Promise<Web3Module.VersionedTransaction[]>
  }
}
