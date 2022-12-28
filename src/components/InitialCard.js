import { Flex, Text, VStack, Button, TableContainer, Tbody, Table, Tr, Td } from '@chakra-ui/react';
import { easyTruncateAddress, customShiftValue, fixedTwoDecimalShift } from '../utils';
import Status from './Status';

export default function InitialCard(props) {
  const initialLoan = {
    formatttedLiquidationFee: fixedTwoDecimalShift(props.loan.liquidationFee) + ' %',
    formattedLiquidationRatio: fixedTwoDecimalShift(props.loan.liquidationRatio) + ' %',
    formattedVaultCollateral: customShiftValue(props.loan.BTCDeposit, 8, true) + ' BTC',
    formattedVaultLoan: '$ ' + fixedTwoDecimalShift(props.loan.vaultLoanAmount),
  };

  return (
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
          <Status status={'not-ready'}></Status>
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
                <Td></Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Owner</Text>
                </Td>
                <Td>
                  <Text>{easyTruncateAddress(props.creator)}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Vault Collateral</Text>
                </Td>
                <Td>
                  <Text>{initialLoan.formattedVaultCollateral}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Vault Loan</Text>
                </Td>
                <Td>
                  <Text>{initialLoan.formattedVaultLoan}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Liquidation Fee</Text>
                </Td>
                <Td>
                  <Text>{initialLoan.formattedLiquidationFee}</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text variant='property'>Liquidation Ratio</Text>
                </Td>
                <Td>
                  <Text>{initialLoan.formattedLiquidationRatio}</Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Flex>
          <Button
            _hover={{
              shadow: 'none',
            }}
            isLoading
            loadingText='PENDING'
            color='gray'
            variant='outline'></Button>
        </Flex>
      </VStack>
    </Flex>
  );
}
