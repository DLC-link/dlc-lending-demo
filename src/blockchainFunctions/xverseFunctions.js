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
import { PostConditionMode } from '@stacks/transactions';

export const stacksChains = [
  { id: 'stacks:1', name: 'Mainnet' },
  { id: 'stacks:2147483648', name: 'Testnet' },
];

export async function sendLoanContractToStacksByXverse(
  loanContract,
  address,
  walletConnectClient,
  xverseSession,
  stacksChain
) {
  const functionName = 'setup-loan';
  const functionArgs = [
    uintCV(loanContract.BTCDeposit),
    uintCV(loanContract.liquidationRatio),
    uintCV(loanContract.liquidationFee),
    uintCV(loanContract.emergencyRefundTime),
  ];
  const senderAddress = undefined;

  try {
    await walletConnectClient
      .request({
        chainId: stacksChain,
        topic: xverseSession.topic,
        request: {
          method: 'stacks_contractCall',
          params: {
            pubkey: address,
            senderAddress: senderAddress,
            postConditions: [],
            contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
            contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
            functionName: functionName,
            functionArgs: functionArgs,
          },
        },
      })
      .then((result) => {
        console.log('resulto');
        console.log(result);
      });
  } catch (error) {
    console.error(error);
  }
}

export async function getStacksLoansByXverse(creator, client, chain, session) {
  const functionName = 'get-creator-loans';
  const functionArgs = [principalCV(creator)];
  const senderAddress = creator;
  let loans = [];

  try {
    const response = await client.request({
      chainId: chain,
      topic: session.topic,
      request: {
        method: 'stacks_callReadOnlyFunction',
        params: {
          pubkey: creator,
          senderAddress: senderAddress,
          postConditions: [],
          contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
          contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
          functionName: functionName,
          functionArgs: functionArgs,
          postConditionMode: PostConditionMode.Deny,
          version: '1',
        },
      },
    });
    console.log('response: ', response);
  } catch (error) {
    console.error(error);
  }
}
