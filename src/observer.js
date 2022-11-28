import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { io as ioClient } from 'socket.io-client';
import eventBus from "./EventBus";

const api_base = `http://stx-btc1.dlc.link:3999/extended/v1`;
const ioclient_uri = `ws://stx-btc1.dlc.link:3999/`;

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
  let _tx;
  const _setTx = (tx) => _tx = tx;
  const _getTx = () => _tx;
  
  console.log(`[Stacks] Fetching tx_info...`);
  await fetch(api_base + '/tx/' + txId)
    .then(response => _setTx(response.json()))
    .catch(err => console.error(err));
  return _getTx();
}

function handleTx(txInfo) {
  console.log(txInfo);

  if (txInfo.tx_type !== 'contract_call') return;

  switch (txInfo.contract_call.function_name) {
    case ('setup-loan'): {
      // if (txInfo.sender_address !== userAddress) break;
      console.log('Setting up loan...');
      break;
    }
    case ('post-create-dlc-handler'): {
      console.log('Loan has been set up.');
      break;
    }
    case ('repay-loan'): {
      console.log('Repaying loan...');
      break;
    }
    case ('liquidate-loan'): {
      console.log('Liquidating loan...');
      break;
    }
    case ('post-close-dlc-handler'): {
      console.log('DLC closed.');
      break;
    }
    case ('set-status-funded'): {
      console.log('Status set to funded.');
      break;
    }
    default: {
      console.log('Unhandled function call')
    }
  }
  // NOTE: We are sending a full refetch in any case
  eventBus.dispatch('fetch-loans-bg');
}

export default function startObserver() {

  // Setting up Stacks API websocket
  const socket = ioClient(ioclient_uri, {
    transports: [ "websocket" ]
  });
  const stacksSocket = new StacksApiSocketClient(socket);

  stacksSocket.socket.on('disconnect', async (reason) => {
    console.log(`[Stacks] Disconnecting, reason: ${reason}`);
    stacksSocket.socket.connect();
  });

  // Subscribing to Sample Contract's txs
  stacksSocket.subscribeAddressTransactions(contractFullName);
  console.log(`Listening to ${contractFullName}...`);

  // stacksSocket.subscribeAddressTransactions(dlcManagerFullName);
  console.log(`Listening to ${dlcManagerFullName}...`);

  // Handling incoming txs
  stacksSocket.socket.on('address-transaction', async (address, txWithTransfers) => {
    const _tx = txWithTransfers.tx;
    const _successful = _tx.tx_status === 'success';
    if (!_successful) {
      console.log(`[Stacks] Failed tx...: ${_tx.tx_id}`);
      return;
    }

    const txInfo = await fetchTXInfo(_tx.tx_id);

    handleTx(txInfo);
  })

}
