import { ethers } from 'ethers';
import { getEthereumContracts } from '../networks/networks';
import store from '../store/store';
import { fetchLoan, loanEventReceived } from '../store/loansSlice';
import { ToastEvent } from '../components/CustomToast';
import { solidityLoanStatuses } from '../enums/loanStatuses';

export async function startEthereumObserver(blockchain) {
  let ethereumProvider;
  let protocolContractETH;
  let usdcETH;

  try {
    const { ethereum } = window;
    ethereumProvider = new ethers.providers.Web3Provider(ethereum);
    const { name } = await ethereumProvider.getNetwork();
    const { protocolContract, usdc } = await getEthereumContracts(name);

    ethereumProvider = new ethers.providers.Web3Provider(ethereum);

    protocolContractETH = new ethers.Contract(protocolContract.address, protocolContract.abi, ethereumProvider);
    usdcETH = new ethers.Contract(usdc.address, usdc.abi, ethereumProvider);

    if (!protocolContractETH || !usdcETH || !ethereumProvider) return;

    console.log(`Listening to [${blockchain}]`);

    protocolContractETH.on('StatusUpdate', (...args) => {
      const loanUUID = args[1];
      const loanStatus = Object.values(solidityLoanStatuses)[args[2]];
      const loanTXHash = args[args.length - 1].transactionHash;

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'StatusUpdate',
        })
      );
    });

    protocolContractETH.on('BorrowEvent', (...args) => {
      const loanUUID = args[1];
      const loanStatus = Object.values(solidityLoanStatuses)[args[4]];
      const loanTXHash = args[args.length - 1].transactionHash;

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'BorrowEvent',
        })
      );
    });

    protocolContractETH.on('RepayEvent', (...args) => {
      const loanUUID = args[1];
      const loanStatus = Object.values(solidityLoanStatuses)[args[4]];
      const loanTXHash = args[args.length - 1].transactionHash;

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'RepayEvent',
        })
      );
    });

    protocolContractETH.on('DoesNotNeedLiquidation', (...args) => {
      const loanUUID = args[1];
      const loanStatus = Object.values(solidityLoanStatuses)[args[2]];
      const loanTXHash = args[args.length - 1].transactionHash;

      store.dispatch(
        fetchLoan({
          loanUUID: loanUUID,
          loanStatus: loanStatus,
          loanTXHash: loanTXHash,
          loanEvent: 'DoesNotNeedLiquidationEvent',
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
          status: ToastEvent.APPROVED,
          txHash: loanTXHash,
        })
      );
    });
  } catch (error) {
    console.error(error);
  }
}
