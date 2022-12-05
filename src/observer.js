import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import { io as ioClient } from "socket.io-client";
import { ethers } from "ethers";
import { abi as loanManagerABI } from "./loanManagerABI";
import eventBus from "./EventBus";

const api_base =
  process.env.REACT_APP_STACKS_MOCKNET_ADDRESS + `:3999/extended/v1`;
const ioclient_uri = `ws://stx-btc1.dlc.link:3999/`;

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
  let _tx;
  const _setTx = (tx) => (_tx = tx);
  const _getTx = () => _tx;

  console.log(`[Stacks] Fetching tx_info...`);
  await fetch(api_base + "/tx/" + txId)
    .then((response) => _setTx(response.json()))
    .catch((err) => console.error(err));
  return _getTx();
}

function handleTx(txInfo) {
  console.log(txInfo);

  if (txInfo.tx_type !== "contract_call") return;

  switch (txInfo.contract_call.function_name) {
    case "setup-loan": {
      // if (txInfo.sender_address !== userAddress) break;
      eventBus.dispatch("fetch-loans-bg", {
        status: "setup",
        txId: txInfo.tx_id,
      });
      break;
    }
    case "post-create-dlc-handler": {
      eventBus.dispatch("fetch-loans-bg", {
        status: "ready",
        txId: txInfo.tx_id,
      });
      break;
    }
    case "repay-loan": {
      eventBus.dispatch("fetch-loans-bg", {
        status: "repaying",
        txId: txInfo.tx_id,
      });
      break;
    }
    case "liquidate-loan": {
      eventBus.dispatch("fetch-loans-bg", {
        status: "liquidateing",
        txId: txInfo.tx_id,
      });
      break;
    }
    case "post-close-dlc-handler": {
      eventBus.dispatch("fetch-loans-bg", {
        status: "closed",
        txId: txInfo.tx_id,
      });
      break;
    }
    case "set-status-funded": {
      eventBus.dispatch("fetch-loans-bg", {
        status: "funded",
        txId: txInfo.tx_id,
      });
      break;
    }
    default: {
      console.log(txInfo.contract_call.function_name);
      console.log("Unhandled function call");
    }
  }
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
    console.log(`Listening to ${contractFullName}...`);
    console.log(`Listening to ${dlcManagerFullName}...`);
  });

  stacksSocket.subscribeAddressTransactions(contractFullName);
  stacksSocket.subscribeAddressTransactions(dlcManagerFullName);

  // Handling incoming txs
  stacksSocket.socket.on(
    "address-transaction",
    async (address, txWithTransfers) => {
      const _tx = txWithTransfers.tx;
      const _successful = _tx.tx_status === "success";
      if (!_successful) {
        console.log(`[Stacks] Failed tx...: ${_tx.tx_id}`);
        return;
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
    loanManagerETH.on("CreateDLC", (...args) => {
      eventBus.dispatch("fetch-loans-bg", {
        status: "setup",
        txId: args[args.length - 1].transactionHash,
      });
    });
    loanManagerETH.on("CreateDLCInternal", (...args) => {
      console.log(args[args.length - 1].transactionHash);
      eventBus.dispatch("fetch-loans-bg", {
        status: "ready",
        txId: args[args.length - 1].transactionHash,
      });
    });
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
  } catch (error) {
    console.log(error);
  }
}

export default function startObserver() {
  startStacksObserver();
  startEthObserver();
}
