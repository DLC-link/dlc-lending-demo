import { io as ioClient } from 'socket.io-client';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { StacksNetworks } from '../networks/networks';
import store from '../store/store';
import { loanEventReceived, fetchLoan } from '../store/loansSlice';
import { cvToValue, deserializeCV } from '@stacks/transactions';
import { getStacksLoanByID } from '../blockchainFunctions/stacksFunctions';
import { ToastEvent } from '../components/CustomToast';

export function startStacksObserver(blockchain) {
  const { loanContractAddress, loanContractName, managerContractAddress, managerContractName, apiBase } =
    StacksNetworks[blockchain];
  const loanContractFullName = `${loanContractAddress}.${loanContractName}`;
  const managerContractFullName = `${managerContractAddress}.${managerContractName}`;

  const socket = ioClient(`wss://${apiBase}`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
  });

  const stacksSocket = new StacksApiSocketClient(socket);

  stacksSocket.socket.on('connect', async () => {
    console.log(`Listening to [${blockchain}]`);
  });

  stacksSocket.socket.on('disconnect', async (reason) => {
    console.log(`Disconnecting from [${blockchain}], reason: ${reason}`);
    stacksSocket.socket.connect();
  });

  setInterval(() => {
    if (stacksSocket.socket.disconnected) {
      console.log(`[Stacks] Attempting to connect stacksSocket to [${blockchain}]...`);
      stacksSocket.socket.connect();
    }
  }, 2000);

  stacksSocket.subscribeAddressTransactions(managerContractFullName);

  stacksSocket.socket.on('address-transaction', async (address, txWithTransfers) => {
    console.log(`TX happened on ${address}`);

    const _tx = txWithTransfers.tx;

    if (_tx.tx_status !== 'success') {
      store.dispatch(loanEventReceived({ status: ToastEvent.TRANSACTIONFAILED, txHash: _tx.tx_id }));
    }

    let txInfo;

    try {
      const response = await fetch(
        `https://${apiBase}${blockchain === 'stacks:1' ? '/btc1' : ''}/extended/v1/tx/${_tx.tx_id}`
      );
      txInfo = await response.json();
    } catch (error) {
      console.error(error);
    }
    if (txInfo.tx_type !== 'contract_call') return;

    const loanTXHash = txInfo.tx_id;

    if (txInfo.contract_call.function_name === 'borrow') {
      const loanID = parseInt(deserializeCV(txInfo.contract_call.function_args[0].hex).value);
      const loanStatus = 'Funded';
      const loan = await getStacksLoanByID(loanID);
      const loanUUID = loan.dlc_uuid.value.value;
      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'BorrowEvent',
        })
      );
    } else if (txInfo.contract_call.function_name === 'repay') {
      const loanID = parseInt(deserializeCV(txInfo.contract_call.function_args[0].hex).value);
      const loanStatus = 'Funded';
      const loan = await getStacksLoanByID(loanID);
      const loanUUID = loan.dlc_uuid.value.value;

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'RepayEvent',
        })
      );
    } else if (txInfo.contract_call.function_name === 'attempt-liquidate') {
      const loanUUID = parseInt(deserializeCV(txInfo.contract_call.function_args[1].hex).value);
      const loanStatus = 'PreLiquidated';

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'LiquidationEvent',
        })
      );
    } else {
      const event = txInfo.events.find(
        (e) => e.event_type === 'smart_contract_log' && e.contract_log.contract_id === loanContractFullName
      );

      if (!event) return;

      const { uuid, status } = cvToValue(deserializeCV(event.contract_log.value.hex));

      const loanUUID = uuid.value.value;
      const loanStatus = status.value;

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'StatusUpdate',
        })
      );
    }
  });
}
