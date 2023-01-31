import { StacksMainnet, StacksMocknet, StacksTestnet } from '@stacks/network';
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
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';
import { openContractCall } from '@stacks/connect';
import { customShiftValue, fixedTwoDecimalUnshift, hexToBytes } from '../utils';
import eventBus from '../EventBus';
import loanFormatter from '../LoanFormatter';
import { blockchains } from '../networks';

const populateTxOptions = (functionName, functionArgs, postConditions, senderAddress, onFinishStatus, blockchain) => {
  const contractAddress = blockchains[blockchain].sampleContractAddress;
  const contractName = blockchains[blockchain].sampleContractName;
  const network = blockchains[blockchain].network;

  return {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    postConditions: postConditions,
    validateWithAbi: true,
    senderAddress: senderAddress,
    network: network,
    fee: 100000,
    anchorMode: 1,
    onFinish: (data) => {
      eventBus.dispatch('loan-event', { status: onFinishStatus, txId: data.txId, chain: 'stacks' });
    },
    onCancel: () => {
      eventBus.dispatch('loan-event', { status: 'cancelled' });
    },
  };
};

export async function sendLoanContractToStacks(loanContract, blockchain) {
  const functionName = 'setup-loan';
  const functionArgs = [
    uintCV(loanContract.BTCDeposit),
    uintCV(loanContract.liquidationRatio),
    uintCV(loanContract.liquidationFee),
    uintCV(loanContract.emergencyRefundTime),
  ];
  const senderAddress = undefined;
  const onFinishStatus = 'created';

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, onFinishStatus, blockchain);

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42') {
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

export async function getStacksLoans(creator, blockchain) {
  const functionName = 'get-creator-loans';
  const functionArgs = [principalCV(creator)];
  const senderAddress = creator;
  let loans = [];

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined, blockchain);

  try {
    const response = await callReadOnlyFunction(txOptions);
    loans = loanFormatter.formatAllDLC(response.list, 'clarity');
  } catch (error) {
    console.error(error);
  }
  return loans;
}

export async function getStacksLoanIDByUUID(creator, UUID, blockchain) {
  const functionName = 'get-loan-id-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  const senderAddress = creator;

  const txOptions = populateTxOptions(functionName, functionArgs, [], senderAddress, undefined, blockchain);

  try {
    const response = await callReadOnlyFunction(txOptions);
    return cvToValue(response.value);
  } catch (error) {
    console.error(error);
  }
}

export async function borrowStacksLoanContract(creator, UUID, additionalLoan, blockchain) {
  console.log(blockchain);
  const amount = customShiftValue(additionalLoan, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID, blockchain);
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(amount)];
  const senderAddress = undefined;
  const onFinishStatus = 'borrow-requested';
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const contractFungiblePostConditionForBorrow = [
    makeContractFungiblePostCondition(
      process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
      FungibleConditionCode.GreaterEqual,
      amount,
      createAssetInfo(assetAddress, assetContractName, assetName)
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
  if (blockchain === 'stacks:42') {
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

export async function repayStacksLoanContract(creator, UUID, additionalRepayment, blockchain) {
  const amount = customShiftValue(additionalRepayment, 6, false);
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID, blockchain);
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(amount)];
  const senderAddress = undefined;
  const onFinishStatus = 'repay-requested';
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const standardFungiblePostConditionForRepay = [
    makeStandardFungiblePostCondition(
      creator,
      FungibleConditionCode.LessEqual,
      amount,
      createAssetInfo(assetAddress, assetContractName, assetName)
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
  if (blockchain === 'stacks:42') {
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

export async function liquidateStacksLoanContract(creator, UUID, blockchain) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID, blockchain);
  const functionName = 'attempt-liquidate';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = 'liquidation-requested';

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractFungiblePostCondition,
    senderAddress,
    onFinishStatus,
    blockchain
  );

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42') {
    txOptions.network = new StacksMocknet({
      url: process.env.REACT_APP_STACKS_PROXY_ADDRESS + process.env.REACT_APP_STACKS_PORT_ADDRESS,
    });
  }

  try {
    openContractCall();
  } catch (error) {
    console.error(error);
  }
}

export async function closeStacksLoanContract(creator, UUID, blockchain) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID, blockchain);
  const functionName = 'close-loan';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = 'closing-requested';

  const txOptions = populateTxOptions(
    functionName,
    functionArgs,
    contractFungiblePostCondition,
    senderAddress,
    onFinishStatus,
    blockchain
  );

  //Network override because of the Hiro bug
  if (blockchain === 'stacks:42') {
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
