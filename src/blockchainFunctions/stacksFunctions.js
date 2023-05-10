import { StacksMocknet } from '@stacks/network';
import {
  uintCV,
  bufferCV,
  cvToValue,
  callReadOnlyFunction,
  createAssetInfo,
  FungibleConditionCode,
  makeContractFungiblePostCondition,
  makeStandardFungiblePostCondition,
} from '@stacks/transactions';
import { userSession } from '../hiroWalletUserSession';
import { showConnect } from '@stacks/connect';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';
import { openContractCall } from '@stacks/connect';
import { customShiftValue, hexToBytes } from '../utils';
import { formatAllLoanContracts } from '../utilities/loanFormatter';
import store from '../store/store';

import { StacksNetworks } from '../networks/networks';

import { login } from '../store/accountSlice';
import { loanEventReceived, loanSetupRequested } from '../store/loansSlice';
import { requestStatuses } from '../enums/loanStatuses';

const populateTxOptions = (functionName, functionArgs, postConditions, senderAddress, onFinishStatus, blockchain) => {
  const { loanContractAddress, loanContractName, network } = StacksNetworks[blockchain];

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
    onFinish: (data) => {
      if (typeof onFinishStatus !== 'string') {
        store.dispatch(loanSetupRequested(onFinishStatus));
      } else {
        store.dispatch(loanEventReceived({ txHash: data.txId, status: onFinishStatus }));
      }
    },
    onCancel: () => {
      store.dispatch(loanEventReceived({ status: onFinishStatus }));
    },
  };
};

export async function requestAndDispatchStacksAccountInformation(walletType, blockchain) {
  const isUserSignedIn = userSession.isUserSignedIn();

  let address;
  switch (blockchain) {
    case 'stacks:1':
      address = isUserSignedIn
        ? userSession.loadUserData().profile.stxAddress.mainnet
        : await showConnectAndGetAddress(blockchain);
      break;
    case 'stacks:2147483648':
    case 'stacks:42':
      address = isUserSignedIn
        ? userSession.loadUserData().profile.stxAddress.testnet
        : await showConnectAndGetAddress(blockchain);
      break;
    default:
      throw new Error('Invalid blockchain!');
  }

  const accountInformation = {
    walletType: walletType,
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
  const { walletType, blockchain } = store.getState().account;

  const functionName = 'setup-loan';
  const functionArgs = [
    uintCV(loanContract.BTCDeposit),
    uintCV(loanContract.liquidationRatio),
    uintCV(loanContract.liquidationFee),
    uintCV(loanContract.emergencyRefundTime),
  ];
  const senderAddress = undefined;
  const onFinishStatus = loanContract.BTCDeposit;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, onFinishStatus, blockchain);

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42' && walletType === 'hiro') {
    txOptions.network = new StacksMocknet({
      url: process.env.REACT_APP_STACKS_PROXY_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
    });
  }

  try {
    openContractCall(txOptions);
  } catch (error) {
    console.error(error);
  }
}

export async function getAllStacksLoansForAddress() {
  const { address, blockchain } = store.getState().account;

  const functionName = 'get-creator-loans';
  const functionArgs = [principalCV(address)];
  const senderAddress = address;

  let formattedLoans = [];

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined, blockchain);
  try {
    const response = await callReadOnlyFunction(txOptions);
    const loanContracts = response.list;
    formattedLoans = formatAllLoanContracts(loanContracts, 'clarity');
  } catch (error) {
    console.error(error);
  }
  return formattedLoans;
}

export async function getStacksLoanIDByUUID(UUID) {
  const { address, blockchain } = store.getState().account;

  const functionName = 'get-loan-id-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  const senderAddress = address;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined, blockchain);

  try {
    const response = await callReadOnlyFunction(txOptions);
    return cvToValue(response.value);
  } catch (error) {
    console.error(error);
  }
}

export async function getStacksLoanByUUID(UUID) {
  const { address, blockchain } = store.getState().account;

  const functionName = 'get-loan-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  const senderAddress = address;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined, blockchain);

  try {
    const response = await callReadOnlyFunction(txOptions);
    return cvToValue(response.value);
  } catch (error) {
    console.error(error);
  }
}

export async function borrowStacksLoan(UUID, additionalLoan) {
  const { walletType, blockchain } = store.getState().account;

  const amount = customShiftValue(additionalLoan, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(amount)];
  const senderAddress = undefined;
  const onFinishStatus = requestStatuses.BORROWREQUESTED;
  const { assetContractAddress, assetContractName, assetName } = StacksNetworks[blockchain];

  const contractFungiblePostConditionForBorrow = [
    makeContractFungiblePostCondition(
      StacksNetworks[blockchain].loanContractAddress,
      StacksNetworks[blockchain].loanContractName,
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
    onFinishStatus,
    blockchain
  );

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42' && walletType === 'hiro') {
    txOptions.network = new StacksMocknet({
      url: process.env.REACT_APP_STACKS_PROXY_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
    });
  }

  try {
    openContractCall(txOptions);
  } catch (error) {
    console.error(error);
  }
}

export async function repayStacksLoan(UUID, additionalRepayment) {
  const { address, walletType, blockchain } = store.getState().account;

  const amount = customShiftValue(additionalRepayment, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(amount)];
  const senderAddress = undefined;
  const onFinishStatus = requestStatuses.REPAYREQUESTED;
  const { assetContractAddress, assetContractName, assetName } = StacksNetworks[blockchain];

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
    onFinishStatus,
    blockchain
  );

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42' && walletType === 'hiro') {
    txOptions.network = new StacksMocknet({
      url: process.env.REACT_APP_STACKS_PROXY_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
    });
  }

  try {
    openContractCall(txOptions);
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateStacksLoan(UUID) {
  const { walletType, blockchain } = store.getState().account;

  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'attempt-liquidate';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = requestStatuses.LIQUIDATIONREQUESTED;

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractFungiblePostCondition,
    senderAddress,
    onFinishStatus,
    blockchain
  );

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42' && walletType === 'hiro') {
    txOptions.network = new StacksMocknet({
      url: process.env.REACT_APP_STACKS_PROXY_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
    });
  }

  try {
    openContractCall(txOptions);
  } catch (error) {
    console.error(error);
  }
}

export async function closeStacksLoan(UUID) {
  const { walletType, blockchain } = store.getState().account;

  const loanContractID = await getStacksLoanIDByUUID(UUID);
  const functionName = 'close-loan';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = requestStatuses.CLOSEREQUESTED;

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractFungiblePostCondition,
    senderAddress,
    onFinishStatus,
    blockchain
  );

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42' && walletType === 'hiro') {
    txOptions.network = new StacksMocknet({
      url: process.env.REACT_APP_STACKS_PROXY_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
    });
  }

  try {
    openContractCall(txOptions);
  } catch (error) {
    console.error(error);
  }
}
