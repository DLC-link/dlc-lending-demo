/*global chrome*/

import { Flex, Text, VStack, TableContainer, Tbody, Table, Tr, Td, Spacer } from '@chakra-ui/react';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Status from '../Status';
import { ActionButtons } from '../ActionButtons';

import { selectLoanByUUID } from '../../store/loansSlice';
import { calculateCollateralCoveragePercentageForLiquidation, customShiftValue } from '../../utils';
import { easyTruncateAddress } from '../../utilities/formatFunctions';

export default function Card({ loanUUID }) {
  const loan = useSelector((state) => selectLoanByUUID(state, loanUUID));
  const bitcoinValue = useSelector((state) => state.externalData.bitcoinValue);
  const [canBeLiquidated, setCanBeLiquidated] = useState(false);

  useEffect(() => {
    const collateralCoveragePercentage = calculateCollateralCoveragePercentageForLiquidation(
      customShiftValue(loan.vaultCollateral, 8, true),
      bitcoinValue,
      loan.vaultLoan
    );
    const isLiquidable = collateralCoveragePercentage < 140;
    setCanBeLiquidated(isLiquidable);
  }, [loan]);

  return (
    <>
      {loan && (
        <Flex
          marginTop='25px'
          marginBottom='25px'
          marginLeft='15px'
          marginRight='15px'
          height='350px'
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
                    <Td>{loan.formattedUUID && <Text>{easyTruncateAddress(loan.formattedUUID)}</Text>}</Td>
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
            <Spacer></Spacer>
            <ActionButtons
              loanUUID={loan.uuid}
              canBeLiquidated={canBeLiquidated}></ActionButtons>
          </VStack>
        </Flex>
      )}
    </>
  );
}
