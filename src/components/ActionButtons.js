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
import { loanStatuses } from '../enums/loanStatuses';
import { selectLoanByUUID } from '../store/loansSlice';
import { countCollateralToDebtRatio } from '../utils';

export function ActionButtons({ loanUUID }) {
  const walletType = useSelector((state) => state.account.walletType);
  const loan = useSelector((state) => selectLoanByUUID(state, loanUUID));

  function renderButton(loan) {
    switch (loan.status) {
      case loanStatuses.READY:
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
      case loanStatuses.FUNDED:
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
              {countCollateralToDebtRatio(bitCoinValue, loan.raw.vaultCollateral, loan.raw.vaultLoan) < 140 && (
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
      case loanStatuses.NOTREADY:
      case loanStatuses.FUNDED:
      case loanStatuses.PREREPAID:
      case loanStatuses.PRELIQUIDATED:
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

      case loanStatuses.REPAID:
      case loanStatuses.LIQUIDATED:
        break;
      default:
        break;
    }
  }
  return <>{renderButton(loan)}</>;
}
