import { StacksMocknet } from '@stacks/network';
import { uintCV, bufferCV, cvToValue, callReadOnlyFunction } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import {
  createAssetInfo,
  FungibleConditionCode,
  makeContractCall,
  makeContractFungiblePostCondition,
  makeStandardFungiblePostCondition,
} from '@stacks/transactions';
import { customShiftValue, fixedTwoDecimalShift, fixedTwoDecimalUnshift, hexToBytes } from '../src/utils';
import eventBus from './EventBus';

const network = new StacksMocknet({ url: process.env.REACT_APP_STACKS_LOCALHOST_ADDRESS });

const populateTxOptions = (
  creatorAddress,
  contractName,
  functionName,
  functionArgs,
  postConditions,
  senderAddress,
  onFinishStatus
) => {
  return {
    contractAddress: creatorAddress,
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
      eventBus.dispatch('loan-event', { status: onFinishStatus, txId: data.txId });
    },
    onCancel: () => {
      eventBus.dispatch('loan-event', { status: 'cancelled' });
    },
  };
};

export async function getStacksLoanIDByUUID(creator, UUID) {
  const creatorAddress = process.env.REACT_APP_STACKS_CONTRACT_ADDRESS;
  const contractName = process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME;
  const senderAddress = creator;
  const functionName = 'get-loan-id-by-uuid';
  const functionArgs = [bufferCV(hexToBytes(UUID))];
  try {
    const response = await callReadOnlyFunction(
      populateTxOptions(creatorAddress, contractName, functionName, functionArgs, [], senderAddress)
    );
    return cvToValue(response.value);
  } catch (error) {
    console.error(error);
  }
}

export async function borrowStacksLoanContract(creator, UUID, additionalLoan) {
  const loanContractID = await getStacksLoanIDByUUID(creator, UUID);
  const creatorAddress = process.env.REACT_APP_STACKS_CONTRACT_ADDRESS;
  const contractName = process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME;
  const functionName = 'borrow';
  const functionArgs = [uintCV(loanContractID || 0), uintCV(fixedTwoDecimalUnshift(additionalLoan))];
  const senderAddress = undefined;
  const onFinishStatus = 'borrow-requested';
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const contractFungiblePostConditionForBorrow = [
    makeContractFungiblePostCondition(
      creatorAddress,
      contractName,
      FungibleConditionCode.GreaterEqual,
      1,
      createAssetInfo(assetAddress, assetContractName, assetName)
    ),
  ];

  try {
    openContractCall(
      populateTxOptions(
        creatorAddress,
        contractName,
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
  const creatorAddress = creator;
  const contractName = process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME;
  const functionName = 'repay';
  const functionArgs = [uintCV(loanContractID || 1), uintCV(fixedTwoDecimalUnshift(additionalRepayment))];
  const senderAddress = undefined;
  const onFinishStatus = 'repay-requested';
  const assetAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
  const assetContractName = process.env.REACT_APP_STACKS_ASSET_CONTRACT_NAME;
  const assetName = process.env.REACT_APP_STACKS_ASSET_NAME;

  const standardFungiblePostConditionForRepay = [makeStandardFungiblePostCondition(
    creatorAddress,
    FungibleConditionCode.GreaterEqual,
    1,
    createAssetInfo(assetAddress, assetContractName, assetName)
  )];
  try {
    makeContractCall(
      populateTxOptions(
        creatorAddress,
        contractName,
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
  const creatorAddress = process.env.REACT_APP_STACKS_CONTRACT_ADDRESS;
  const contractName = process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME;
  const functionName = 'attempt-liquidate';
  const functionArgs = [uintCV(parseInt(loanContractID))];
  const contractFungiblePostCondition = [];
  const senderAddress = undefined;
  const onFinishStatus = 'liquidation-requested';

  try {
    openContractCall(
      populateTxOptions(
        creatorAddress,
        contractName,
        functionName,
        functionArgs,
        contractFungiblePostCondition,
        senderAddress,
        onFinishStatus
      )
    );
  } catch (error) {
    console.error(error);
  }
}
