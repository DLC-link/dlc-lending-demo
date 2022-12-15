import { StacksMocknet } from "@stacks/network";
import { callReadOnlyFunction } from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import loanFormatter from "../../../src/LoanFormatter";

const network = new StacksMocknet({ url: process.env.REACT_APP_STACKS_MOCKNET_ADDRESS + ":3999" });

function txOptions(creator) {
  return {
    contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
    contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
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
    console.error(error);
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    };
  }
};

module.exports = { handler };