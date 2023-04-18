import { ethers } from 'ethers';
import { abi as protocolContractABI } from '../abis/protocolContractABI';
import { abi as usdcABI } from '../abis/usdcABI';
import { abi as dlcManagerABI } from '../abis/dlcManagerABI';
import { io as ioClient } from 'socket.io-client';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';

import eventBus from '../EventBus';
import { EthereumNetworks } from '../networks/ethereumNetworks';
import { StacksNetworks } from '../networks/stacksNetworks';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';
import { selectAllLoans } from '../store/loansSlice';

const api_base = `https://dev-oracle.dlc.link/btc1/extended/v1`;
const ioclient_uri = `wss://dev-oracle.dlc.link`;

function logStatus(loanUUID, loanStatus, loanOwner) {
  switch (loanStatus) {
    case solidityLoanStatuses.NONE:
    case clarityLoanStatuses.NONE:
      break;
    case solidityLoanStatuses.NOTREADY:
    case clarityLoanStatuses.NOTREADY:
      console.log(`%cVault setup for %c${loanOwner} %c!`, 'color: white', 'color: turquoise', 'color: white');
      break;
    case solidityLoanStatuses.READY:
    case clarityLoanStatuses.READY:
      console.log(`%cLoan %c${loanUUID} %cis ready!`, 'color: white', 'color: turquoise', 'color: white');
      break;
    case solidityLoanStatuses.FUNDED:
    case clarityLoanStatuses.FUNDED:
      console.log(`%cLoan %c${loanUUID} %cis funded!`, 'color: white', 'color: turquoise', 'color: white');
      break;
    case solidityLoanStatuses.PREREPAID:
    case clarityLoanStatuses.PREREPAID:
      console.log(`%cClosing loan %c${loanUUID} %c!`, 'color: white', 'color: turquoise', 'color: white');
      break;
    case solidityLoanStatuses.REPAID:
    case clarityLoanStatuses.REPAID:
      console.log(`%cLoan %c${loanUUID} %cis closed!`, 'color: white', 'color: turquoise', 'color: white');
      break;
    case solidityLoanStatuses.PRELIQUIDATED:
    case clarityLoanStatuses.PRELIQUIDATED:
      console.log(`%cLiquidating loan %c${loanUUID} %c!`, 'color: white', 'color: turquoise', 'color: white');
    case solidityLoanStatuses.LIQUIDATED:
    case clarityLoanStatuses.LIQUIDATED:
      console.log(`%cLoan %c${loanUUID} %cis liquidated!`, 'color: white', 'color: turquoise', 'color: white');
      break;
    default:
      console.log('Unknow status!');
      break;
  }
}

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

export default function Observer() {
  const address = useSelector((state) => state.account.address);
  const walletType = useSelector((state) => state.account.walletType);
  const blockchain = useSelector((state) => state.account.blockchain);

  const loans = useSelector(selectAllLoans);
  let loanUUIDs = [];

  let ethereumProvider;
  let protocolContractETH;
  let dlcManagerETH;
  let usdcETH;

  useEffect(() => {
    if (loans.length !== 0) {
      loanUUIDs = loans.map((loan) => loan.uuid);
    }
  }, [loans]);

  useEffect(() => {
    if (address && walletType && blockchain) {
      switch (walletType) {
        case 'metamask':
          startEthereumObserver();
          break;
        case 'hiro':
        case 'metamask':
          startStacksObserver();
          break;
        default:
          throw new Error('Unknown wallet type!');
      }
    }
  }, [address, walletType, blockchain]);

  function startEthereumObserver() {
    try {

      const { protocolContractAddress, usdcAddress, dlcManagerAddress } = EthereumNetworks[blockchain];
      const { ethereum } = window;
      console.log( EthereumNetworks[blockchain])

      ethereumProvider = new ethers.providers.Web3Provider(ethereum);

      protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, ethereumProvider);
      dlcManagerETH = new ethers.Contract(dlcManagerAddress, dlcManagerABI, ethereumProvider);
      usdcETH = new ethers.Contract(usdcAddress, usdcABI, ethereumProvider);

      console.log('Starting Ethereum observer...');

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

  function startStacksObserver() {
    const { loanContractAddress, loanContractName, managerContractAddress, managerContractName } =
      StacksNetworks[blockchain];
    const loanContractFullName = loanContractAddress + '.' + loanContractName;
    const managerContractFullName = managerContractAddress + '.' + managerContractName;

    const socket = ioClient(ioclient_uri, {
      transports: ['websocket'],
    });
    const stacksSocket = new StacksApiSocketClient(socket);

    stacksSocket.socket.on('connect', async () => {
      console.log('[Stacks] (Re)connected stacksSocket');
    });

    stacksSocket.socket.on('disconnect', async (reason) => {
      console.log(`[Stacks] Disconnecting, reason: ${reason}`);
      stacksSocket.socket.connect();
    });

    setInterval(() => {
      if (stacksSocket.socket.disconnected) {
        console.log(`[Stacks] Attempting to connect stacksSocket to ${ioclient_uri}...`);
        stacksSocket.socket.connect();
      }
    }, 2000);

    stacksSocket.subscribeAddressTransactions(managerContractFullName);
    stacksSocket.subscribeAddressTransactions(loanContractFullName);

    stacksSocket.socket.on('address-transaction', async (address, txWithTransfers) => {
      console.log(`TX happened on ${address}`);
      const _tx = txWithTransfers.tx;
      if (_tx.tx_status !== 'success') {
        eventBus.dispatch({ status: 'failed', txId: _tx.tx_id });
      }
      const txInfo = await fetchTXInfo(_tx.tx_id);
      handleTx(txInfo);
    });
  }
}
