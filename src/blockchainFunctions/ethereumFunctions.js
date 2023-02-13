import { ethers } from 'ethers';
import { abi as usdcContractABI } from '../abis/usdcContractABI';
import { abi as protocolContractABI } from '../abis/protocolContractABI';
import { fixedTwoDecimalShift } from '../utils';
import eventBus from '../EventBus';
import { formatAllLoans } from '../LoanFormatter';
import { createAndDispatchAccountInformation } from '../accountInformation';
import { ethereumBlockchains } from '../networks';

let signer;

try {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  signer = provider.getSigner();
} catch (error) {
  console.error(error);
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
    createAndDispatchAccountInformation('metamask', accounts[0], blockchain);
  } catch (error) {
    console.error(error);
  }
}

export async function isAllowedInMetamask(creator, vaultLoan, blockchain) {
  const { protocolContractAddress, usdcContractAddress } = ethereumBlockchains[blockchain];
  const desiredAmount = 1000000n * 10n ** 18n;
  const usdcContractETH = new ethers.Contract(usdcContractAddress, usdcContractABI, signer);
  const allowedAmount = await usdcContractETH.allowance(creator, protocolContractAddress);

  if (fixedTwoDecimalShift(vaultLoan) > parseInt(allowedAmount)) {
    try {
      await usdcContractETH
        .approve(process.env.REACT_APP_ETHEREUM_PROTOCOL_CONTRACT_ADDRESS, desiredAmount)
        .then((response) =>
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

export async function sendLoanContractToEthereum(loanContract, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);

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

export async function getAllEthereumLoansForAddress(address, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  let formattedLoans = [];
  try {
    const response = await protocolContractETH.getAllLoansForAddress(address);
    formattedLoans = formatAllLoans(response, 'solidity');
  } catch (error) {
    console.error(error);
  }
  return formattedLoans;
}

export async function getEthereumLoan(loanID, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  let loan;
  try {
    loan = await protocolContractETH.getLoan(loanID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function getEthereumLoanByUUID(UUID, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  let loan;
  try {
    loan = await protocolContractETH.getLoanByUUID(UUID);
  } catch (error) {
    console.error(error);
  }
  return loan;
}

export async function borrowEthereumLoan(creator, UUID, additionalLoan, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  const loan = await getEthereumLoanByUUID(UUID, blockchain);
  if (isAllowedInMetamask(creator, additionalLoan, blockchain)) {
    try {
      await protocolContractETH.borrow(parseInt(loan.id._hex), additionalLoan).then((response) =>
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

export async function repayEthereumLoan(UUID, additionalRepayment, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  const loan = await getEthereumLoanByUUID(UUID, blockchain);
  try {
    protocolContractETH.repay(parseInt(loan.id._hex), additionalRepayment).then((response) =>
      eventBus.dispatch('loan-event', {
        status: 'repay-requested',
        txId: response.hash,
      })
    );
  } catch (error) {
    console.error(error);
  }
}

export async function liquidateEthereumLoan(UUID, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  const loan = await getEthereumLoanByUUID(UUID, blockchain);
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

export async function closeEthereumLoan(UUID, blockchain) {
  const { protocolContractAddress } = ethereumBlockchains[blockchain];
  const protocolContractETH = new ethers.Contract(protocolContractAddress, protocolContractABI, signer);
  const loan = await getEthereumLoanByUUID(UUID, blockchain);
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
