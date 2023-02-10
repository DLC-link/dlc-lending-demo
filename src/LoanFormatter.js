import { customShiftValue, fixedTwoDecimalShift } from './utils';
import { addressToString } from '@stacks/transactions';
import { bytesToHex } from 'micro-stacks/common';

const statuses = {
  0: 'none',
  1: 'not-ready',
  2: 'ready',
  3: 'funded',
  4: 'pre-repaid',
  5: 'repaid',
  6: 'pre-liquidated',
  7: 'liquidated',
};

function convertClarityResponseToUsableFormat(loanContract) {
  return {
    ...(loanContract.value.data.dlc_uuid.hasOwnProperty('value') && {
      uuid: bytesToHex(loanContract.value.data.dlc_uuid.value.buffer),
    }),
    status: loanContract.value.data.status.data,
    owner: addressToString(loanContract.value.data.owner.address),
    vaultCollateral: loanContract.value.data['vault-collateral'].value.toString(),
    vaultLoan: loanContract.value.data['vault-loan'].value.toString(),
    liquidationFee: loanContract.value.data['liquidation-fee'].value.toString(),
    liquidationRatio: loanContract.value.data['liquidation-ratio'].value.toString(),
  };
}

function convertSolidityResponseToUsableFormat(loanContract) {
  return {
    id: parseInt(loanContract.id._hex),
    uuid: loanContract.dlcUUID,
    status: statuses[loanContract.status],
    owner: loanContract.owner,
    vaultCollateral: parseInt(loanContract.vaultCollateral._hex),
    vaultLoan: parseInt(loanContract.vaultLoan._hex),
    liquidationFee: parseInt(loanContract.liquidationFee._hex),
    liquidationRatio: parseInt(loanContract.liquidationRatio._hex),
    ...(parseInt(loanContract.closingPrice._hex) !== 0 && {
      closingPrice: parseInt(loanContract.closingPrice._hex),
    }),
  };
}

function formatClarityResponseForVisualization(raw) {
  const formattedLoan = {
    raw: raw,
    formatted: {
      uuid: `0x${raw.uuid}`,
      vaultCollateral: customShiftValue(raw.vaultCollateral, 8, true) + ' BTC',
      vaultLoan: '$ ' + customShiftValue(raw.vaultLoan, 6, true),
      liquidationFee: fixedTwoDecimalShift(raw.liquidationFee) + ' %',
      liquidationRatio: fixedTwoDecimalShift(raw.liquidationRatio) + ' %',
      ...(raw.hasOwnProperty('closingPrice') && {
        closingPrice: '$ ' + Math.round((customShiftValue(raw.closingPrice, 8, true) + Number.EPSILON) * 100) / 100,
      }),
    },
  };
  return formattedLoan;
}

function formatSolidityResponseForVisualization(raw) {
  const formattedLoan = {
    raw: raw,
    formatted: {
      uuid: raw.uuid,
      liquidationFee: fixedTwoDecimalShift(raw.liquidationFee) + ' %',
      liquidationRatio: fixedTwoDecimalShift(raw.liquidationRatio) + ' %',
      vaultCollateral: customShiftValue(raw.vaultCollateral, 8, true) + ' BTC',
      vaultLoan: '$ ' + customShiftValue(raw.vaultLoan, 6, true),
      ...(raw.hasOwnProperty('closingPrice') && {
        closingPrice: '$ ' + Math.round((customShiftValue(raw.closingPrice, 8, true) + Number.EPSILON) * 100) / 100,
      }),
    },
  };
  return formattedLoan;
}

export function formatAllLoans(loans, responseType) {
  const formattedLoans = [];
  switch (responseType) {
    case 'solidity':
      for (const loan of loans) {
        const convertedLoan = convertSolidityResponseToUsableFormat(loan)
        const formattedLoan = formatSolidityResponseForVisualization(convertedLoan)
        formattedLoans.push(formattedLoan);
      }
      break;
    case 'clarity':
      for (const loan of loans) {
        const convertedLoan = convertClarityResponseToUsableFormat(loan)
        const formattedLoan = formatClarityResponseForVisualization(convertedLoan)
        formattedLoans.push(formattedLoan);
      }
      break;
    default:
      console.error('Unsupported language!');
      break;
  }
  return formattedLoans;
}
