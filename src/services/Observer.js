import { ethers } from 'ethers';
import { abi as protocolContractABI } from '../abis/protocolContractABI';
import { abi as usdcABI } from '../abis/usdcABI';
import { io as ioClient } from 'socket.io-client';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';

import { EthereumNetworks, StacksNetworks } from '../networks/networks';

import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchLoan, fetchLoans, loanEventReceived } from '../store/loansSlice';

import store from '../store/store';

async function fetchTXInfo(blockchain, txId) {
  console.log(`[Stacks] Fetching tx_info... ${txId}`);
  let api_base; 

  switch (blockchain) {
    case 'stacks:1': 
      api_base = `https://api.mainnet.hiro.so/extended/v1/`;
      break;
      case 'stacks:2147483648':
      api_base = `https://api.testnet.hiro.so/extended/v1/`;
      break;
    case 'stacks:42':
      api_base = `https://dev-oracle.dlc.link/btc1/extended/v1`;
      break;
    default:
      throw new Error('Unsupported network!');
  }

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

  const clarityFunctionsMap = {
    'setup-loan': 'NotReady',
    'post-create-dlc': 'Ready',
    'set-status-funded': 'Funded',
    'attempt-liquidate': 'PreLiquidated',
    'validate-price-data': 'PreRepaid',
    'close-loan': 'Closing',
    'post-close-dlc': 'Closed',
    borrow: 'Borrowed',
    repay: 'Repaid',
  };

  store.dispatch(
    loanEventReceived({
      status: clarityFunctionsMap[txInfo.contract_call.function_name],
      txHash: txInfo.tx_id,
    })
  );
  store.dispatch(fetchLoans());
}

export default function Observer() {
  const address = useSelector((state) => state.account.address);
  const walletType = useSelector((state) => state.account.walletType);
  const blockchain = useSelector((state) => state.account.blockchain);

  let ethereumProvider;
  let protocolContractETH;
  let usdcETH;

  useEffect(() => {
    if (address && walletType && blockchain) {
      switch (walletType) {
        case 'metamask':
          startEthereumObserver();
          break;
        case 'hiro':
        case 'xverse':
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

      ethereumProvider = new ethers.providers.Web3Provider(ethereum);

      protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, ethereumProvider);
      usdcETH = new ethers.Contract(usdcAddress, usdcABI, ethereumProvider);

      protocolContractETH.on('StatusUpdate', (...args) => {
        const loantUUID = args[1];
        const loanStatus = args[2];
        const loanTXHash = args[args.length - 1].transactionHash;

        store.dispatch(
          fetchLoan({
            loanUUID: loantUUID,
            loanStatus: loanStatus,
            loanTXHash: loanTXHash,
            loanEvent: 'StatusUpdate',
          })
        );
      });

      protocolContractETH.on('BorrowEvent', (...args) => {
        const loantUUID = args[1];
        const loanStatus = args[4];
        const loanTXHash = args[args.length - 1].transactionHash;

        store.dispatch(
          fetchLoan({
            loanUUID: loantUUID,
            loanStatus: loanStatus,
            loanTXHash: loanTXHash,
            loanEvent: 'BorrowEvent',
          })
        );
      });

      protocolContractETH.on('RepayEvent', (...args) => {
        const loantUUID = args[1];
        const loanStatus = args[4];
        const loanTXHash = args[args.length - 1].transactionHash;

        store.dispatch(
          fetchLoan({
            loanUUID: loantUUID,
            loanStatus: loanStatus,
            loanTXHash: loanTXHash,
            loanEvent: 'RepayEvent',
          })
        );
      });

      usdcETH.on('Approval', (...args) => {
        const loanOwner = args[0];
        const loanTXHash = args[args.length - 1].transactionHash;

        const address = store.getState().account.address;

        if (loanOwner.toLowerCase() !== address.toLowerCase()) return;

        store.dispatch(
          loanEventReceived({
            status: 'Approved',
            txHash: loanTXHash,
          })
        );
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

    let ioclient_uri;

    switch (blockchain) {
      case 'stacks:1':
        ioclient_uri = `wss://api.mainnet.hiro.so/`;
        break;
      case 'stacks:2147483648':
        ioclient_uri = `wss://api.testnet.hiro.so/`;
        break;
      case 'stacks:42':
        ioclient_uri = `wss://dev-oracle.dlc.link`;
        break;
      default:
        throw new Error('Unknown blockchain!');
    }

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
        store.dispatch(loanEventReceived({ status: 'Failed', txHash: _tx.tx_id }));
      }
      const txInfo = await fetchTXInfo(blockchain ,_tx.tx_id);
      handleTx(txInfo);
    });
  }
}
