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

function txOptions(UUID, creator) {
  return {
    contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
    contractName: "sample-contract-loan-v0",
    functionName: "get-loan-id-by-uuid",
    functionArgs: [
      bufferCVFromString(UUID),
    ],
    senderAddress: creator,
    network,
  };
}

const handler = async function (event, context) {
  const UUID = event.queryStringParameters.uuid;
  const creator = event.queryStringParameters.creator;
  try {
    const response = await callReadOnlyFunction(txOptions(UUID, creator))
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

