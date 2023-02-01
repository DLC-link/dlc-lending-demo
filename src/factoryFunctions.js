import { userSession } from './hiroWalletUserSession';

export function createAccountInformation(walletType, blockchain, address, walletConnectSession) {
  address = walletType === 'hiro' ? userSession.loadUserData().profile.stxAddress.testnet : address;
  
  return {
    walletType,
    blockchain,
    address,
    walletConnectSession,
  };
}
