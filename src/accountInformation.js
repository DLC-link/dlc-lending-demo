import { userSession } from './hiroWalletUserSession';
import eventBus from './EventBus';

export function createAndDispatchAccountInformation(walletType, address, blockchain, walletConnectSession) {
  if (['hiro', 'xverse'].includes(walletType)) {
    address = userSession.loadUserData().profile.stxAddress.testnet;
  }

  const accountInformation = {
    walletType,
    address,
    blockchain,
    walletConnectSession,
  };
  eventBus.dispatch('account-information', accountInformation);
}
