import React from 'react';
import { VStack, Button, Tooltip, Text } from '@chakra-ui/react';

import { useSelector, useDispatch } from 'react-redux';

import { fetchBitcoinContractOfferAndSendToUserWallet } from '../blockchainFunctions/bitcoinFunctions';
import { closeStacksLoan, liquidateStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { closeEthereumLoan, liquidateEthereumLoan } from '../blockchainFunctions/ethereumFunctions';

import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';

export const ButtonContainer = ({ children }) => {
  return (
    <VStack
      spacing={2.5}
      padding={15}>
      {children}
    </VStack>
  );
};

export function ActionButtons({ loan }) {
  const walletType = useSelector((state) => state.account.walletType);

  let closeAction;
  let actionButton;

  switch (walletType) {
    case 'xverse':
    case 'leather':
    case 'walletConnect':
      closeAction = () => closeStacksLoan(loan.uuid);
      break;
    case 'metamask':
      closeAction = () => closeEthereumLoan(loan.uuid);
  }

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
            onClick={() => closeAction()}>
            CLOSE
          </Button>
        </ButtonContainer>
      );
      break;
    case solidityLoanStatuses.NONE:
    case clarityLoanStatuses.NONE:
      break;
    case solidityLoanStatuses.PRECLOSED:
    case clarityLoanStatuses.PRECLOSED:
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
    default:
      break;
  }

  return actionButton;
}
