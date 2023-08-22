import React from 'react';
import { VStack, Button, Tooltip, Text } from '@chakra-ui/react';

import { useSelector, useDispatch } from 'react-redux';

import { fetchBitcoinContractOfferAndSendToUserWallet } from '../blockchainFunctions/bitcoinFunctions';
import { closeStacksLoan, liquidateStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { closeEthereumLoan, liquidateEthereumLoan } from '../blockchainFunctions/ethereumFunctions';

import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';

import { toggleBorrowModalVisibility, toggleRepayModalVisibility } from '../store/componentSlice';

export function ActionButtons({ loan, canBeLiquidated }) {
  const dispatch = useDispatch();
  const walletType = useSelector((state) => state.account.walletType);

  let closeAction;
  let liquidateAction;
  let actionButton;

  switch (walletType) {
    case 'xverse':
    case 'hiro':
    case 'walletConnect':
      closeAction = () => closeStacksLoan(loan.uuid);
      liquidateAction = () => liquidateStacksLoan(loan.uuid);
      break;
    case 'metamask':
      closeAction = () => closeEthereumLoan(loan.uuid);
      liquidateAction = () => liquidateEthereumLoan(loan.uuid);
  }

  const ButtonContainer = ({ children }) => {
    return <VStack spacing={15}>{children}</VStack>;
  };

  switch (loan.status) {
    case solidityLoanStatuses.READY:
    case clarityLoanStatuses.READY:
      actionButton = (
        <ButtonContainer>
          <Text
            width={200}
            textAlign={'justify'}>
            You have 3 minutes to lock in your BTC after setting up the loan, or the offer will expire.
          </Text>
          <Button
            variant='outline'
            onClick={() => fetchBitcoinContractOfferAndSendToUserWallet(loan)}>
            LOCK BTC
          </Button>
        </ButtonContainer>
      );
      break;
    case solidityLoanStatuses.FUNDED:
    case clarityLoanStatuses.FUNDED:
      actionButton = (
        <ButtonContainer>
          <Button
            variant='outline'
            onClick={() => dispatch(toggleBorrowModalVisibility({ isOpen: true, loan: loan }))}>
            BORROW
          </Button>
          {loan.vaultLoan > 0 ? (
            <Button
              variant='outline'
              onClick={() => dispatch(toggleRepayModalVisibility({ isOpen: true, loan: loan }))}>
              REPAY
            </Button>
          ) : (
            <Button
              variant='outline'
              onClick={() => closeAction()}>
              CLOSE
            </Button>
          )}
          {canBeLiquidated && (
            <Tooltip
              label='Liquidate the loan and redeem the collateral value for BTC.'
              fontSize={'sm'}
              padding={2}
              textAlign={'justify'}
              borderRadius={'lg'}>
              <Button
                variant='outline'
                onClick={() => liquidateAction()}>
                LIQUIDATE
              </Button>
            </Tooltip>
          )}
        </ButtonContainer>
      );
      break;
    case solidityLoanStatuses.NOTREADY:
    case clarityLoanStatuses.NOTREADY:
    case solidityLoanStatuses.PREREPAID:
    case clarityLoanStatuses.PREREPAID:
    case solidityLoanStatuses.PRELIQUIDATED:
    case clarityLoanStatuses.PRELIQUIDATED:
      actionButton = (
        <ButtonContainer>
          <Button
            variant='outline'
            isLoading
            loadingText='PENDING'
            color='gray'
            _hover={{
              shadow: 'none',
            }}
          />
        </ButtonContainer>
      );
      break;
    case solidityLoanStatuses.REPAID:
    case clarityLoanStatuses.REPAID:
    case solidityLoanStatuses.LIQUIDATED:
    case clarityLoanStatuses.LIQUIDATED:
      break;
    default:
      break;
  }

  return actionButton;
}
