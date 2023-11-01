import {
  uintCV,
  bufferCV,
  cvToValue,
  callReadOnlyFunction,
  createAssetInfo,
  FungibleConditionCode,
  makeContractFungiblePostCondition,
  makeStandardFungiblePostCondition,
  PostConditionMode,
} from '@stacks/transactions';
import { userSession } from '../hiroWalletUserSession';
import { showConnect } from '@stacks/connect';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';
import { openContractCall } from '@stacks/connect';
import { customShiftValue, hexToBytes } from '../utilities/utils';
import { formatAllLoanContracts } from '../utilities/loanFormatter';
import { NonFungibleConditionCode } from '@stacks/transactions';
import { makeContractNonFungiblePostCondition } from '@stacks/transactions';
import store from '../store/store';

import { getNetworkConfig } from '../networks/networks';

import { login } from '../store/accountSlice';
import { loanEventReceived, loanSetupRequested } from '../store/loansSlice';
import { ToastEvent } from '../components/CustomToast';

const getAllAttestors = async () => {
  const { managerContractAddress, managerContractName, apiBase } = getNetworkConfig();
  const attestorNFT = 'dlc-attestors';

  const getAllAttestorsURL = `https://${apiBase}/extended/v1/tokens/nft/holdings?asset_identifiers=${managerContractAddress}.${managerContractName}::${attestorNFT}&principal=${managerContractAddress}.${managerContractName}`;
  const response = await fetch(getAllAttestorsURL);
  const result = await response.json();
  const attestorIDs = result.results.map((attestor) =>
    parseInt(attestor.value.repr.slice(1, attestor.value.repr.length))
  );
  return attestorIDs;
};

const selectRandomAttestors = async (attestorList, attestorCount) => {
  const shuffledAttestorList = [...attestorList].sort(() => 0.5 - Math.random());
  const selectedAttestors = shuffledAttestorList.slice(0, attestorCount);
  return Buffer.from(selectedAttestors);
};

const populateTxOptions = (functionName, functionArgs, postConditions, senderAddress, onFinishStatus, UUID) => {
  const { loanContractAddress, loanContractName, network } = getNetworkConfig();

  return {
    contractAddress: loanContractAddress,
    contractName: loanContractName,
    functionName,
    functionArgs,
    postConditions,
    validateWithAbi: true,
    senderAddress,
    network,
    fee: 100000,
    anchorMode: 1,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      if (typeof onFinishStatus !== 'string') {
        store.dispatch(loanSetupRequested({ txHash: `0x${data.txId}`, BTCDeposit: onFinishStatus, walletType: 'leather' }));
      } else {
        store.dispatch(
          loanEventReceived({ txHash: data.txId, status: onFinishStatus, walletType: 'leather', uuid: UUID })
        );
      }
    },
    onCancel: () => {
      store.dispatch(loanEventReceived({ status: ToastEvent.TRANSACTIONCANCELLED }));
    },
  };
};

export async function requestAndDispatchStacksAccountInformation(blockchain) {
  const isUserSignedIn = userSession.isUserSignedIn();

  const address = isUserSignedIn
    ? userSession.loadUserData().profile.stxAddress.testnet
    : await showConnectAndGetAddress(blockchain);

  const accountInformation = {
    walletType: 'leather',
    address: address,
    blockchain,
  };

  store.dispatch(login(accountInformation));
}

async function showConnectAndGetAddress(blockchain) {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'DLC.Link',
        icon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
      },
      onFinish: () => {
        switch (blockchain) {
          case 'stacks:1':
            resolve(userSession.loadUserData().profile.stxAddress.mainnet);
            break;
          case 'stacks:2147483648':
          case 'stacks:42':
            resolve(userSession.loadUserData().profile.stxAddress.testnet);
            break;
          default:
            reject(new Error('Invalid blockchain!'));
        }
      },
      userSession,
    });
  });
}

export async function sendLoanContractToStacks(loanContract) {
  const allAttestors = await getAllAttestors();
  const selectedAttestors = await selectRandomAttestors(allAttestors, loanContract.attestorCount);

  const functionName = 'setup-loan';
  const functionArgs = [uintCV(loanContract.BTCDeposit), bufferCV(selectedAttestors)];
  const senderAddress = undefined;
  const onFinishStatus = loanContract.BTCDeposit;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, onFinishStatus);

  try {
    openContractCall(txOptions);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function getAllStacksLoansForAddress() {
  const { address } = store.getState().account;

  const functionName = 'get-creator-loans';
  const functionArgs = [principalCV(address)];
  const senderAddress = address;

  let formattedLoans = [];

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined);
  try {
    const response = await callReadOnlyFunction(txOptions);
    console.log('response from Stacks', response);
    const loanContracts = response.list;
    console.log('loanContracts from Stacks', loanContracts);
    formattedLoans = formatAllLoanContracts(loanContracts, 'clarity');
    console.log('formattedLoans from Stacks', formattedLoans);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.RETRIEVALFAILED,
      })
    );
  }
  return formattedLoans;
}

export async function getStacksLoanIDByUUID(UUID) {
  const { address } = store.getState().account;

  const functionName = 'get-loan-id-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  const senderAddress = address;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined);

  try {
    const response = await callReadOnlyFunction(txOptions);
    return cvToValue(response.value);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function getStacksLoanByUUID(UUID) {
  const { address } = store.getState().account;

  const functionName = 'get-loan-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  const senderAddress = address;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined);

  try {
    const response = await callReadOnlyFunction(txOptions);
    return cvToValue(response.value);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function getStacksLoanByID(ID) {
  const { address } = store.getState().account;

  const functionName = 'get-loan';
  const functionArgs = [uintCV(ID)];
  const senderAddress = address;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined);

  try {
    const response = await callReadOnlyFunction(txOptions);
    return cvToValue(response.value);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function borrowStacksLoan(UUID, additionalLoan) {
  const amount = customShiftValue(additionalLoan, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(amount)];
  const senderAddress = undefined;
  const onFinishStatus = ToastEvent.BORROWREQUESTED;
  const { assetContractAddress, assetContractName, assetName, loanContractAddress, loanContractName } =
    getNetworkConfig();

  const contractFungiblePostConditionForBorrow = [
    makeContractFungiblePostCondition(
      loanContractAddress,
      loanContractName,
      FungibleConditionCode.GreaterEqual,
      amount,
      createAssetInfo(assetContractAddress, assetContractName, assetName)
    ),
  ];

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractFungiblePostConditionForBorrow,
    senderAddress,
    onFinishStatus
  );

  try {
    openContractCall(txOptions);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function repayStacksLoan(UUID, additionalRepayment) {
  const { address } = store.getState().account;

  const amount = customShiftValue(additionalRepayment, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(amount)];
  const senderAddress = undefined;
  const onFinishStatus = ToastEvent.REPAYREQUESTED;
  const { assetContractAddress, assetContractName, assetName } = getNetworkConfig();

  const standardFungiblePostConditionForRepay = [
    makeStandardFungiblePostCondition(
      address,
      FungibleConditionCode.LessEqual,
      amount,
      createAssetInfo(assetContractAddress, assetContractName, assetName)
    ),
  ];

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    standardFungiblePostConditionForRepay,
    senderAddress,
    onFinishStatus
  );

  try {
    openContractCall(txOptions);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function liquidateStacksLoan(UUID) {
  const { bitcoinUSDValue } = store.getState().externalData;

  const bitcoinUSDValueShifted = customShiftValue(bitcoinUSDValue, 8, false);

  const functionName = 'attempt-liquidate';
  const functionArgs = [uintCV(bitcoinUSDValueShifted), bufferCV(hexToBytes(UUID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = ToastEvent.LIQUIDATIONREQUESTED;

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractFungiblePostCondition,
    senderAddress,
    onFinishStatus,
    UUID
  );

  try {
    openContractCall(txOptions);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}

export async function closeStacksLoan(UUID) {
  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'close-loan';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const senderAddress = undefined;
  const onFinishStatus = ToastEvent.CLOSEREQUESTED;
  const openDLCNFT = 'open-dlc';
  const { managerContractAddress, managerContractName } = getNetworkConfig();

  const contractNonFungiblePostConditionForClose = [
    makeContractNonFungiblePostCondition(
      managerContractAddress,
      managerContractName,
      NonFungibleConditionCode.Sends,
      createAssetInfo(managerContractAddress, managerContractName, openDLCNFT),
      bufferCV(hexToBytes(UUID))
    ),
  ];

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractNonFungiblePostConditionForClose,
    senderAddress,
    onFinishStatus,
    UUID
  );

  try {
    openContractCall(txOptions);
  } catch (error) {
    store.dispatch(
      loanEventReceived({
        status: ToastEvent.TRANSACTIONFAILED,
      })
    );
  }
}
