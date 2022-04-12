import { LoginType, OAuthFetcher } from './types';
import { ethers } from 'ethers';

export class OAuthContractMeta implements OAuthFetcher {
  private appContract: ethers.Contract;
  private clientIDs: Record<string, string>;
  constructor(appAddress: string, rpcUrl: string) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.appContract = new ethers.Contract(
      appAddress,
      [
        'function clientID(string) public view returns (string)',
      ],
      provider
    );
    this.clientIDs = {};
  }

  public async getClientID(loginType: LoginType): Promise<string> {
    try {
      if (!this.clientIDs[loginType]) {
        const clientID: string[] = await this.appContract.functions.clientID(loginType);
        if (clientID[0]) {
          this.clientIDs[loginType] = clientID[0];
        }
      }
      return this.clientIDs[loginType];
    } catch (e) {
      return '';
    }
  }

  public getLogins = async (): Promise<string[]> => {
    for (const l of Object.values(LoginType)) {
      await this.getClientID(l);
    }
    return Object.keys(this.clientIDs);
  };
}
