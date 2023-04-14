import { customShiftValue, fixedTwoDecimalShift } from '../utils';
import { addressToString } from '@stacks/transactions';
import { bytesToHex } from 'micro-stacks/common';
import { compose, map } from 'ramda';

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

function formatClarityResponseForVisualization(rawLoanContract) {
  const formattedLoan = {
    raw: rawLoanContract,
    formatted: {
      uuid: `0x${rawLoanContract.uuid}`,
      vaultCollateral: customShiftValue(rawLoanContract.vaultCollateral, 8, true) + ' BTC',
      vaultLoan: '$ ' + customShiftValue(rawLoanContract.vaultLoan, 6, true),
      liquidationFee: fixedTwoDecimalShift(rawLoanContract.liquidationFee) + ' %',
      liquidationRatio: fixedTwoDecimalShift(rawLoanContract.liquidationRatio) + ' %',
    },
  };
  return formattedLoan;
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
  };
}

function formatSolidityResponseForVisualization(rawLoanContract) {
  const formattedLoan = {
    raw: rawLoanContract,
    formatted: {
      uuid: rawLoanContract.uuid,
      liquidationFee: fixedTwoDecimalShift(rawLoanContract.liquidationFee) + ' %',
      liquidationRatio: fixedTwoDecimalShift(rawLoanContract.liquidationRatio) + ' %',
      vaultCollateral: customShiftValue(rawLoanContract.vaultCollateral, 8, true) + ' BTC',
      vaultLoan: '$ ' + customShiftValue(rawLoanContract.vaultLoan, 18, true).toFixed(2),
    },
  };
  return formattedLoan;
}

export function formatAllLoans(loans, responseType) {
  let formattedLoans = [];
  switch (responseType) {
    case 'solidity':
      formattedLoans = compose(map(formatSolidityResponseForVisualization), map(convertSolidityResponseToUsableFormat))(loans);
      break;
    case 'clarity':
      formattedLoans = compose(map(formatClarityResponseForVisualization), map(convertClarityResponseToUsableFormat))(loans);
      break;
    default:
      console.error('Unsupported language!');
      break;
  }
  return formattedLoans;
}
