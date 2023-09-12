import { hexToBytes as hexToBytesMS } from 'micro-stacks/common';

import Decimal from 'decimal.js';

export const easyTruncateAddress = (address) => {
  if (!address) return '';
  return address.substring(0, 4) + '...' + address.substring(address.length - 4, address.length);
};

export function customShiftValue(value, shift, unshift) {
  const decimalPoweredShift = new Decimal(10 ** shift);
  const decimalValue = new Decimal(value);
  const decimalShiftedValue = unshift
    ? decimalValue.div(decimalPoweredShift).toNumber()
    : decimalValue.mul(decimalPoweredShift).toNumber();

  console.log('decimalShiftedValue', decimalShiftedValue);
  return decimalShiftedValue;
}

export function isVaultLoanGreaterThanAllowedAmount(vaultLoan, allowedAmount) {
  console.log('vaultLoan', vaultLoan);
  console.log('allowedAmount', allowedAmount);
  const shiftedVaultLoanAmount = customShiftValue(vaultLoan, 2, true).toFixed(2);
  const decimalShiftedVaultLoan = new Decimal(shiftedVaultLoanAmount);
  const decimalAllowedAmount = new Decimal(allowedAmount);
  console.log('decimalShiftedVaultLoan', decimalShiftedVaultLoan);
  console.log('decimalAllowedAmount', decimalAllowedAmount);
  console.log(
    'decimalShiftedVaultLoan.greaterThan(decimalAllowedAmount)',
    decimalShiftedVaultLoan.greaterThan(decimalAllowedAmount)
  );
  return decimalShiftedVaultLoan.greaterThan(decimalAllowedAmount);
}

export function toJson(value) {
  return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? `${v}n` : v)).replace(/"(-?\d+)n"/g, (_, a) => a);
}

export function hexToBytes(hex) {
  return hexToBytesMS(hex.substring(0, 2) === '0x' ? hex.substring(2) : hex);
}

export function calculateCollateralCoveragePercentageForBorrow(
  collateralAmount,
  bitcoinUSDValue,
  existingDebt,
  additionalLoan
) {
  if (
    (collateralAmount === undefined || bitcoinUSDValue === undefined || existingDebt === undefined,
    additionalLoan === undefined)
  ) {
    return '-';
  }
  const decimalCollateralAmount = new Decimal(collateralAmount);
  const decimalBitcoinUSDValue = new Decimal(bitcoinUSDValue);
  const decimalExistingDebt = new Decimal(existingDebt);
  const decimalAdditionalLoan = new Decimal(additionalLoan);

  const decimalCollateralValueInUSD = decimalCollateralAmount.mul(decimalBitcoinUSDValue);
  const decimalTotalUSDDebt = decimalExistingDebt.add(decimalAdditionalLoan);

  const decimalCollateralToDebtRatio = decimalCollateralValueInUSD.div(decimalTotalUSDDebt);
  const ratioPercentage = decimalCollateralToDebtRatio.mul(100).toNumber().toFixed(2);

  return ratioPercentage;
}

export function calculateCollateralCoveragePercentageForRepay(
  collateralAmount,
  bitcoinUSDValue,
  existingDebt,
  additionalRepayment
) {
  if (
    (collateralAmount === undefined || bitcoinUSDValue === undefined || existingDebt === undefined,
    additionalRepayment === undefined)
  ) {
    return '-';
  }
  const decimalCollateralAmount = new Decimal(collateralAmount);
  const decimalBitcoinUSDValue = new Decimal(bitcoinUSDValue);
  const decimalExistingDebt = new Decimal(existingDebt);
  const decimalAdditionalRepayment = new Decimal(additionalRepayment);

  const decimalCollateralValueInUSD = decimalCollateralAmount.mul(decimalBitcoinUSDValue);
  const decimalTotalUSDDebt = decimalExistingDebt.sub(decimalAdditionalRepayment);

  const decimalCollateralToDebtRatio = decimalCollateralValueInUSD.div(decimalTotalUSDDebt);
  const ratioPercentage = decimalCollateralToDebtRatio.mul(100).toNumber().toFixed(2);

  return ratioPercentage;
}

export function calculateCollateralCoveragePercentageForLiquidation(collateralAmount, bitcoinValue, totalDebt) {
  if (collateralAmount === undefined || bitcoinValue === undefined || totalDebt === undefined) {
    return '-';
  }
  const decimalCollateralAmount = new Decimal(collateralAmount);
  const decimalBitcoinValue = new Decimal(bitcoinValue);
  const decimalTotalDebt = new Decimal(totalDebt);

  const decimalCollateralValueInUSD = decimalCollateralAmount.mul(decimalBitcoinValue);

  const decimalCollateralToDebtRatio = decimalCollateralValueInUSD.div(decimalTotalDebt);
  const ratioPercentage = decimalCollateralToDebtRatio.mul(100).toNumber().toFixed(2);

  return ratioPercentage;
}

export function formatCollateralInUSD(collateralAmount, bitcoinValue) {
  if (collateralAmount === undefined || bitcoinValue === undefined) {
    return '-';
  }
  const decimalCollateralAmount = new Decimal(collateralAmount);
  const decimalBitcoinValue = new Decimal(bitcoinValue);

  return new Intl.NumberFormat().format(decimalCollateralAmount.mul(decimalBitcoinValue).toNumber().toFixed(2));
}
