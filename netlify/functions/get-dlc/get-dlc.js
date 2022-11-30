import { StacksMocknet } from "@stacks/network";
import { callReadOnlyFunction } from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { bytesToUtf8 } from "micro-stacks/common";
import { addressToString } from "@stacks/transactions";
import { customShiftValue, fixedTwoDecimalShift } from "../../../src/utils";
import loanFormatter from "../../../src/LoanFormatter";

const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

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
      loans = loanFormatter.formatAllDLC(response.list, "clarity");
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