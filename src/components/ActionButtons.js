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
    case 'leather':
    case 'walletConnect':
      closeAction = () => closeStacksLoan(loan.uuid);
      liquidateAction = () => liquidateStacksLoan(loan.uuid);
      break;
    case 'metamask':
      closeAction = () => closeEthereumLoan(loan.uuid);
      liquidateAction = () => liquidateEthereumLoan(loan.uuid);
  }

  const ButtonContainer = ({ children }) => {
    return (
      <VStack
        spacing={2.5}
        padding={15}>
        {children}
      </VStack>
    );
  };

  switch (loan.status) {
    case solidityLoanStatuses.READY:
    case clarityLoanStatuses.READY:
      actionButton = (
        <ButtonContainer>
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
            margin={0}
            padding={0}
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
              fontSize={'10px'}
              textAlign={'justify'}
              padding={2.5}
              placement={'bottom'}
              width={200}
              background={'transparent'}
              border={'1px solid #FF4500'}
              borderRadius={'lg'}
              shadow={'dark-lg'}
              gutter={35}>
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
    case solidityLoanStatuses.NONE:
    case clarityLoanStatuses.NONE:
      break;
    case solidityLoanStatuses.PREREPAID:
    case clarityLoanStatuses.PREREPAID:
    case solidityLoanStatuses.PRELIQUIDATED:
    case clarityLoanStatuses.PRELIQUIDATED:
    case solidityLoanStatuses.PREFUNDED:
    case clarityLoanStatuses.PREFUNDED:
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
