import React from 'react';
import { Text, HStack, Flex, Spacer } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { customShiftValue } from '../utilities/formatFunctions';
import { selectTotalFundedCollateralAndLoan } from '../store/loansSlice';

export default function Balance() {
  const { fundedCollateralSum, fundedLoanSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));
  return (
    <>
      <>
        <Flex
          padding='15px'
          height='auto'
          width='350px'
          border='1px'
          borderRadius='lg'
          borderColor='white'
          shadow='dark-lg'>
          <HStack justifyContent={'space-between'}>
            <Text
              fontSize='small'
              fontWeight='extrabold'
              color='accent'>
              Total Redeemable:{' '}
            </Text>
            <Text>{fundedCollateralSum + ' BTC'}</Text>
            <Spacer width={'15px'}></Spacer>
            <Text
              fontSize='small'
              fontWeight='extrabold'
              color='accent'>
              Borrowed USDC amount:{' '}
            </Text>
            <Text>{fundedLoanSum + ' USDC'}</Text>
          </HStack>
        </Flex>
      </>
    </>
  );
}
