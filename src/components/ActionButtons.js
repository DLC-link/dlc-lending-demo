import React from 'react';
import { Flex, VStack, Button, Tooltip, HStack } from '@chakra-ui/react';

import { useSelector, useDispatch } from 'react-redux';

import { lockBTC } from '../blockchainFunctions/bitcoinFunctions';
import { closeStacksLoan, liquidateStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { closeEthereumLoan, liquidateEthereumLoan } from '../blockchainFunctions/ethereumFunctions';

import { solidityLoanStatuses, clarityLoanStatuses } from '../enums/loanStatuses';

import { selectLoanByUUID } from '../store/loansSlice';
import { toggleBorrowModalVisibility, toggleRepayModalVisibility } from '../store/componentSlice';

export function ActionButtons({ loanUUID, canBeLiquidated }) {
  const dispatch = useDispatch();

  const loan = useSelector((state) => selectLoanByUUID(state, loanUUID));
  const walletType = useSelector((state) => state.account.walletType);

  let closeAction;
  let liquidateAction;

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

  function setActionButton() {
    if(loan.status === solidityLoanStatuses.FUNDED) {
      console.log(loanUUID)
      console.log(loan)
    }
    switch (loan.status) {
      case solidityLoanStatuses.READY:
      case clarityLoanStatuses.READY:
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
        console.log('loan', loan)
        return (
          <Flex>
            <VStack>
              <VStack>
                <Button
                  variant='outline'
                  onClick={() => dispatch(toggleBorrowModalVisibility({ isOpen: true, loan: loan }))}>
                  BORROW
                </Button>
              </VStack>
              {loan.vaultLoan > 0 ? (
                <VStack>
                  <Button
                    variant='outline'
                    onClick={() => dispatch(toggleRepayModalVisibility({ isOpen: true, loan: loan }))}>
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
            </VStack>
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
      case solidityLoanStatuses.REPAID:
      case clarityLoanStatuses.REPAID:
      case solidityLoanStatuses.LIQUIDATED:
      case clarityLoanStatuses.LIQUIDATED:
        break;
      default:
        break;
    }
  }

  const actionButton = setActionButton();

  return <>{actionButton}</>;
}
