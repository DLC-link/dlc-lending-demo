import { hexToBytes as hexToBytesMS } from 'micro-stacks/common';

export const easyTruncateAddress = (address) => {
  if (!address) return '';
  return address.substring(0, 4) + '...' + address.substring(address.length - 4, address.length);
};

export function customShiftValue(value, shift, unshift) {
  return unshift ? value / 10 ** shift : value * 10 ** shift;
}

export function fixedTwoDecimalShift(value) {
  return customShiftValue(value, 2, true).toFixed(2);
}

export function fixedTwoDecimalUnshift(value) {
  return customShiftValue(value, 2, false);
}

export function toJson(value) {
  return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? `${v}n` : v)).replace(/"(-?\d+)n"/g, (_, a) => a);
}

export function hexToBytes(hex) {
  return hexToBytesMS(hex.substring(0, 2) === '0x' ? hex.substring(2) : hex);
}

export const chooseShiftValue = (walletType) => {
  switch (walletType) {
    case 'metamask':
      return 18;
    case 'hiro':
    case 'xverse':
    case 'walletConnect':
      return 6;
    default:
      console.error('Unknown wallet type');
      break;
  }
};

export function calculateCollateralCoveragePercentageForBorrow(
  collateralAmount,
  bitcoinValue,
  existingDebt,
  additionalLoan
) {
  const collateralValueInUSD = Math.round(collateralAmount * bitcoinValue);
  const totalDebt = existingDebt + additionalLoan;

  if (isNaN(collateralValueInUSD) || isNaN(totalDebt) || totalDebt <= 0) {
    return NaN;
  }

  const collateralToDebtRatio = collateralValueInUSD / totalDebt;

  const ratioPercentage = Math.round(collateralToDebtRatio * 100);

  return ratioPercentage;
}

export function calculateCollateralCoveragePercentageForRepay(
  collateralAmount,
  bitcoinValue,
  existingDebt,
  additionalRepayment
) {
  const collateralValueInUSD = Math.round(collateralAmount * bitcoinValue);
  const totalDebt = existingDebt - additionalRepayment;

  if (isNaN(collateralValueInUSD) || isNaN(totalDebt) || totalDebt <= 0) {
    return NaN;
  }

  const collateralToDebtRatio = collateralValueInUSD / totalDebt;
  const ratioPercentage = Math.round(collateralToDebtRatio * 100);

  return ratioPercentage;
}

export function calculateCollateralCoveragePercentageForLiquidation(collateralAmount, bitcoinValue, totalDebt) {
  const collateralValueInUSD = Math.round(collateralAmount * bitcoinValue);

  if (isNaN(collateralValueInUSD) || isNaN(totalDebt) || totalDebt <= 0) {
    return NaN;
  }

  const collateralToDebtRatio = collateralValueInUSD / totalDebt;
  const ratioPercentage = Math.round(collateralToDebtRatio * 100);

  return ratioPercentage;
}

export function formatCollateralInUSD(collateralAmount, bitcoinValue) {
  return new Intl.NumberFormat().format(bitcoinValue * collateralAmount);
}

export function formatBitcoinInUSDAmount(bitcoinValue) {
  return Number(bitcoinValue.bpi.USD.rate.replace(/[^0-9.-]+/g, ''));
}
