import fetch from "node-fetch";
import { StacksMocknet } from "@stacks/network";
import { callReadOnlyFunction } from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { bytesToUtf8 } from "micro-stacks/common";
import { addressToString } from "@stacks/transactions";
import { customShiftValue, fixedTwoDecimalShift } from "../../../src/utils";

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

function toJson(data) {
  return JSON.stringify(data, (_, v) =>
    typeof v === "bigint" ? `${v}n` : v
  ).replace(/"(-?\d+)n"/g, (_, a) => a);
}

function formatAllDLC(dlcArray) {
  const formattedDLCArray = [];
  console.log(dlcArray);
  for (const dlc of dlcArray) {
    const loan = formatDLC(dlc);
    formattedDLCArray.push(loan);
  }
  return formattedDLCArray;
}

function formatDLC(dlc) {
  const dlcData = dlc.value.data;

  const rawData = {
    status: dlcData.status.data,
    owner: addressToString(dlcData.owner.address),
    liquidationFee: toJson(dlcData["liquidation-fee"].value),
    liquidationRatio: toJson(dlcData["liquidation-ratio"].value),
    vaultCollateral: toJson(dlcData["vault-collateral"].value),
    vaultLoan: toJson(dlcData["vault-loan"].value),
    closingPrice: dlcData["closing-price"].value,
    ...(dlcData.dlc_uuid.hasOwnProperty("value") && {
      dlcUUID: bytesToUtf8(dlcData.dlc_uuid.value.buffer),
    }),
  };

  const loan = {
    raw: rawData,
    formatted: {
      formattedLiquidationFee:
        fixedTwoDecimalShift(rawData.liquidationFee) + " %",
      formattedLiquidationRatio:
        fixedTwoDecimalShift(rawData.liquidationRatio) + " %",
      formattedVaultCollateral:
        customShiftValue(rawData.vaultCollateral, 8, true) + " BTC",
      formattedVaultLoan: "$ " + fixedTwoDecimalShift(rawData.vaultLoan),
      ...(rawData.closingPrice !== undefined && { formattedClosingPrice: "$ " + fixedTwoDecimalShift(rawData.closingPrice) })
    }
  };
  return loan;
}

function txOptions(creator) {
  return {
    contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
    contractName: "sample-contract-loan-v0",
    functionName: "get-creator-loans",
    functionArgs: [principalCV(creator)],
    senderAddress: creator,
    network,
  };
}

const handler = async function (event, context) {
  const creator = event.queryStringParameters.creator;
  try {
    const response = await callReadOnlyFunction(txOptions(creator));
    let loans = undefined;
    if (!response.list.length) {
      loans = [];
    } else {
      loans = formatAllDLC(response.list);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ msg: loans }),
    };
  } catch (error) {
    // output to netlify function log
    console.log(error);
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    };
  }
};

module.exports = { handler };
