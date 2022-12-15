import { StacksMocknet } from "@stacks/network";
import { bufferCVFromString, callReadOnlyFunction,cvToValue, cvTo, bufferCV } from "@stacks/transactions";
import { hexToBytes } from "../../../src/utils";

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

function toJson(data) {
  if (data !== undefined) {
      return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}#bigint` : v)
          .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
  }
}

function txOptions(UUID, creator) {
  return {
    contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    functionName: "get-loan-id-by-uuid",
    functionArgs: [
      bufferCV(hexToBytes(UUID)),
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
    console.error(error);
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }

