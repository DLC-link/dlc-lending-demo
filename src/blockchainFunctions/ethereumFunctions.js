import { ethers } from 'ethers';
import { abi as usdcABI } from '../abis/usdcABI';
import { abi as protocolContractABI } from '../abis/protocolContractABI';
import { fixedTwoDecimalShift } from '../utils';
import eventBus from '../EventBus';
import { EthereumNetworks } from '../networks/ethereumNetworks';
import { login } from '../store/accountSlice';
import store from '../store/store';
import { formatAllLoanContracts } from '../utilities/loanFormatter';
import { add } from 'ramda';

let protocolContractETH;
let usdcETH;
let currentEthereumNetwork;

export async function setEthereumProvider() {
    const { protocolContractAddress, usdcAddress } =
        EthereumNetworks[currentEthereumNetwork];
    try {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const { chainId } = await provider.getNetwork();
        if (chainId !== currentEthereumNetwork.slice(9)) {
            await changeEthereumNetwork();
        }
        protocolContractETH = new ethers.Contract(
            protocolContractAddress,
            protocolContractABI,
            signer
        );
        usdcETH = new ethers.Contract(usdcAddress, usdcABI, signer);
    } catch (error) {
        console.error(error);
    }
}

async function changeEthereumNetwork() {
    const { ethereum } = window;
    const shortenedChainID = currentEthereumNetwork.slice(9);
    console.log(shortenedChainID)
    const formattedChainId = '0x' + shortenedChainID.toString(16);
    try {
        eventBus.dispatch('is-info-modal-open', { isInfoModalOpen: true });
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

  const desiredAmount = 1000000n * 10n ** 18n;
  const allowedAmount = await usdcETH.allowance(address, protocolContractAddress);

  if (fixedTwoDecimalShift(vaultLoan) > parseInt(allowedAmount)) {
    try {
      await usdcETH.approve(protocolContractAddress, desiredAmount).then((response) =>
        eventBus.dispatch('loan-event', {
          status: 'approve-requested',
          txId: response.hash,
        })
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
      .setupLoan(
        loanContract.BTCDeposit,
        loanContract.liquidationRatio,
        loanContract.liquidationFee,
        loanContract.emergencyRefundTime
      )
      .then((response) =>
        eventBus.dispatch('loan-event', {
          status: 'created',
          txId: response.hash,
        })
      );
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
          eventBus.dispatch('loan-event', {
            status: 'borrow-requested',
            txId: response.hash,
          })
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
        eventBus.dispatch('loan-event', {
          status: 'repay-requested',
          txId: response.hash,
        })
      );
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateEthereumLoan(UUID) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH.attemptLiquidate(parseInt(loan.id._hex)).then((response) =>
      eventBus.dispatch('loan-event', {
        status: 'liquidation-requested',
        txId: response.hash,
      })
    );
  } catch (error) {
    console.error(error);
  }
}

export async function closeEthereumLoan(UUID) {
  const loan = await getEthereumLoanByUUID(UUID);
  try {
    protocolContractETH.closeLoan(parseInt(loan.id._hex)).then((response) =>
      eventBus.dispatch('loan-event', {
        status: 'closing-requested',
        txId: response.hash,
      })
    );
  } catch (error) {
    console.error(error);
  }
}
