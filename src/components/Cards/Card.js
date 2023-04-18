/*global chrome*/

import {
  Flex,
  Text,
  VStack,
  TableContainer,
  Tbody,
  Table,
  Tr,
  Td,
  Image,
  Box,
  Spacer,
  CircularProgress,
} from '@chakra-ui/react';
import { easyTruncateAddress } from '../../utilities/formatFunctions';
import Status from '../Status';
import { ActionButtons } from '../ActionButtons';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectLoanByUUID } from '../../store/loansSlice';
import { useDispatch } from 'react-redux';
import { closeDepositModal, closeRepayModal } from '../../store/componentSlice';
import { countCollateralToDebtRatio } from '../../utils';
import { useState } from 'react';
import eventBus from '../../EventBus';

export default function Card({ loanUUID }) {
  const dispatch = useDispatch();
  const loan = useSelector((state) => selectLoanByUUID(state, loanUUID));
  const bitcoinValue = useSelector((state) => state.externalData.bitcoinValue);
  const [canBeLiquidated, setCanBeLiquidated] = useState(false);

  useEffect(() => {
    const temporaryCanBeLiquidated =
      countCollateralToDebtRatio(bitcoinValue, loan.vaultCollateral, loan.vaultLoan) < 140;
    setCanBeLiquidated(temporaryCanBeLiquidated);
  }, [loan]);

  useEffect(() => {
    eventBus.on('loan-event', (event) => {
      if (event.status === 'borrow-requested' || 'repay-requested') {
        dispatch(closeDepositModal());
        dispatch(closeRepayModal());
      }
    });
  });

  return (
    <>
      {loan && (
        <Flex
          marginTop='25px'
          marginBottom='25px'
          marginLeft='15px'
          marginRight='15px'
          height='300px'
          width='250px'
          borderRadius='lg'
          shadow='dark-lg'
          backgroundPosition='right'
          backgroundSize={'200%'}
          transition='background-position 500ms ease'
          bgGradient='linear(to-br, background1, transparent)'
          justifyContent='center'
          _hover={{
            backgroundPosition: 'left',
          }}>
          <VStack margin='15px'>
            <Flex>
              <Status
                status={loan.status}
                canBeLiquidated={canBeLiquidated}></Status>
            </Flex>
            <TableContainer>
              <Table
                variant='unstyled'
                size='sm'>
                <Tbody>
                  <Tr>
                    <Td>
                      <Text variant='property'>UUID</Text>
                    </Td>
                    <Td>
                      <Text>{easyTruncateAddress(loan.formattedUUID)}</Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <Text variant='property'>Total Collateral</Text>
                    </Td>
                    <Td>
                      <Text>{loan.formattedVaultCollateral}</Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <Text variant='property'>Borrowed Amount</Text>
                    </Td>
                    <Td>
                      <Text>{loan.formattedVaultLoan}</Text>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
            <ActionButtons
              loanUUID={loan.uuid}
              canBeLiquidated={canBeLiquidated}></ActionButtons>
          </VStack>
        </Flex>
      )}
    </>
  );
}
