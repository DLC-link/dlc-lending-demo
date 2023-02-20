import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { cvToValue, deserializeCV } from '@stacks/transactions';
import { io as ioClient } from 'socket.io-client';
import { ethers } from 'ethers';
import { abi as protocolContractABI } from './abis/protocolContractABI';
import { abi as usdcABI } from './abis/usdcABI';
import { abi as dlcManagerABI } from './abis/dlcManagerABI';
import eventBus from './EventBus';

const api_base = `https://dev-oracle.dlc.link/btc1/extended/v1`;
const ioclient_uri = `wss://dev-oracle.dlc.link`;

// const api_base = `http://localhost:3999/extended/v1`;
// const ioclient_uri = `ws://localhost:3999`;

const contractAddress = process.env.REACT_APP_STACKS_CONTRACT_ADDRESS;
const contractName = process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME;
const contractFullName = contractAddress + '.' + contractName;

const dlcManagerAddress = process.env.REACT_APP_STACKS_MANAGER_ADDRESS;
const dlcManagerName = process.env.REACT_APP_STACKS_MANAGER_NAME;
const dlcManagerFullName = dlcManagerAddress + '.' + dlcManagerName;

let userAddress;

eventBus.on('change-address', (data) => {
  userAddress = data.address;
});

async function fetchTXInfo(txId) {
  console.log(`[Stacks] Fetching tx_info... ${txId}`);
  try {
    const response = await fetch(api_base + '/tx/' + txId);
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

function handleTx(txInfo) {
  if (txInfo.tx_type !== 'contract_call') return;

  const txMap = {
    'setup-loan': 'setup',
    'post-create-dlc': 'ready',
    'set-status-funded': 'funded',
    'attempt-liquidate': 'attempting-liquidation',
    'validate-price-data': 'liquidating',
    'close-loan': 'closing',
    'post-close-dlc': 'closed',
    borrow: 'borrowed',
    repay: 'repaid',
  };
  eventBus.dispatch('loan-event', {
    status: txMap[txInfo.contract_call.function_name],
    txId: txInfo.tx_id,
    chain: 'stacks',
  });
}

function startStacksObserver() {
  // Setting up Stacks API websocket
  const socket = ioClient(ioclient_uri, {
    transports: ['websocket'],
  });
  const stacksSocket = new StacksApiSocketClient(socket);

  stacksSocket.socket.on('disconnect', async (reason) => {
    console.log(`[Stacks] Disconnecting, reason: ${reason}`);
    stacksSocket.socket.connect();
  });

  stacksSocket.socket.on('connect', async () => {
    console.log('[Stacks] (Re)connected stacksSocket');
  });

  setInterval(() => {
    if (stacksSocket.socket.disconnected) {
      console.log(`[Stacks] Attempting to connect stacksSocket to ${ioclient_uri}...`);
      stacksSocket.socket.connect();
    }
  }, 2000);

  stacksSocket.subscribeAddressTransactions(dlcManagerFullName);
  stacksSocket.subscribeAddressTransactions(contractFullName);

  // Handling incoming txs
  stacksSocket.socket.on('address-transaction', async (address, txWithTransfers) => {
    console.log(`TX happened on ${address}`);
    const _tx = txWithTransfers.tx;
    if (_tx.tx_status !== 'success') {
      eventBus.dispatch({ status: 'failed', txId: _tx.tx_id, chain: 'stacks' });
    }
    const txInfo = await fetchTXInfo(_tx.tx_id);
    handleTx(txInfo);
  });
}

function startEthObserver() {
  let loanUUIDs = [];
  eventBus.on('loans', (loans) => {
    loanUUIDs = [];
    loans.forEach((loan) => {
      loanUUIDs.push(loan.formatted.uuid);
    });
  });

  try {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const protocolContractETH = new ethers.Contract(
      process.env.REACT_APP_GOERLI_PROTOCOL_CONTRACT_ADDRESS,
      protocolContractABI,
      signer
    );
    const usdcETH = new ethers.Contract(process.env.REACT_APP_GOERLI_USDC_ADDRESS, usdcABI, signer);
    const dlcManagerETH = new ethers.Contract(process.env.REACT_APP_GOERLI_DLC_MANAGER_ADDRESS, dlcManagerABI, signer);

    protocolContractETH.on('SetupLoan', (...args) => {
      if (loanUUIDs.includes(args[0])) {
        eventBus.dispatch('loan-event', {
          status: 'setup',
          txId: args[args.length - 1].transactionHash,
        });
      }
    });

    dlcManagerETH.on('CreateDLC', (...args) =>
      eventBus.dispatch('loan-event', {
        status: 'ready',
        txId: args[args.length - 1].transactionHash,
      })
    );

    dlcManagerETH.on('SetStatusFunded', (...args) =>
      eventBus.dispatch('loan-event', {
        status: 'funded',
        txId: args[args.length - 1].transactionHash,
      })
    );

    dlcManagerETH.on('CloseDLC', (...args) =>
      eventBus.dispatch('loan-event', {
        status: 'closed',
        txId: args[args.length - 1].transactionHash,
      })
    );

    usdcETH.on('Approval', (...args) => {
      eventBus.dispatch('loan-event', {
        status: 'approved',
        txId: args[args.length - 1].transactionHash,
      });
    });
  } catch (error) {
    console.error(error);
  }
}

export default function startObserver() {
  startStacksObserver();
  startEthObserver();
}
