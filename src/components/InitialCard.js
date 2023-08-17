import { Flex, Text, VStack, Button, TableContainer, Tbody, Table, Tr, Td } from '@chakra-ui/react';
import { easyTruncateAddress, customShiftValue, fixedTwoDecimalShift } from '../utils';
import Status from './Status';

export default function InitialCard(props) {
  const initialCardInfo = [
    { label: 'UUID', value: '' },
    { label: 'Total Collateral', value: `${customShiftValue(props.loan.BTCDeposit, 8, true)} BTC` },
    { label: 'Borrowed Amount', value: `$ ${fixedTwoDecimalShift(props.loan.vaultLoanAmount)}` },
  ];

  return (
    <Flex
      bgGradient='linear(to-d, secondary1, secondary2)'
      borderRadius='lg'
      justifyContent='center'
      shadow='dark-lg'
      width='250px'
      margin='25px 15px'>
      <VStack margin='15px'>
        <Flex>
          <Status status={'not-ready'} />
        </Flex>
        <TableContainer width='250px'>
          <Table
            variant='unstyled'
            size='sm'>
            <Tbody>
              {initialCardInfo.map((row, index) => (
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
