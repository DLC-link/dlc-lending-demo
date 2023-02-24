import React, { useEffect, useState } from 'react';
import eventBus from '../EventBus';
import {
  VStack,
  Button,
  Text,
  Flex,
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { customShiftValue, fixedTwoDecimalShift } from '../utils';

export default function DepositWithdraw({ isConnected, isLoading, walletType }) {
  const [depositAmount, setDepositAmount] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);

  useEffect(() => {
    eventBus.on('change-deposit-amount', (data) => setDepositAmount(customShiftValue(data.depositAmount, 8, true)));
    eventBus.on('change-loan-amount', (data) => {
      switch (walletType) {
        case 'hiro':
        case 'xverse':
        case 'walletconnect':
          setLoanAmount(customShiftValue(data.loanAmount, 6, true));
          break;
        case 'metamask':
          setLoanAmount(customShiftValue(data.loanAmount, 18, true));
          break;
        default:
          console.error('Unsupported wallet type!');
      }
    });
  }, []);

  const openDepositModal = () => {
    eventBus.dispatch('is-deposit-modal-open', { isDepositOpen: true });
  };

  return (
    <>
      <Collapse in={isConnected}>
        <Flex
          margin={25}
          alignContent='center'
          justifyContent='center'
          padding={25}>
          <VStack>
            <Text
              fontSize={[25, 50]}
              fontWeight='extrabold'
              color='white'>
              Balance
            </Text>
            <Flex
              bgGradient='linear(to-d, secondary1, secondary2)'
              borderRadius='lg'
              alignContent='center'
              justifyContent='center'
              width={[250, 'full']}
              padding='10px 10px'
              boxShadow='dark-lg'>
              <VStack>
                <TableContainer>
                  <Table
                    variant='simple'
                    color='white'>
                    <TableCaption fontSize={12}>Deposit Bitcoin</TableCaption>
                    <Thead>
                      <Tr>
                        <Th
                          fontSize={[8, 12]}
                          color='white'>
                          Asset
                        </Th>
                        <Th
                          fontSize={[8, 12]}
                          color='white'>
                          Deposit Balance
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>
                          <Image
                            src='/btc_logo.png'
                            alt='Bitcoin Logo'
                            width={25}
                            height={25}
                            borderRadius='3px'></Image>
                        </Td>
                        {isLoading ? (
                          <Td>
                            <IconButton
                              _hover={{
                                background: 'secondary1',
                              }}
                              isLoading
                              variant='outline'
                              color='white'
                              borderRadius='full'
                              width={[25, 35]}
                              height={[25, 35]}></IconButton>
                          </Td>
                        ) : (
                          <Td>{depositAmount}</Td>
                        )}
                      </Tr>
                    </Tbody>
                    <Thead>
                      <Tr>
                        <Th
                          fontSize={[8, 12]}
                          color='white'>
                          Asset
                        </Th>
                        <Th
                          fontSize={[8, 12]}
                          color='white'>
                          Loan Balance
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>
                          <Image
                            src='/usdc_logo.png'
                            alt='USDC Logo'
                            width={25}
                            height={25}
                            borderRadius='3px'></Image>
                        </Td>
                        {isLoading ? (
                          <Td>
                            <IconButton
                              _hover={{
                                background: 'secondary1',
                              }}
                              isLoading
                              variant='outline'
                              color='white'
                              borderRadius='full'
                              width={[25, 35]}
                              height={[25, 35]}></IconButton>
                          </Td>
                        ) : (
                          <Td>{loanAmount}</Td>
                        )}
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
                <Button
                  _hover={{
                    color: 'white',
                    bg: 'secondary1',
                  }}
                  color='accent'
                  width={100}
                  shadow='lg'
                  variant='outline'
                  fontSize='sm'
                  fontWeight='bold'
                  onClick={openDepositModal}>
                  SETUP VAULT
                </Button>
              </VStack>
            </Flex>
          </VStack>
        </Flex>
      </Collapse>
    </>
  );
}
