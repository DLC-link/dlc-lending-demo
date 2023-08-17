/*global chrome*/

import { Flex, Text, VStack, TableContainer, Tbody, Table, Tr, Td, Spacer } from '@chakra-ui/react';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Status from '../Status';
import { ActionButtons } from '../ActionButtons';

import { selectLoanByUUID } from '../../store/loansSlice';
import {
  calculateCollateralCoveragePercentageForLiquidation,
  customShiftValue,
  loanDecimalShiftMap,
} from '../../utils';
import { easyTruncateAddress } from '../../utilities/formatFunctions';

export default function Card({ loanUUID }) {
  const { walletType } = useSelector((state) => state.account);
  const loan = useSelector((state) => selectLoanByUUID(state, loanUUID));
  const bitcoinValue = useSelector((state) => state.externalData.bitcoinValue);
  const [canBeLiquidated, setCanBeLiquidated] = useState(false);

  const cardInfo = [
    { label: 'UUID', value: loan.uuid && easyTruncateAddress(loan.uuid) },
    { label: 'Total Collateral', value: loan.formattedVaultCollateral },
    { label: 'Borrowed Amount', value: loan.formattedVaultLoan },
  ];

  useEffect(() => {
    if (loan) {
      const collateralCoveragePercentage = calculateCollateralCoveragePercentageForLiquidation(
        loan.vaultCollateral,
        bitcoinValue,
        loan.vaultLoan
      );
      const isLiquidable = collateralCoveragePercentage < 140;
      setCanBeLiquidated(isLiquidable);
    }
  }, [loan]);

  return (
    <>
      {loan && (
        <Flex
          margin='25px 15px'
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
                canBeLiquidated={canBeLiquidated}
              />
            </Flex>
            <TableContainer>
              <Table
                variant='unstyled'
                size='sm'>
                <Tbody>
                  {cardInfo.map((row, index) => (
                    <Tr key={index}>
                      <Td>
                        <Text variant='property'>{row.label}</Text>
                      </Td>
                      <Td>
                        <Text>{row.value}</Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Spacer />
            <ActionButtons
              loanUUID={loan.uuid}
              canBeLiquidated={canBeLiquidated}
            />
          </VStack>
        </Flex>
      )}
    </>
  );
}
