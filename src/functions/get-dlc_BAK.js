import {
  bufferCVFromString,
  callReadOnlyFunction,
  cvToValue
} from "@stacks/transactions";
import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999/" });

function txOptions(UUID) {
  return {
    contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sample-contract-loan-v0",
    contractName: "sample-contract-loan-v0",
    functionName: "get-useraccount-by-uuid",
    functionArgs: [
      bufferCVFromString(UUID),
    ],
    senderAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    network,
  };
}

export default async function(UUID) {
  const transaction = await callReadOnlyFunction(txOptions(UUID));
  console.log(cvToValue(transaction.value));
  return cvToValue(transaction.value);
}