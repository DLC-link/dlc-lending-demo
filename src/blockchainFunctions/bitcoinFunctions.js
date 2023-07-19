/*global chrome*/

import store from '../store/store';
import { loanEventReceived } from '../store/loansSlice';

const createURLParams = (bitcoinContractOffer, attestorURLs) => {
  const counterPartyWalletDetails = {
    counterpartyWalletURL: process.env.REACT_APP_WALLET_DOMAIN,
    counterpartyWalletName: 'DLC.Link',
    counterpartyWalletIcon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
  };
  const urlParams = {
    bitcoinContractOffer: JSON.stringify(bitcoinContractOffer),
    attestorURLs: JSON.stringify(attestorURLs),
    counterPartyWalletDetails,
  };

  return urlParams;
};

const sendOfferForSigning = async (urlParams) => {
  const responseStatuses = {
    accept: 'Broadcasted',
    reject: 'Rejected',
    default: 'Failed',
    4001: 'Cancelled',
    '-32600': 'FundError',
  };

  window.btc
    .request('acceptBitcoinContractOffer', urlParams)
    .then((response) => {
      const status = responseStatuses[response.result.action] || responseStatuses.default;
      store.dispatch(loanEventReceived({ status, txHash: response.result.txId, blockchain: 'BTC' }));
    })
    .catch((error) => {
      console.error(error);
      const status = responseStatuses[error.error.code] || responseStatuses.default;
      store.dispatch(loanEventReceived({ status }));
    });
};

export const fetchBitcoinContractOfferFromCounterpartyWallet = async (vaultContract) => {
  const URL = process.env.REACT_APP_WALLET_DOMAIN + `/offer`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: vaultContract.formattedUUID,
        acceptCollateral: parseInt(vaultContract.vaultCollateral),
        offerCollateral: 0,
        totalOutcomes: 100,
        attestorList: JSON.stringify(vaultContract.attestorList),
      }),
    });
    const responseStream = await response.json();
    if (!response.ok) {
      store.dispatch(loanEventReceived({ status: 'FundError', txHash: '', blockchain: 'BTC' }));
      return;
    }
    return responseStream;
  } catch (error) {
    console.error(error);
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

export const fetchBitcoinContractOfferAndSendToUserWallet = async (vaultContract) => {
  const bitcoinContractOffer = await fetchBitcoinContractOfferFromCounterpartyWallet(vaultContract);
  const urlParams = createURLParams(bitcoinContractOffer, vaultContract.attestorList);
  sendOfferForSigning(urlParams);
};
