/*global chrome*/

import store from '../store/store';
import { fetchLoans, loanEventReceived } from '../store/loansSlice';
import { ToastEvent } from '../components/CustomToast';
import { customShiftValue } from '../utilities/utils';

const createURLParams = (bitcoinContractOffer, attestorURLs) => {
  const { walletType, blockchain } = store.getState().account;

  let routerWalletURL = '';
  switch (walletType) {
    case 'metamask':
      switch (blockchain) {
        case 'ethereum:5':
        case 'ethereum:11155111':
          routerWalletURL = process.env.REACT_APP_TESTNET_ETHEREUM_WALLET_DOMAIN;
          break;
        case 'ethereum:31337':
          routerWalletURL = process.env.REACT_APP_DEVNET_ETHEREUM_WALLET_DOMAIN;
          break;
        default:
          console.error('Blockchain not supported');
          break;
      }
    case 'leather':
    case 'xverse':
    case 'walletConnect':
      switch (blockchain) {
        case 'stacks:1':
          routerWalletURL = process.env.REACT_APP_MAINNET_STACKS_WALLET_DOMAIN;
        case 'stacks:2147483648':
          routerWalletURL = process.env.REACT_APP_TESTNET_STACKS_WALLET_DOMAIN;
          break;
        case 'stacks:42':
          routerWalletURL = process.env.REACT_APP_DEVNET_STACKS_WALLET_DOMAIN;
          break;
        default:
          console.error('Blockchain not supported');
          break;
      }
    default:
      console.error('Wallet type not supported');
      break;
  }

  const counterPartyWalletDetails = {
    counterpartyWalletURL: routerWalletURL,
    counterpartyWalletName: 'DLC.Link',
    counterpartyWalletIcon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
  };
  const urlParams = {
    bitcoinContractOffer: JSON.stringify(bitcoinContractOffer),
    attestorURLs: JSON.stringify(attestorURLs),
    counterpartyWalletDetails: JSON.stringify(counterPartyWalletDetails),
  };

  return urlParams;
};

const sendOfferForSigning = async (urlParams, loanUUID) => {
  window.btc
    .request('acceptBitcoinContractOffer', urlParams)
    .then((response) => {
      store.dispatch(
        loanEventReceived({
          status: ToastEvent.ACCEPTSUCCEEDED,
          txHash: response.result.txId,
          uuid: loanUUID,
        })
      );
      store.dispatch(fetchLoans());
    })
    .catch((error) => {
      store.dispatch(
        loanEventReceived({
          status: ToastEvent.ACCEPTFAILED,
        })
      );
    });
};

export const fetchBitcoinContractOfferFromCounterpartyWallet = async (loanContract) => {
  const { walletType, blockchain } = store.getState().account;

  let routerWalletURL = '';
  switch (walletType) {
    case 'metamask':
      switch (blockchain) {
        case 'ethereum:5':
        case 'ethereum:11155111':
          routerWalletURL = process.env.REACT_APP_TESTNET_ETHEREUM_WALLET_DOMAIN;
          break;
        case 'ethereum:31337':
          routerWalletURL = process.env.REACT_APP_DEVNET_ETHEREUM_WALLET_DOMAIN;
          break;
        default:
          console.error('Blockchain not supported');
          break;
      }
    case 'leather':
    case 'xverse':
    case 'walletConnect':
      switch (blockchain) {
        case 'stacks:1':
          routerWalletURL = process.env.REACT_APP_MAINNET_STACKS_WALLET_DOMAIN;
        case 'stacks:2147483648':
          routerWalletURL = process.env.REACT_APP_TESTNET_STACKS_WALLET_DOMAIN;
          break;
        case 'stacks:42':
          routerWalletURL = process.env.REACT_APP_DEVNET_STACKS_WALLET_DOMAIN;
          break;
        default:
          console.error('Blockchain not supported');
          break;
      }
    default:
      console.error('Wallet type not supported');
      break;
  }

  const attestorListJSON = JSON.stringify(loanContract.attestorList);

  try {
    const response = await fetch(`${routerWalletURL}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: loanContract.uuid,
        acceptCollateral: customShiftValue(loanContract.vaultCollateral, 8, false),
        offerCollateral: 0,
        totalOutcomes: 100,
        attestorList: attestorListJSON,
      }),
    });
    const responseStream = await response.json();
    if (!response.ok) {
      store.dispatch(
        loanEventReceived({
          status: ToastEvent.FETCHFAILED,
        })
      );
      return;
    }
    return responseStream;
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.FETCHFAILED,
      })
    );
  }
};

export const fetchBitcoinPrice = async () => {
  let bitCoinValue = undefined;
  try {
    await fetch('https://api.coindesk.com/v1/bpi/currentprice.json', {
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.json())
      .then((message) => (bitCoinValue = Number(message.bpi.USD.rate.replace(/[^0-9.-]+/g, ''))));
  } catch (error) {
    console.error(error);
  }
  return bitCoinValue;
};

export const fetchBitcoinContractOfferAndSendToUserWallet = async (loanContract) => {
  const bitcoinContractOffer = await fetchBitcoinContractOfferFromCounterpartyWallet(loanContract);
  if (!bitcoinContractOffer) return;
  const urlParams = createURLParams(bitcoinContractOffer, loanContract.attestorList);
  await sendOfferForSigning(urlParams, loanContract.uuid);
};
