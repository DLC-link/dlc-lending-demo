import { customShiftValue, fixedTwoDecimalShift } from './utils';
import { cvToValue } from '@stacks/transactions';

export function formatClarityLoanContract(loanContract) {
  const uuid = loanContract.dlc_uuid.value.value;
  const status = loanContract.status.value;
  const owner = loanContract.owner.value;
  const vaultCollateral = customShiftValue(parseInt(loanContract['vault-collateral'].value), 8, true);
  const formattedVaultCollateral = `${vaultCollateral} BTC`;
  const vaultLoan = customShiftValue(parseInt(loanContract['vault-loan'].value), 6, true);
  const formattedVaultLoan = `$ ${vaultLoan}`;
  const liquidationFee = parseInt(loanContract['liquidation-fee'].value);
  const formattedLiquidationFee = `${liquidationFee} %`;
  const liquidationRatio = parseInt(loanContract['liquidation-ratio'].value);
  const formattedLiquidationRatio = `${liquidationRatio} %`;
  const attestorList = loanContract.attestors.value.map((attestor) => attestor.value.dns.value);
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
    attestorList,
  };
}

export function formatSolidityLoanContract(loanContract) {
  const uuid = loanContract.dlcUUID.value.value;
  const status = loanContract.status;
  const owner = loanContract.owner;
  const vaultCollateral = parseInt(loanContract.vaultCollateral._hex);
  const formattedVaultCollateral = `${customShiftValue(vaultCollateral, 8, true)} BTC`;
  const vaultLoan = customShiftValue(parseInt(loanContract.vaultLoan._hex), 18, true).toFixed(2);
  const formattedVaultLoan = `$ ${vaultLoan}`;
  const liquidationFee = fixedTwoDecimalShift(parseInt(loanContract.liquidationFee._hex));
  const formattedLiquidationFee = `${liquidationFee} %`;
  const liquidationRatio = fixedTwoDecimalShift(parseInt(loanContract.liquidationRatio._hex));
  const formattedLiquidationRatio = `${liquidationRatio} %`;
  const attestorList = loanContract.attestorList;
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
