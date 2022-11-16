import fetch from "node-fetch"
import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";
import { bufferCVFromString, callReadOnlyFunction,cvToValue, uintCV } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

function txOptions(contract) {
  return {
    contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    contractName: "sample-contract-loan-v0",
    functionName: "setup-loan",
    functionArgs: [
      uintCV(contract.vaultLoanAmount),
      uintCV(contract.BTCDeposit) ,
      uintCV(contract.liquidationRatio),
      uintCV(contract.liquidationFee),
      uintCV(contract.emergencyRefundTime)
    ],
    network,
  };
}

const handler = async function (event, context) {
  const vaultLoanAmount = event.queryStringParameters.vaultLoanAmount;
  const BTCDeposit = event.queryStringParameters.BTCDeposit;
  const liquidationRatio = event.queryStringParameters.liquidationRatio;
  const liquidationFee = event.queryStringParameters.liquidationFee;
  const emergencyRefundTime = event.queryStringParameters.emergencyRefundTime;

  try {
    const response = await openContractCall(txOptions(vaultLoanAmount, BTCDeposit, liquidationRatio, liquidationFee, emergencyRefundTime));
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: data }),
    }
  } catch (error) {
    // output to netlify function log
    console.log(error)
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }
