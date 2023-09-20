import { Button, Progress, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { fetchBitcoinContractOfferAndSendToUserWallet } from '../blockchainFunctions/bitcoinFunctions';
import { closeEthereumLoan } from '../blockchainFunctions/ethereumFunctions';
import { closeStacksLoan } from '../blockchainFunctions/stacksFunctions';
import useConfirmationChecker from '../hooks/useConfirmationChecker';

import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';

export const ButtonContainer = ({ children }) => {
  return (
    <VStack
      spacing={2.5}
      padding={15}>
      {children}
    </VStack>
  );
};

const ConfirmationProgress = (loan) => {
  const transactionConfirmations = useConfirmationChecker(loan);

  const [shouldBeIndeterminate, setShouldBeIndeterminate] = useState(false);
  const [confirmationText, setConfirmationText] = useState(
    <Text>
      <strong>0</strong>/6 confirmations
    </Text>
  );

  useEffect(() => {
    setShouldBeIndeterminate(
      transactionConfirmations === 0 || transactionConfirmations > 6 || isNaN(transactionConfirmations)
    );

    setConfirmationText(
      <Text>
        <strong>{transactionConfirmations}</strong>/6 confirmations
      </Text>
    );
  }, [transactionConfirmations]);

  if (transactionConfirmations >= 6 && [solidityLoanStatuses.CLOSED, clarityLoanStatuses.CLOSED].includes(loan.status))
    return;

  return (
    <ButtonContainer>
      <VStack padding={2.5}>
        {transactionConfirmations <= 6 ? (
          <Text
            fontSize={'xs'}
            fontWeight={'regular'}
            color={'white'}>
            {confirmationText}
          </Text>
        ) : (
          <Text
            fontSize={'xs'}
            fontWeight={'regular'}
            color={'white'}>
            processing...
          </Text>
        )}
        <Progress
          isIndeterminate={shouldBeIndeterminate}
          value={transactionConfirmations}
          max={6}
          hasStripe={true}
          isAnimated={true}
          colorScheme='teal'
          size={'sm'}
          width={200}
        />
      </VStack>
    </ButtonContainer>
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
    case solidityLoanStatuses.CLOSED:
    case clarityLoanStatuses.CLOSED:
    case solidityLoanStatuses.PREFUNDED:
    case clarityLoanStatuses.PREFUNDED:
      actionButton = <ConfirmationProgress loan={loan} />;
      break;
    default:
      break;
  }

  return actionButton;
}
