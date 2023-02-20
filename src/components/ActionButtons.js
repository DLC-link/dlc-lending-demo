import React from 'react';
import { lockBTC } from '../blockchainFunctions/bitcoinFunctions';
import { countCollateralToDebtRatio } from '../utils';
import { VStack, Button } from '@chakra-ui/react';

export function ActionButtons({ action, loan, bitCoinValue, onBorrowModalOpen, onRepayModalOpen }) {
  switch (action) {
    case 'pendingLoan':
      return (
        <Button
          variant='outline'
          isLoading
          loadingText='PENDING'
          color='gray'
          _hover={{
            shadow: 'none',
          }}></Button>
      );
    case 'lockLoan':
      return (
        <Button
          variant='outline'
          onClick={() => lockBTC(loan)}>
          LOCK BTC
        </Button>
      );
    case 'fundedLoan':
      return (
        <VStack>
          <Button
            variant='outline'
            onClick={() => onBorrowModalOpen()}>
            BORROW
          </Button>
          {loan.raw.vaultLoan > 0 ? (
            <Button
              variant='outline'
              onClick={() => onRepayModalOpen()}>
              REPAY LOAN
            </Button>
          ) : (
            <Button
              variant='outline'
              // onClick={() => closeLoanContract()}
            >
              CLOSE LOAN
            </Button>
          )}
          {countCollateralToDebtRatio(bitCoinValue, loan.raw.vaultCollateral, loan.raw.vaultLoan) < 140 && (
            <Button
              variant='outline'
              // onClick={() => liquidateLoanContract()}
            >
              LIQUIDATE
            </Button>
          )}
        </VStack>
      );
    case 'liquidateLoan':
      return <Button variant='outline'>LIQUIDATE LOAN</Button>;
    case 'closedLoan':
      break;
    default:
      console.error('Unknown action type!');
      break;
  }
}
