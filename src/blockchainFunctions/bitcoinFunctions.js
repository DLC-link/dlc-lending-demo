/*global chrome*/

import store from '../store/store';
import { loanEventReceived } from '../store/loansSlice';

const sendOfferForSigning = async (bitcoinContractOffer) => {
  const urlParams = {
    bitcoinContractOffer: JSON.stringify(bitcoinContractOffer),
    counterpartyWalletURL: process.env.REACT_APP_WALLET_DOMAIN,
    counterpartyWalletName: 'DLC.Link',
    counterpartyWalletIcon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
  };
  
  window.btc
    ?.request('acceptOffer', urlParams)
    .then((response) => {
      console.log(response);
      if (response.action === 'broadcast') {
        store.dispatch(loanEventReceived({ status: 'Broadcasted', txHash: response.txID, blockchain: 'BTC' }));
      } else {
        store.dispatch(loanEventReceived({ status: 'Rejected' }));
      }
    })
    .catch((error) => {
      console.error(error);
      if (error.error.code === 4001) store.dispatch(loanEventReceived({ status: 'Cancelled' }));
      if (error.error.code === -32600) store.dispatch(loanEventReceived({ status: 'FundError' }));
      // store.dispatch(loanEventReceived({ status: 'Cancelled' }));
    });
};

export const lockBTC = async (vaultContract) => {
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
      }),
    });
    console.log(vaultContract.formattedUUID)
    const responseStream = await response.json();
    if (!response.ok) {
      console.error(responseStream.errors[0].message);
    }
    sendOfferForSigning(responseStream);
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
