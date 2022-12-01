import { StacksMocknet } from "@stacks/network";
import {
  uintCV,
} from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { ethers } from "ethers";

const handler = async function (event, context) {
  const vaultLoanAmount = event.queryStringParameters.vaultLoanAmount;
  const BTCDeposit = event.queryStringParameters.BTCDeposit;
  const liquidationRatio = event.queryStringParameters.liquidationRatio;
  const liquidationFee = event.queryStringParameters.liquidationFee;
  const emergencyRefundTime = event.queryStringParameters.emergencyRefundTime;
  const blockchain = event.queryStringParameters.blockchain;

  switch (blockchain) {
    case "stacks":
      const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link:3999" });

      function txOptions(contract) {
        return {
          contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
          contractName: "sample-contract-loan-v0",
          functionName: "setup-loan",
          functionArgs: [
            uintCV(contract.vaultLoanAmount),
            uintCV(contract.BTCDeposit),
            uintCV(contract.liquidationRatio),
            uintCV(contract.liquidationFee),
            uintCV(contract.emergencyRefundTime),
          ],
          network,
        }
      };

      try {
        const response = await openContractCall(
          txOptions(
            vaultLoanAmount,
            BTCDeposit,
            liquidationRatio,
            liquidationFee,
            emergencyRefundTime
          )
        );
        if (!response.ok) {
          // NOT res.status >= 200 && res.status < 300
          return { statusCode: response.status, body: response.statusText };
        }
        const data = await response.json();

        return {
          statusCode: 200,
          body: JSON.stringify({ msg: data }),
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
    case "ethereum":
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const dlcManagerEth = new ethers.Contract(
        "0x0CBb97C58e44BbcEE7984464e9C244Fb7fEB56e6",
        DLCManagerABI,
        signer
      );

      try {
        const response = await dlcManagerEth.createDlc(
          coinSymbol,
          this.strikePrice * 10 ** 2,
          this.getTimeStamp(),
          this.getTimeStamp(),
          "0x7010408DB16A08CFF66124a1962Fc447A5D75225",
          12345,
          coinFeed
        );
        if (!response.ok) {
          // NOT res.status >= 200 && res.status < 300
          return { statusCode: response.status, body: response.statusText };
        }
        const data = await request.json();

        return {
          statusCode: 200,
          body: JSON.stringify({ msg: data }),
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
  }
};

module.exports = { handler };
