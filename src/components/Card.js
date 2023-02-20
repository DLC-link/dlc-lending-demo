/*global chrome*/

import { useEffect } from 'react';
import { Flex, Text, VStack, Button, TableContainer, Tbody, Table, Tr, Td } from '@chakra-ui/react';
import { easyTruncateAddress } from '../utils';
import { customShiftValue } from '../utils';
import Status from './Status';
import eventBus from '../EventBus';
import { useState } from 'react';
import BorrowModal from '../modals/BorrowModal';
import RepayModal from '../modals/RepayModal';
import { liquidateStacksLoanContract, closeStacksLoanContract } from '../blockchainFunctions/stacksFunctions';
import { closeEthereumLoan, liquidateEthereumLoan } from '../blockchainFunctions/ethereumFunctions';
import { lockBTC } from '../blockchainFunctions/bitcoinFunctions';
import { ActionButtons } from './ActionButtons';

export default function Card({ loan, creator, walletType, blockchain, bitCoinValue, status }) {
  const [isBorrowModalOpen, setBorrowModalOpen] = useState(false);
  const [isRepayModalOpen, setRepayModalOpen] = useState(false);
  const [action, setAction] = useState(undefined);

  useEffect(() => {
    eventBus.on('loan-event', (event) => {
      if (event.status === 'borrow-requested' || 'repay-requested') {
        onBorrowModalClose();
        onRepayModalClose();
      }
    });
  });

  const onBorrowModalOpen = () => {
    setBorrowModalOpen(true);
  };

  const onBorrowModalClose = () => {
    setBorrowModalOpen(false);
  };

  const onRepayModalOpen = () => {
    setRepayModalOpen(true);
  };

  const onRepayModalClose = () => {
    setRepayModalOpen(false);
  };

  useEffect(() => {
    console.log(status);
    switch (status) {
      case 2:
        setAction('lockLoan');
        break;
      case 3:
        setAction('fundedLoan');
        break;
      case 1:
      case 4:
      case 5:
      case 7:
        setAction('pendingLoan');
        break;
      case 6:
        setAction('closedLoan');
    }
  }, [loan, status]);

  const liquidateLoanContract = async () => {
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        liquidateStacksLoanContract(creator, loan.raw.dlcUUID, blockchain, walletType);
        break;
      case 'metamask':
        liquidateEthereumLoan(loan.raw.id, blockchain);
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
  };

  const closeLoanContract = async () => {
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        closeStacksLoanContract(creator, loan.raw.dlcUUID, blockchain, walletType);
        break;
      case 'metamask':
        closeEthereumLoan(loan.raw.uuid, blockchain);
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
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
            <Status status={loan.raw.status}></Status>
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
                    <Text>{easyTruncateAddress(loan.formatted.uuid)}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Owner</Text>
                  </Td>
                  <Td>
                    <Text>{easyTruncateAddress(loan.raw.owner)}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Vault Collateral</Text>
                  </Td>
                  <Td>
                    <Text>{loan.formatted.vaultCollateral}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Vault Loan</Text>
                  </Td>
                  <Td>
                    <Text>{loan.formatted.vaultLoan}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Liquidation Fee</Text>
                  </Td>
                  <Td>
                    <Text>{loan.formatted.liquidationFee}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Text variant='property'>Liquidation Ratio</Text>
                  </Td>
                  <Td>
                    <Text>{loan.formatted.liquidationRatio}</Text>
                  </Td>
                </Tr>
                {loan.formatted.closingPrice && (
                  <Tr>
                    <Td>
                      <Text variant='property'>Closing Price</Text>
                    </Td>
                    <Td>
                      <Text>{loan.formatted.closingPrice}</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
          <ActionButtons
            loan={loan}
            action={action}
            onBorrowModalOpen={onBorrowModalOpen}
            onRepayModalOpen={onRepayModalOpen}
            closeLoanContract={closeLoanContract}
            liquidateLoanContract={liquidateLoanContract}
            bitCoinValue={bitCoinValue}></ActionButtons>
        </VStack>
      </Flex>
      <BorrowModal
        isOpen={isBorrowModalOpen}
        closeModal={onBorrowModalClose}
        walletType={walletType}
        vaultLoanAmount={loan.raw.vaultLoan}
        BTCDeposit={loan.raw.vaultCollateral}
        uuid={loan.formatted.uuid}
        creator={creator}
        blockchain={blockchain}></BorrowModal>
      <RepayModal
        isOpen={isRepayModalOpen}
        closeModal={onRepayModalClose}
        walletType={walletType}
        vaultLoanAmount={loan.raw.vaultLoan}
        BTCDeposit={loan.raw.vaultCollateral}
        uuid={loan.formatted.uuid}
        creator={creator}
        blockchain={blockchain}></RepayModal>
    </>
  );
}
