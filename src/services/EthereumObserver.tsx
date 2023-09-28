import { ethers } from 'ethers';
import { getEthereumContracts } from '../networks/networks';
import store from '../store/store';
import { fetchLoan, loanEventReceived } from '../store/loansSlice';
import { ToastEvent } from '../components/CustomToast';
import { solidityLoanStatuses } from '../enums/loanStatuses';
import { fetchOutstandingDebt } from '../store/externalDataSlice';

export async function startEthereumObserver(blockchain: string) {
  let ethereumProvider;
  let protocolContractETH, usdcBorrowVaultETH, dlcBtcETH;
  let usdcETH;

  try {
    const { address } = store.getState().account;
    const { ethereum } = window;

    ethereumProvider = new ethers.providers.Web3Provider(ethereum);
    const { name } = await ethereumProvider.getNetwork();
    const { protocolContract, usdc, usdcBorrowVault, dlcBtc } = await getEthereumContracts(name);

    protocolContractETH = new ethers.Contract(protocolContract.address, protocolContract.abi, ethereumProvider);
    usdcETH = new ethers.Contract(usdc.address, usdc.abi, ethereumProvider);
    usdcBorrowVaultETH = new ethers.Contract(usdcBorrowVault.address, usdcBorrowVault.abi, ethereumProvider);
    dlcBtcETH = new ethers.Contract(dlcBtc.address, dlcBtc.abi, ethereumProvider);

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
      const loanOwner = args[1];
      const loanTXHash = args[args.length - 1].transactionHash;

      console.log('Deposit');

      if (loanOwner.toLowerCase() !== address?.toLowerCase()) return;

      store.dispatch(
        loanEventReceived({
          status: ToastEvent.BORROWED,
          txHash: loanTXHash,
        })
      );

      store.dispatch(fetchOutstandingDebt());
    });

    usdcBorrowVaultETH.on('Withdraw', (...args) => {
      const loanOwner = args[1];
      const loanTXHash = args[args.length - 1].transactionHash;

      console.log('Withdraw');

      if (loanOwner.toLowerCase() !== address?.toLowerCase()) return;

      store.dispatch(
        loanEventReceived({
          status: ToastEvent.REPAID,
          txHash: loanTXHash,
        })
      );
      store.dispatch(fetchOutstandingDebt());
    });

    usdcETH.on('Approval', (...args) => {
      const loanOwner = args[0];
      const loanTXHash = args[args.length - 1].transactionHash;

      console.log('Approval');

      if (loanOwner.toLowerCase() !== address?.toLowerCase()) return;

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
