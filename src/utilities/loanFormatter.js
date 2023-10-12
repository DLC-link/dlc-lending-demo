import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';
import { customShiftValue } from './utils';
import { cvToValue } from '@stacks/transactions';

export function formatClarityLoanContract(loanContract) {
  const uuid = loanContract.dlc_uuid.value.value;
  const status = loanContract.status.value;
  const owner = loanContract.owner.value;
  const vaultCollateral = customShiftValue(parseInt(loanContract['vault-collateral'].value), 8, true);
  const formattedVaultCollateral = `${vaultCollateral} BTC`;
  const vaultLoan = customShiftValue(parseInt(loanContract['vault-loan'].value), 6, true).toFixed(2);
  const formattedVaultLoan = `$ ${vaultLoan}`;
  const liquidationFee = parseInt(loanContract['liquidation-fee'].value);
  const formattedLiquidationFee = `${liquidationFee} %`;
  const liquidationRatio = parseInt(loanContract['liquidation-ratio'].value);
  const formattedLiquidationRatio = `${liquidationRatio} %`;
  const attestorList = loanContract.attestors.value.map((attestor) => attestor.value.dns.value);
  const closingTXHash = loanContract['btc-tx-id']?.value?.valu
  return {
    uuid,
    status,
    owner,
    vaultCollateral,
    formattedVaultCollateral,
    vaultLoan,
    formattedVaultLoan,
    liquidationFee,
    formattedLiquidationFee,
    liquidationRatio,
    formattedLiquidationRatio,
    closingTXHash,
    attestorList,
  };
}

export function formatSolidityLoanContract(loanContract) {
  const uuid = loanContract.dlcUUID;
  const status = Object.values(solidityLoanStatuses)[loanContract.status];
  const owner = loanContract.owner;
  const vaultCollateral = customShiftValue(parseInt(loanContract.vaultCollateral._hex), 8, true);
  const formattedVaultCollateral = `${vaultCollateral} BTC`;
  const vaultLoan = customShiftValue(parseInt(loanContract.vaultLoan._hex), 18, true).toFixed(2);
  const formattedVaultLoan = `$ ${vaultLoan}`;
  const liquidationFee = customShiftValue(parseInt(loanContract.liquidationFee._hex, 2, true).toFixed(2));
  const formattedLiquidationFee = `${liquidationFee} %`;
  const liquidationRatio = customShiftValue(parseInt(loanContract.liquidationRatio._hex), 2, true).toFixed(2);
  const formattedLiquidationRatio = `${liquidationRatio} %`;
  const attestorList = loanContract.attestorList;
  const closingTXHash = loanContract.btcTxId;
  return {
    uuid,
    status,
    owner,
    vaultCollateral,
    formattedVaultCollateral,
    vaultLoan,
    formattedVaultLoan,
    liquidationFee,
    formattedLiquidationFee,
    liquidationRatio,
    formattedLiquidationRatio,
    closingTXHash,
    attestorList,
  };
}

export function formatAllLoanContracts(loans, responseType) {
  let formattedLoans = [];
  switch (responseType) {
    case 'solidity':
      formattedLoans = loans.map((loan) => formatSolidityLoanContract(loan));
      break;
    case 'clarity':
      formattedLoans = loans.map((loan) => formatClarityLoanContract(cvToValue(loan.value)));
      break;
    default:
      console.error('Unsupported language!');
      break;
  }
  return formattedLoans;
}

export function updateLoanToFundingInProgress(loan, loanTXHash, walletType) {
  loan.fundingTXHash = loanTXHash;
  if (loan.status === solidityLoanStatuses.READY || loan.status === clarityLoanStatuses.READY) {
    loan.status = walletType === 'solidity' ? solidityLoanStatuses.PREFUNDED : clarityLoanStatuses.PREFUNDED;
  }
  return loan;
}

export function setStateIfFunded(loansWithBTCTransactions, loan, walletType) {
  const matchingLoanWithBTCTransaction = loansWithBTCTransactions.find(
    (loanWithBTCTransaction) => loan.uuid === loanWithBTCTransaction[0]
  );
  if (matchingLoanWithBTCTransaction) {
    loan = updateLoanToFundingInProgress(loan, matchingLoanWithBTCTransaction[1], walletType);
  }
  return loan;
}
