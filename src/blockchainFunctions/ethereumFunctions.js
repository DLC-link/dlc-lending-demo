import { ethers } from 'ethers';
import { abi as usdcForDLCsABI } from '../usdcForDLCsABI';
import { abi as loanManagerABI } from '../loanManagerABI';
import { fixedTwoDecimalShift } from '../utils';
import eventBus from '../EventBus';
import loanFormatter from '../LoanFormatter';

let loanManagerETH;
let usdcContract;

try {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  loanManagerETH = new ethers.Contract(process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS, loanManagerABI, signer);
  usdcContract = new ethers.Contract(process.env.REACT_APP_USDC_CONTRACT_ADDRESS, usdcForDLCsABI, signer);
} catch (error) {
  console.error(error);
}

export async function isAllowedInMetamask(creator, vaultLoan) {
  const desiredAmount = 1000000n * 10n ** 18n;
  const allowedAmount = await usdcContract.allowance(creator, process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS);

  if (fixedTwoDecimalShift(vaultLoan) > parseInt(allowedAmount)) {
    try {
      await usdcContract.approve(process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS, desiredAmount).then((response) =>
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
    loanManagerETH
      .setupLoan(
        loanContract.vaultLoanAmount,
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

export async function getEthereumLoans(address) {
  let loans = [];
  try {
    const response = await loanManagerETH.getAllLoansForAddress(address);
    loans = loanFormatter.formatAllDLC(response, 'solidity');
  } catch (error) {
    console.error(error);
  }
  return loans;
}

export async function repayEthereumLoanContract(loanContractID) {
  if (await isAllowedInMetamask()) {
    try {
      loanManagerETH.repayLoan(loanContractID).then((response) =>
        eventBus.dispatch('loan-event', {
          status: 'repay-requested',
          txId: response.hash,
        })
      );
    } catch (error) {
      console.error(error);
    }
  }
}

export async function liquidateEthereumLoanContract(loanContractID) {
  try {
    loanManagerETH.liquidateLoan(loanContractID).then((response) =>
      eventBus.dispatch('loan-event', {
        status: 'liquidation-requested',
        txId: response.hash,
      })
    );
  } catch (error) {
    console.error(error);
  }
}