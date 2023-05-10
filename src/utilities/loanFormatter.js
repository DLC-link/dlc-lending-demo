import { customShiftValue, fixedTwoDecimalShift } from '../utils';
import { addressToString } from '@stacks/transactions';
import { bytesToHex } from 'micro-stacks/common';
import { solidityLoanStatuses } from '../enums/loanStatuses';

export function formatClarityLoanContract(loanContract) {
  const loanContractData = loanContract.value.data;

  const uuid = loanContractData.dlc_uuid.hasOwnProperty('value')
    ? bytesToHex(loanContract.value.data.dlc_uuid.value.buffer)
    : null;
  const formattedUUID = loanContractData.dlc_uuid.hasOwnProperty('value') ? `0x${uuid}` : null;
  const status = loanContractData.status.data;
  const owner = addressToString(loanContractData.owner.address);
  const vaultCollateral = loanContractData['vault-collateral'].value.toString();
  const formattedVaultCollateral = customShiftValue(vaultCollateral, 8, true) + ' BTC';
  const vaultLoan = loanContractData['vault-loan'].value.toString();
  const formattedVaultLoan = customShiftValue(vaultLoan, 6, true) + ' USDC';
  const liquidationFee = loanContractData['liquidation-fee'].value.toString();
  const formattedLiquidationFee = parseInt(liquidationFee._hex);
  const liquidationRatio = loanContractData['liquidation-ratio'].value.toString();
  const formattedLiquidationRatio = parseInt(liquidationRatio._hex);
  return {
    ...(uuid && {
      uuid,
    }),
    ...(formattedUUID && {
      formattedUUID,
    }),
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
  };
}

export function formatSolidityLoanContract(loanContract) {
  const uuid = loanContract.dlcUUID;
  const formattedUUID = uuid;
  const status = Object.values(solidityLoanStatuses)[loanContract.status];
  const owner = loanContract.owner;
  const vaultCollateral = parseInt(loanContract.vaultCollateral._hex);
  const formattedVaultCollateral = customShiftValue(vaultCollateral, 8, true) + ' BTC';
  const vaultLoan = parseInt(loanContract.vaultLoan._hex);
  const formattedVaultLoan = '$ ' + customShiftValue(vaultLoan, 18, true).toFixed(2);
  const liquidationFee = parseInt(loanContract.liquidationFee._hex);
  const formattedLiquidationFee = fixedTwoDecimalShift(liquidationFee) + ' %';
  const liquidationRatio = parseInt(loanContract.liquidationRatio._hex);
  const formattedLiquidationRatio = fixedTwoDecimalShift(liquidationRatio) + ' %';
  return {
    uuid,
    formattedUUID,
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
  };
}

export function formatAllLoanContracts(loans, responseType) {
  let formattedLoans = [];
  switch (responseType) {
    case 'solidity':
      formattedLoans = loans.map((loan) => formatSolidityLoanContract(loan));
      break;
    case 'clarity':
      formattedLoans = loans.map((loan) => formatClarityLoanContract(loan));
      break;
    default:
      console.error('Unsupported language!');
      break;
  }
  return formattedLoans;
}
