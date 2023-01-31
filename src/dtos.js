import { userSession } from './hiroWalletUserSession';

export class stacksAccountInformation {
  constructor(walletType, blockchain) {
    this.walletType = walletType;
    this.address = userSession.loadUserData().profile.stxAddress.testnet;
    this.blockchain = blockchain;
  }
}

export class metamaskAccountInformation {
  constructor(address) {
    this.walletType = 'metamask';
    this.address = address;
  }
}

export class walletConnectAccountInformation {
  constructor(address, blockchain, walletConnectSession) {
    this.walletType = 'walletconnect';
    this.address = address;
    this.blockchain = blockchain;
    this.walletConnectSession = walletConnectSession;
  }
}

export class undefinedAccountInformation {
    constructor() {
      this.walletType = undefined;
      this.address = undefined;
      this.blockchain = undefined;
      this.walletConnectSession = undefined;
    }
  }
