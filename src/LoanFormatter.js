import { customShiftValue, fixedTwoDecimalShift } from './utils';
import { addressToString } from '@stacks/transactions';
import { bytesToHex, bytesToUtf8 } from 'micro-stacks/common';
import { toJson } from './utils';

const loanFormatter = {
  formatClarityResponse(dlc) {
    const dlcData = dlc.value.data;

    const rawData = {
      status: dlcData.status.data,
      owner: addressToString(dlcData.owner.address),
      liquidationFee: toJson(dlcData['liquidation-fee'].value),
      liquidationRatio: toJson(dlcData['liquidation-ratio'].value),
      vaultCollateral: toJson(dlcData['vault-collateral'].value),
      vaultLoan: toJson(dlcData['vault-loan'].value),
      ...(dlcData.dlc_uuid.hasOwnProperty('value') && {
        dlcUUID: bytesToHex(dlcData.dlc_uuid.value.buffer),
      }),
    };
    return this.formatToReadable(rawData);
  },

  formatSolidityResponse(dlc) {
    const rawData = {
      id: parseInt(dlc.id._hex),
      status: dlc.status,
      owner: dlc.owner,
      liquidationFee: parseInt(dlc.liquidationFee._hex),
      liquidationRatio: parseInt(dlc.liquidationRatio._hex),
      vaultCollateral: parseInt(dlc.vaultCollateral._hex),
      vaultLoan: parseInt(dlc.vaultLoan._hex),
      ...(parseInt(dlc.closingPrice._hex) !== 0 && {
        closingPrice: parseInt(dlc.closingPrice._hex),
      }),
      ...(dlc.dlc_uuid !== '' && {
        dlcUUID: dlc.dlc_uuid,
      }),
    };
    return this.formatToReadable(rawData);
  },

  formatToReadable(rawData) {
    const loan = {
      raw: rawData,
      formatted: {
        formattedUUID: `0x${rawData.dlcUUID}`,
        formattedLiquidationFee: fixedTwoDecimalShift(rawData.liquidationFee) + ' %',
        formattedLiquidationRatio: fixedTwoDecimalShift(rawData.liquidationRatio) + ' %',
        formattedVaultCollateral: customShiftValue(rawData.vaultCollateral, 8, true) + ' BTC',
        formattedVaultLoan: '$ ' + fixedTwoDecimalShift(rawData.vaultLoan),
        ...(rawData.hasOwnProperty('closingPrice') && {
          formattedClosingPrice:
            '$ ' + Math.round((customShiftValue(rawData.closingPrice, 8, true) + Number.EPSILON) * 100) / 100,
        }),
      },
    };
    return loan;
  },

  formatAllDLC(dlcArray, responseType) {
    const loans = [];
    switch (responseType) {
      case 'solidity':
        for (const dlc of dlcArray) {
          const loan = this.formatSolidityResponse(dlc);
          loans.push(loan);
        }
        break;
      case 'clarity':
        for (const dlc of dlcArray) {
          const loan = this.formatClarityResponse(dlc);
          loans.push(loan);
        }
        break;
      default:
        console.error('Unsupported language!');
        break;
    }
    return loans;
  },
};

export default loanFormatter;
