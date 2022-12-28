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
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';
import { openContractCall } from '@stacks/connect';
import { customShiftValue, fixedTwoDecimalShift, fixedTwoDecimalUnshift, hexToBytes } from '../utils';
import eventBus from '../EventBus';
import loanFormatter from '../LoanFormatter';

const network = new StacksMocknet({ url: process.env.REACT_APP_STACKS_LOCALHOST_ADDRESS });

const populateTxOptions = (functionName, functionArgs, postConditions, senderAddress, onFinishStatus) => {
  return {
    contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    functionName: functionName,
    functionArgs: functionArgs,
    postConditions: postConditions,
    validateWithAbi: true,
    senderAddress: senderAddress,
    network: network,
    fee: 100000,
    anchorMode: 1,
    onFinish: (data) => {
      eventBus.dispatch('loan-event', { status: onFinishStatus, txId: data.txId });
    },
    onCancel: () => {
      eventBus.dispatch('loan-event', { status: 'cancelled' });
    },
  };
};

export async function sendLoanContractToStacks(loanContract) {
  const functionName = 'setup-loan';
  const functionArgs = [
    uintCV(loanContract.BTCDeposit),
    uintCV(loanContract.liquidationRatio),
    uintCV(loanContract.liquidationFee),
    uintCV(loanContract.emergencyRefundTime),
  ];
  const senderAddress = undefined;
  const onFinishStatus = 'created';
  try {
    openContractCall(populateTxOptions(functionName, functionArgs, [], senderAddress, onFinishStatus));
  } catch (error) {
    console.error(error);
  }
}

export async function getStacksLoans(creator) {
  const functionName = 'get-creator-loans';
  const functionArgs = [principalCV(creator)];
  const senderAddress = creator;
  let loans = [];

  try {
    const response = await callReadOnlyFunction(populateTxOptions(functionName, functionArgs, [], senderAddress));
    loans = loanFormatter.formatAllDLC(response.list, 'clarity');
  } catch (error) {
    console.error(error);
  }
  return loans;
}

export async function getStacksLoanIDByUUID(creator, UUID) {
  const functionName = 'get-loan-id-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  const senderAddress = creator;
  try {
    const response = await callReadOnlyFunction(populateTxOptions(functionName, functionArgs, [], senderAddress));
    return cvToValue(response.value);
  } catch (error) {
    console.error(error);
  }
}

export async function borrowStacksLoanContract(creator, UUID, additionalLoan) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID);
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(fixedTwoDecimalUnshift(additionalLoan))];
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
      1,
      createAssetInfo(assetAddress, assetContractName, assetName)
    ),
  ];

  try {
    openContractCall(
      populateTxOptions(
        functionName,
        functionArgs,
        contractFungiblePostConditionForBorrow,
        senderAddress,
        onFinishStatus
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function repayStacksLoanContract(creator, UUID, additionalRepayment) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID);
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(fixedTwoDecimalUnshift(additionalRepayment))];
  const senderAddress = undefined;
  const onFinishStatus = 'repay-requested';
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const standardFungiblePostConditionForRepay = [
    makeStandardFungiblePostCondition(
      creator,
      FungibleConditionCode.GreaterEqual,
      1,
      createAssetInfo(assetAddress, assetContractName, assetName)
    ),
  ];

  try {
    openContractCall(
      populateTxOptions(
        functionName,
        functionArgs,
        standardFungiblePostConditionForRepay,
        senderAddress,
        onFinishStatus
      )
    );
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateStacksLoanContract(creator, UUID) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID);
  const functionName = 'attempt-liquidate';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = 'liquidation-requested';

  try {
    openContractCall(
      populateTxOptions(functionName, functionArgs, contractFungiblePostCondition, senderAddress, onFinishStatus)
    );
  } catch (error) {
    console.error(error);
  }
}

export async function closeStacksLoanContract(creator, UUID) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID);
  const functionName = 'close-loan';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = 'closing-requested';

  try {
    openContractCall(
      populateTxOptions(functionName, functionArgs, contractFungiblePostCondition, senderAddress, onFinishStatus)
    );
  } catch (error) {
    console.error(error);
  }
}
