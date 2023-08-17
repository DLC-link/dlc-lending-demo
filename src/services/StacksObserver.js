import { io as ioClient } from 'socket.io-client';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { StacksNetworks } from '../networks/networks';
import store from '../store/store';
import { loanEventReceived, fetchLoan } from '../store/loansSlice';
import { cvToValue, deserializeCV } from '@stacks/transactions';

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

  stacksSocket.subscribeAddressTransactions(managerContractFullName);
  stacksSocket.subscribeAddressTransactions(loanContractFullName);

  stacksSocket.socket.on('address-transaction', async (address, txWithTransfers) => {
    console.log(`TX happened on ${address}`);

    const _tx = txWithTransfers.tx;

    if (_tx.tx_status !== 'success') {
      store.dispatch(loanEventReceived({ status: 'Failed', txHash: _tx.tx_id }));
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
  });
}
