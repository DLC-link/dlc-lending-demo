import { ethers } from 'ethers';
import { EthereumNetworks } from '../networks/networks';
import { abi as protocolContractABI } from '../abis/protocolContractABI';
import { abi as usdcABI } from '../abis/usdcABI';
import { abi as usdcBorrowVaultABI } from '../abis/usdcBorrowVaultABI';
import { abi as dlcBtcABI } from '../abis/dlcBtcABI';
import store from '../store/store';
import { fetchLoan, loanEventReceived } from '../store/loansSlice';
import { ToastEvent } from '../components/CustomToast';
import { solidityLoanStatuses } from '../enums/loanStatuses';

export function startEthereumObserver(blockchain) {
  let ethereumProvider;
  let protocolContractETH, usdcBorrowVaultETH, dlcBtcETH;
  let usdcETH;

  try {
    const { protocolContractAddress, usdcAddress, usdcBorrowVaultAddress, dlcBtcAddress } =
      EthereumNetworks[blockchain];
    const { ethereum } = window;

    ethereumProvider = new ethers.providers.Web3Provider(ethereum);

    protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, ethereumProvider);
    usdcETH = new ethers.Contract(usdcAddress, usdcABI, ethereumProvider);
    usdcBorrowVaultETH = new ethers.Contract(usdcBorrowVaultAddress, usdcBorrowVaultABI, ethereumProvider);
    dlcBtcETH = new ethers.Contract(dlcBtcAddress, dlcBtcABI, ethereumProvider);

    if (!protocolContractETH || !usdcETH || !ethereumProvider || !dlcBtcETH || !usdcBorrowVaultETH) return;

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

    usdcBorrowVaultETH.on('Deposit', (...args) => {
      const loanUUID = args[1];
      const loanStatus = Object.values(solidityLoanStatuses)[args[4]];
      const loanTXHash = args[args.length - 1].transactionHash;

      store.dispatch(
        loanEventReceived({
          status: ToastEvent.BORROWED,
          txHash: loanTXHash,
        })
      );
    });

    // protocolContractETH.on('RepayEvent', (...args) => {
    //   const loanUUID = args[1];
    //   const loanStatus = Object.values(solidityLoanStatuses)[args[4]];
    //   const loanTXHash = args[args.length - 1].transactionHash;

    //   store.dispatch(
    //     fetchLoan({
    //       loanUUID: loanUUID,
    //       loanStatus: loanStatus,
    //       loanTXHash: loanTXHash,
    //       loanEvent: 'RepayEvent',
    //     })
    //   );
    // });

    // protocolContractETH.on('DoesNotNeedLiquidation', (...args) => {
    //   const loanUUID = args[1];
    //   const loanStatus = Object.values(solidityLoanStatuses)[args[2]];
    //   const loanTXHash = args[args.length - 1].transactionHash;

    //   store.dispatch(
    //     fetchLoan({
    //       loanUUID: loanUUID,
    //       loanStatus: loanStatus,
    //       loanTXHash: loanTXHash,
    //       loanEvent: 'DoesNotNeedLiquidationEvent',
    //     })
    //   );
    // });

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
