import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import { cvToValue, deserializeCV } from '@stacks/transactions';
import { io as ioClient } from "socket.io-client";
import { ethers } from "ethers";
import { abi as loanManagerABI } from "./loanManagerABI";
import { abi as usdcForDLCsABI } from "./usdcForDLCsABI";
import eventBus from "./EventBus";

// const api_base = `https://dev-oracle.dlc.link/btc1/extended/v1`;
// const ioclient_uri = `wss://dev-oracle.dlc.link`;

const api_base = `http://localhost:3999/extended/v1`;
const ioclient_uri = `ws://localhost:3999`;

const contractAddress = process.env.REACT_APP_STACKS_CONTRACT_ADDRESS;
const contractName = process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME;
const contractFullName = contractAddress + "." + contractName;

const dlcManagerAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
const dlcManagerName = process.env.REACT_APP_STACKS_MANAGER_NAME;
const dlcManagerFullName = dlcManagerAddress + "." + dlcManagerName;

let userAddress;

eventBus.on("change-address", (data) => {
  userAddress = data.address;
});

async function fetchTXInfo(txId) {
  console.log(`[Stacks] Fetching tx_info... ${txId}`);
  try {
    const response = await fetch(api_base + "/tx/" + txId);
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

function handleTx(txInfo) {
  const printEvent = txInfo.events.find(event => event.contract_log.contract_id === contractFullName);
  const unwrappedPrintEvent = cvToValue(deserializeCV(printEvent.contract_log.value.hex));
  const newStatus = unwrappedPrintEvent['status']?.value;

  const txMap = {
    'not-ready': "setup",
    'ready': "ready",
    'pre-repaid': "repaying",
    'pre-liquidated': "liquidate-loan",
    'repaid': "repaid",
    'liquidated': "liquidated",
    'funded': "funded"
  };

  eventBus.dispatch("fetch-loans-bg", { status: txMap[newStatus], txId: txInfo.tx_id });
}

function startStacksObserver() {
  // Setting up Stacks API websocket
  const socket = ioClient(ioclient_uri, {
    transports: ["websocket"],
  });
  const stacksSocket = new StacksApiSocketClient(socket);

  stacksSocket.socket.on("disconnect", async (reason) => {
    console.log(`[Stacks] Disconnecting, reason: ${reason}`);
    stacksSocket.socket.connect();
  });

  stacksSocket.socket.on("connect", async () => {
    console.log("[Stacks] (Re)connected stacksSocket");
  });

  setInterval(() => {
    if (stacksSocket.socket.disconnected) {
      console.log(`[Stacks] Attempting to connect stacksSocket to ${ioclient_uri}...`)
      stacksSocket.socket.connect();
    }
  }, 2000);

  stacksSocket.subscribeAddressTransactions(dlcManagerFullName);
  stacksSocket.subscribeAddressTransactions(contractFullName);

  // Handling incoming txs
  stacksSocket.socket.on(
    "address-transaction",
    async (address, txWithTransfers) => {
      console.log(`TX happened on ${address}`);
      const _tx = txWithTransfers.tx;
      if (!_tx.tx_status === "success") {
        console.log(`[Stacks] Failed tx...: ${_tx.tx_id}`);
        // TODO: show error toast....
      }

      const txInfo = await fetchTXInfo(_tx.tx_id);
      handleTx(txInfo);
    }
  );
}

function startEthObserver() {
  try {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const loanManagerETH = new ethers.Contract(
      process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
      loanManagerABI,
      signer
    );

    const usdcContract = new ethers.Contract(
      process.env.REACT_APP_USDC_CONTRACT_ADDRESS,
      usdcForDLCsABI,
      signer
    );

    loanManagerETH.on("CreateDLC", (...args) =>
      eventBus.dispatch("fetch-loans-bg", {
        status: "setup",
        txId: args[args.length - 1].transactionHash,
      })
    );
    loanManagerETH.on("CreateDLCInternal", (...args) =>
      eventBus.dispatch("fetch-loans-bg", {
        status: "ready",
        txId: args[args.length - 1].transactionHash,
      })
    );
    loanManagerETH.on("SetStatusFunded", (...args) =>
      eventBus.dispatch("fetch-loans-bg", {
        status: "funded",
        txId: args[args.length - 1].transactionHash,
      })
    );
    loanManagerETH.on("CloseDLC", (...args) =>
      eventBus.dispatch("fetch-loans-bg", {
        status: "closed",
        txId: args[args.length - 1].transactionHash,
      })
    );
    usdcContract.on("Approval", (...args) => {
    console.log(args);
      eventBus.dispatch("fetch-loans-bg", {
        status: "approved",
        txId: args[args.length - 1].transactionHash,
      })}
    );
  } catch (error) {
    console.error(error);
  }
}

export default function startObserver() {
  startStacksObserver();
  startEthObserver();
}
