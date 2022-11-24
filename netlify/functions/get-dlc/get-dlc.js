import fetch from "node-fetch"
import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";
import { bufferCVFromString, callReadOnlyFunction,cvToValue } from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { bytesToUtf8 } from "micro-stacks/common";
import { cvToHex, addressToString, bufferCV } from "@stacks/transactions";
import { customShiftValue, fixedTwoDecimalShift, hex2ascii } from "../../../src/utils"

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

function formatAllDLC(dlcArray) {
  const formattedDLCArray = [];
  for (const dlc of dlcArray) {
    const formattedDLC = formatDLC(dlc);
    formattedDLCArray.push(formattedDLC);
  }
  return formattedDLCArray;
}

function formatDLC(dlc) {
  const dlcData = dlc.value.data;

  let formattedDLC = {
    dlcUUID: bytesToUtf8(dlc.value.data.dlc_uuid.value.buffer),
    status: dlcData.status.data,
    owner: addressToString(dlcData.owner.address),
    liquidationFee:
      fixedTwoDecimalShift(dlcData["liquidation-fee"].value) + " %",
    liquidationRatio:
      fixedTwoDecimalShift(dlcData["liquidation-ratio"].value) + " %",
    vaultCollateral:
      customShiftValue(dlcData["vault-collateral"].value, 8, true) + " BTC",
    vaultLoan: "$ " + fixedTwoDecimalShift(dlcData["vault-loan"].value),
    closingPrice: "$ " + fixedTwoDecimalShift(dlcData["closing-price"].value),
  };
  console.log(formattedDLC);
  return formattedDLC;
}

function txOptions(creator) {
  return {
    contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
    contractName: "sample-contract-loan-v0",
    functionName: "get-creator-loans",
    functionArgs: [
      principalCV(creator)
    ],
    senderAddress: creator,
    network,
  };
}

const handler = async function (event, context) {
  const creator = event.queryStringParameters.creator;
  try {
    const response = await callReadOnlyFunction(txOptions(creator))
    const loans = formatAllDLC(response.list);
    console.log(bytesToUtf8(response.list[0].value.data.dlc_uuid.value.buffer));
    return {
      statusCode: 200,
      body: JSON.stringify({ msg: loans }),
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
