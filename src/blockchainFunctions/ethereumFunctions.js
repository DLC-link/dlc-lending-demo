/* global BigInt */

import { ethers } from 'ethers';

import store from '../store/store';

import { abi as usdcABI } from '../abis/usdcABI';
import { abi as protocolContractABI } from '../abis/protocolContractABI';

import { EthereumNetworks } from '../networks/networks';

import { login } from '../store/accountSlice';
import { toggleInfoModalVisibility } from '../store/componentSlice';
import { loanSetupRequested, loanEventReceived } from '../store/loansSlice';

import { formatAllLoanContracts } from '../utilities/loanFormatter';
import { fixedTwoDecimalShift } from '../utilities/utils';
import { ToastEvent } from '../components/CustomToast';

let protocolContractETH;
let usdcETH;
let currentEthereumNetwork;

export async function setEthereumProvider() {
  const { protocolContractAddress, usdcAddress } = EthereumNetworks[currentEthereumNetwork];
  try {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();

    if (chainId !== parseInt(currentEthereumNetwork.slice(9))) {
      await changeEthereumNetwork();
    }
    protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
    usdcETH = new ethers.Contract(usdcAddress, usdcABI, signer);
  } catch (error) {
    console.error(error);
  }
}

async function changeEthereumNetwork() {
  const { ethereum } = window;
  const shortenedChainID = parseInt(currentEthereumNetwork.slice(9));
  const formattedChainId = '0x' + shortenedChainID.toString(16);
  try {
    store.dispatch(toggleInfoModalVisibility(true));
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: formattedChainId }],
    });
    window.location.reload();
  } catch (error) {
    if (error.code === 4001) {
      window.location.reload();
    }
    console.error(error);
  }
}

export async function requestAndDispatchMetaMaskAccountInformation(blockchain) {
  try {
    const { ethereum } = window;
    if (!ethereum) {
      alert('Install MetaMask!');
      return;
    }
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    const accountInformation = {
      walletType: 'metamask',
      address: accounts[0],
      blockchain,
    };

    currentEthereumNetwork = blockchain;

    await setEthereumProvider();

    store.dispatch(login(accountInformation));
  } catch (error) {
    console.error(error);
  }
}

export async function isAllowedInMetamask(vaultLoan) {
  const { protocolContractAddress } = EthereumNetworks[currentEthereumNetwork];
  const address = store.getState().account.address;

  const desiredAmount = BigInt('1000000000000000000000000');
  const allowedAmount = await usdcETH.allowance(address, protocolContractAddress);

  if (fixedTwoDecimalShift(vaultLoan) > parseInt(allowedAmount)) {
    try {
      await usdcETH.approve(protocolContractAddress, desiredAmount).then((response) =>
        store.dispatch(
          loanEventReceived({
            txHash: response.hash,
            status: ToastEvent.APPROVEREQUESTED,
          })
        )
      );
      return false;
    } catch (error) {
      console.error(error);
    }
  } else {
    return true;
  }
}

export async function sendLoanContractToEthereum(loanContract) {
  try {
    protocolContractETH
      .setupLoan(loanContract.BTCDeposit, loanContract.attestorCount, { gasLimit: 900000 })
      .then((response) => store.dispatch(loanSetupRequested({ BTCDeposit: loanContract.BTCDeposit })));
  } catch (error) {
    console.error(error);
  }
}

export async function getAllEthereumLoansForAddress() {
  const address = store.getState().account.address;
  let formattedLoans = [];
  try {
    const loanContracts = await protocolContractETH.getAllLoansForAddress(address);
    formattedLoans = formatAllLoanContracts(loanContracts, 'solidity');
  } catch (error) {
    console.error(error);
  }
  return formattedLoans;
}

export async function getEthereumLoan(loanID) {
  let loan;
  try {
    loan = await protocolContractETH.getLoan(loanID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function getEthereumLoanByUUID(UUID) {
  let loan;
  try {
    loan = await protocolContractETH.getLoanByUUID(UUID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function borrowEthereumLoan(UUID, additionalLoan) {
  const loan = await getEthereumLoanByUUID(UUID);
  if (await isAllowedInMetamask(ethers.utils.parseUnits(additionalLoan.toString(), 'ether'))) {
    try {
      await protocolContractETH
        .borrow(parseInt(loan.id._hex), ethers.utils.parseUnits(additionalLoan.toString(), 'ether'))
        .then((response) =>
          store.dispatch(
            loanEventReceived({
              txHash: response.hash,
              status: ToastEvent.BORROWREQUESTED,
            })
          )
        );
    } catch (error) {
      console.error(error);
    }
  }
}

export async function repayEthereumLoan(UUID, additionalRepayment) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH
      .repay(parseInt(loan.id._hex), ethers.utils.parseUnits(additionalRepayment.toString(), 'ether'))
      .then((response) =>
        store.dispatch(
          loanEventReceived({
            txHash: response.hash,
            status: ToastEvent.REPAYREQUESTED,
          })
        )
      );
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateEthereumLoan(UUID) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH.attemptLiquidate(parseInt(loan.id._hex)).then((response) => {
      store.dispatch(
        loanEventReceived({
          txHash: response.hash,
          status: ToastEvent.LIQUIDATIONREQUESTED,
        })
      );
    });
  } catch (error) {
    console.error(error);
  }
}

export async function closeEthereumLoan(UUID) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH.closeLoan(parseInt(loan.id._hex)).then((response) =>
      store.dispatch(
        loanEventReceived({
          txHash: response.hash,
          status: ToastEvent.CLOSEREQUESTED,
        })
      )
    );
  } catch (error) {
    console.error(error);
  }
}
