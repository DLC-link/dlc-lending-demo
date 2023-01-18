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

export async function sendLoanContractToStacksByXverse() {}

export async function getStacksLoansByXverse(creator, client, chain, session) {
    console.log('Chain: ', chain)
    console.log('Session ', session)
    const functionName = 'get-creator-loans';
    const functionArgs = [principalCV(creator)];
    const senderAddress = creator;
    let loans = [];

  try {
    const result = await client.request({
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
  } catch (error) {
    throw new Error(error);
  }
}
