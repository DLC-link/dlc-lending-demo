import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import { io as ioClient } from "socket.io-client";
import { ethers } from "ethers";
import { abi as loanManagerABI } from "./loanManagerABI";
import eventBus from "./EventBus";

const api_base = `https://dev-oracle.dlc.link/btc1/extended/v1`;
const ioclient_uri = `wss://dev-oracle.dlc.link`;

const contractAddress = "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6";
const contractName = "sample-contract-loan-v0";
const contractFullName = contractAddress + '.' + contractName;

const dlcManagerAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const dlcManagerName = "dlc-manager-loan-v0";
const dlcManagerFullName = dlcManagerAddress + '.' + dlcManagerName;

let userAddress;

eventBus.on("change-address", (data) => {
  userAddress = data.address;
  console.log(userAddress);
});

async function fetchTXInfo(txId) {
  console.log(`[Stacks] Fetching tx_info...`);
  try {
    const response = await fetch(api_base + '/tx/' + txId);
    return response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function handleTx(txInfo) {
  let status = undefined;
  const txId = txInfo.tx_id;
  console.log(txInfo);

  if (txInfo.tx_type !== 'contract_call') return;

  switch (txInfo.contract_call.function_name) {
    case ('setup-loan'): {
      status = "setup"
      break;
    }
    case ('create-dlc-internal'): {
      status = "ready"
      break;
    }
    case ('repay-loan'): {
      status = "repaying"
      break;
    }
    case ('liquidate-loan'): {
      status = "liquidateing"
      break;
    }
    case ('close-dlc-internal'): {
      status = "repaid";
      break;
    }
    case ('close-dlc-liquidate-internal'): {
      status = "liquidated";
      break;
    }
    case ('set-status-funded'): {
      status = "funded";
      break;
    }
    default: {
      console.log(txInfo.contract_call)
      console.log('Unhandled function call')
    }
  }
  // NOTE: We are sending a full refetch in any case for now
  eventBus.dispatch('fetch-loans-bg', { status: status, txId: txId });
}

function startStacksObserver() {
  // Setting up Stacks API websocket
  const socket = ioClient(ioclient_uri, {
    transports: [ "websocket" ]
  });
  const stacksSocket = new StacksApiSocketClient(socket);

  stacksSocket.socket.on('disconnect', async (reason) => {
    console.log(`[Stacks] Disconnecting, reason: ${reason}`);
    stacksSocket.socket.connect();
  });

  stacksSocket.socket.on('connect', async () => {
    console.log('[Stacks] (Re)connected stacksSocket');
    console.log(`Listening to ${contractFullName}...`);
    console.log(`Listening to ${dlcManagerFullName}...`);
  });

  stacksSocket.subscribeAddressTransactions(dlcManagerFullName);
  stacksSocket.subscribeAddressTransactions(contractFullName);

  // Handling incoming txs
  stacksSocket.socket.on('address-transaction', async (address, txWithTransfers) => {
    const _tx = txWithTransfers.tx;
    if (!_tx.tx_status === 'success') {
      console.log(`[Stacks] Failed tx...: ${_tx.tx_id}`);
      // TODO: show error toast....
    }

    const txInfo = await fetchTXInfo(_tx.tx_id);

    handleTx(txInfo);
  })
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
  } catch (error) {
    console.log(error);
  }
}

export default function startObserver() {
  startStacksObserver();
  startEthObserver();
}
