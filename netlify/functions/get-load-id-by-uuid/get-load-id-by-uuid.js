import fetch from "node-fetch"
import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";
import { bufferCVFromString, callReadOnlyFunction,cvToValue, cvTo } from "@stacks/transactions";

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

function toJson(data) {
  if (data !== undefined) {
      return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}#bigint` : v)
          .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
  }
}

function txOptions(UUID) {
  return {
    contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    contractName: "sample-contract-loan-v0",
    functionName: "get-loan-id-by-uuid",
    functionArgs: [
      bufferCVFromString(UUID),
    ],
    senderAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    network,
  };
}

const handler = async function (event, context) {
  const UUID = event.queryStringParameters.uuid;
  try {
    const response = await callReadOnlyFunction(txOptions(UUID))
 console.log(response)
    return {
      statusCode: 200,
      body: JSON.stringify({ msg: toJson(cvToValue(response.value)) }),
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

