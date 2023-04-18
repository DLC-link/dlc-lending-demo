import React from 'react';
import { Flex, VStack, Button, Tooltip, HStack } from '@chakra-ui/react';
import {
  closeEthereumLoan,
  liquidateEthereumLoan,
  repayEthereumLoan,
  borrowEthereumLoan,
} from '../blockchainFunctions/ethereumFunctions';
import {
  closeStacksLoan,
  liquidateStacksLoan,
  repayStacksLoan,
  borrowStacksLoan,
} from '../blockchainFunctions/stacksFunctions';
import { lockBTC } from '../blockchainFunctions/bitcoinFunctions';
import { useSelector } from 'react-redux';
import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';
import { selectLoanByUUID } from '../store/loansSlice';

export function ActionButtons({ loanUUID, canBeLiquidated }) {
  const walletType = useSelector((state) => state.account.walletType);
  const loan = useSelector((state) => selectLoanByUUID(state, loanUUID));

  let borrowAction;
  let repayAction;
  let closeAction;
  let liquidateAction;

  switch (walletType) {
    case 'xverse':
    case 'hiro':
      borrowAction = () => borrowStacksLoan(loan.uuid);
      repayAction = () => repayStacksLoan(loan.uuid);
      closeAction = () => closeStacksLoan(loan.uuid);
      liquidateAction = () => liquidateStacksLoan(loan.uuid);
      break;
    case 'metamask':
      borrowAction = () => borrowEthereumLoan(loan.uuid);
      repayAction = () => repayEthereumLoan(loan.uuid);
      closeAction = () => closeEthereumLoan(loan.uuid);
      liquidateAction = () => liquidateEthereumLoan(loan.uuid);
  }

  function setActionButton() {
    switch (loan.status) {
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
        console.log('ready');
        return (
          <Flex>
            <VStack>
              <Button
                variant='outline'
                onClick={() => lockBTC(loan)}>
                LOCK BTC
              </Button>
            </VStack>
          </Flex>
        );
      case solidityLoanStatuses.FUNDED:
      case clarityLoanStatuses.FUNDED:
        return (
          <Flex>
            <HStack>
              <VStack>
                <Button
                  variant='outline'
                  onClick={() => borrowAction()}>
                  BORROW
                </Button>
              </VStack>
              {loan.raw.loan > 0 ? (
                <VStack>
                  <Button
                    variant='outline'
                    onClick={() => repayAction()}>
                    REPAY
                  </Button>
                </VStack>
              ) : (
                <VStack>
                  <Button
                    variant='outline'
                    onClick={() => closeAction()}>
                    CLOSE
                  </Button>
                </VStack>
              )}
              {canBeLiquidated && (
                <VStack>
                  <Tooltip
                    label='Liquidate the vault and redeem the collateral value for WBTC. The NFT will be burned.'
                    fontSize={'sm'}
                    padding={2}
                    textAlign={'justify'}
                    borderRadius={'lg'}>
                    <Button
                      variant='outline'
                      onClick={() => liquidateAction()}>
                      REDEEM WBTC
                    </Button>
                  </Tooltip>
                </VStack>
              )}
            </HStack>
          </Flex>
        );
      case solidityLoanStatuses.NOTREADY:
      case clarityLoanStatuses.NOTREADY:
      case solidityLoanStatuses.PREREPAID:
      case clarityLoanStatuses.PREREPAID:
      case solidityLoanStatuses.PRELIQUIDATED:
      case clarityLoanStatuses.PRELIQUIDATED:
        return (
          <Flex>
            <Button
              variant='outline'
              isLoading
              loadingText='PENDING'
              color='gray'
              _hover={{
                shadow: 'none',
              }}></Button>
          </Flex>
        );
      case solidityLoanStatuses.REPAID || clarityLoanStatuses.REPAID:
      case solidityLoanStatuses.LIQUIDATED || clarityLoanStatuses.LIQUIDATED:
        break;
      default:
        break;
    }
  }

  const actionButton = setActionButton();

  return <>{actionButton}</>;
}
