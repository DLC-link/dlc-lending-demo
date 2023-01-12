/*global chrome*/

import { useEffect } from 'react';
import { Flex, Text, VStack, Button, TableContainer, Tbody, Table, Tr, Td } from '@chakra-ui/react';
import { easyTruncateAddress } from '../utils';
import { customShiftValue, fixedTwoDecimalShift } from '../utils';
import Status from './Status';
import eventBus from '../EventBus';
import { useState } from 'react';
import BorrowModal from '../modals/BorrowModal';
import RepayModal from '../modals/RepayModal';
import { liquidateStacksLoanContract, closeStacksLoanContract } from '../blockchainFunctions/stacksFunctions';
import { liquidateEthereumLoanContract } from '../blockchainFunctions/ethereumFunctions';

export default function Card(props) {
  const [isBorrowModalOpen, setBorrowModalOpen] = useState(false);
  const [isRepayModalOpen, setRepayModalOpen] = useState(false);

  useEffect(() => {
    eventBus.on('loan-event', (event) => {
      if (event.status === 'borrow-requested' || 'repay-requested') {
        onBorrowModalClose();
        onRepayModalClose();
      }
    });
  });

  const onBorrowModalClose = () => {
    setBorrowModalOpen(false);
  };

  const onRepayModalClose = () => {
    setRepayModalOpen(false);
  };

  const sendOfferForSigning = async (msg) => {
    console.log(msg);
    const extensionIDs = [
      'nminefocgojkadkocbddiddjmoooonhe',
      'gjjgfnpmfpealbpggmhfafcddjiopbpa',
      'kmidoigmjbbecngmenanflcogbjojlhf',
      'niinmdkjgghdkkmlilpngkccihjmefin',
      'bdadpbnmclplacnjpjoigpmbcinccnep'
    ];

    for (let i = 0; i < extensionIDs.length; i++) {
      chrome.runtime.sendMessage(
        extensionIDs[i],
        {
          action: 'get-offer',
          data: { offer: msg, counterparty_wallet_url: encodeURIComponent(process.env.REACT_APP_WALLET_DOMAIN) },
        },
        {},
        function () {
          if (chrome.runtime.lastError) {
            console.log('Failure: ' + chrome.runtime.lastError.message);
          } else {
            console.log('Success: Found receiving end.');
          }
        }
      );
    }
  };

  const liquidateLoanContract = async () => {
    switch (props.walletType) {
      case 'hiro':
        liquidateStacksLoanContract(props.creator, props.loan.raw.dlcUUID);
        break;
      case 'metamask':
        liquidateEthereumLoanContract(props.loan.raw.id);
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
  };

  const closeLoanContract = async () => {
    switch (props.walletType) {
      case 'hiro':
        closeStacksLoanContract(props.creator, props.loan.raw.dlcUUID);
        break;
      case 'metamask':
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
  };

  const lockBTC = async () => {
    const URL = process.env.REACT_APP_WALLET_DOMAIN + `/offer`;
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: props.loan.formatted.formattedUUID,
          acceptCollateral: parseInt(props.loan.raw.vaultCollateral),
          offerCollateral: 1000,
          totalOutcomes: 100,
        }),
      });
      const responseStream = await response.json();
      if (!response.ok) {
        console.error(responseStream.errors[0].message);
      }
      sendOfferForSigning(responseStream);
    } catch (error) {
      console.error(error);
    }
  };

  const countCollateralToDebtRatio = (bitCoinValue, vaultCollateral, loan) => {
    const formattedVaultCollateral = customShiftValue(vaultCollateral, 8, true);
    const formattedVaultLoan = customShiftValue(loan, 6, true);
    const collateralToDebtRatio = ((bitCoinValue * formattedVaultCollateral) / formattedVaultLoan) * 100;
    const roundedCollateralToDebtRatio = Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100;
    return roundedCollateralToDebtRatio;
  };

  return (
    <>
      <Flex
        bgGradient='linear(to-d, secondary1, secondary2)'
        borderRadius='lg'
        justifyContent='center'
        shadow='dark-lg'
        width={250}
        marginLeft={15}
        marginRight={15}
        marginTop={25}
        marginBottom={25}>
        <VStack margin={15}>
          <Flex>
            <Status status={props.loan.raw.status}></Status>
          </Flex>
          <TableContainer width={250}>
            <Table
              size='sm'
              variant='unstyled'>
              <Tbody>
                <Tr>
                  <Td>
                    <Text variant='property'>UUID</Text>
                  </Td>
                  <Td>
                    <Text>{easyTruncateAddress(props.loan.formatted.formattedUUID)}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Owner</Text>
                  </Td>
                  <Td>
                    <Text>{easyTruncateAddress(props.loan.raw.owner)}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Vault Collateral</Text>
                  </Td>
                  <Td>
                    <Text>{props.loan.formatted.formattedVaultCollateral}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Vault Loan</Text>
                  </Td>
                  <Td>
                    <Text>{props.loan.formatted.formattedVaultLoan}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Liquidation Fee</Text>
                  </Td>
                  <Td>
                    <Text>{props.loan.formatted.formattedLiquidationFee}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Liquidation Ratio</Text>
                  </Td>
                  <Td>
                    <Text>{props.loan.formatted.formattedLiquidationRatio}</Text>
                  </Td>
                </Tr>
                {props.loan.formatted.formattedClosingPrice && (
                  <Tr>
                    <Td>
                      <Text variant='property'>Closing Price</Text>
                    </Td>
                    <Td>
                      <Text>{props.loan.formatted.formattedClosingPrice}</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex>
            {props.loan.raw.status === 'ready' && (
              <VStack>
                <Button
                  variant='outline'
                  onClick={lockBTC}>
                  LOCK BTC
                </Button>
              </VStack>
            )}
            {props.loan.raw.status === ('not-ready' || 'pre-liquidated' || 'pre-paid') && (
              <Button
                _hover={{
                  shadow: 'none',
                }}
                isLoading
                loadingText='PENDING'
                color='gray'
                variant='outline'></Button>
            )}
            {props.loan.raw.status === 'funded' && (
              <VStack>
                <Button
                  variant='outline'
                  onClick={() => setBorrowModalOpen(true)}>
                  BORROW
                </Button>
                {props.loan.raw.vaultLoan > 0 ? (
                  <Button
                    variant='outline'
                    onClick={() => setRepayModalOpen(true)}>
                    REPAY LOAN
                  </Button>
                ) : (
                  <Button
                    variant='outline'
                    onClick={() => closeLoanContract()}>
                    CLOSE LOAN
                  </Button>
                )}
                {countCollateralToDebtRatio(
                  props.bitCoinValue,
                  props.loan.raw.vaultCollateral,
                  props.loan.raw.vaultLoan
                ) < 140 && (
                  <Button
                    variant='outline'
                    onClick={() => liquidateLoanContract()}>
                    LIQUIDATE
                  </Button>
                )}
              </VStack>
            )}
          </Flex>
        </VStack>
      </Flex>
      <BorrowModal
        isOpen={isBorrowModalOpen}
        closeModal={onBorrowModalClose}
        walletType={props.walletType}
        vaultLoanAmount={props.loan.raw.vaultLoan}
        BTCDeposit={props.loan.raw.vaultCollateral}
        uuid={props.loan.raw.dlcUUID}
        creator={props.creator}></BorrowModal>
      <RepayModal
        isOpen={isRepayModalOpen}
        closeModal={onRepayModalClose}
        walletType={props.walletType}
        vaultLoanAmount={props.loan.raw.vaultLoan}
        BTCDeposit={props.loan.raw.vaultCollateral}
        uuid={props.loan.raw.dlcUUID}
        creator={props.creator}></RepayModal>
    </>
  );
}
