import React from 'react';
import { Text, HStack, Flex, Spacer } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { customShiftValue } from '../utilities/formatFunctions';
import { selectTotalFundedCollateralAndLoan } from '../store/loansSlice';
import { loanDecimalShiftMap } from '../utils';

export default function Balance() {
  const { fundedCollateralSum, fundedLoanSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));
  const { walletType } = useSelector((state) => state.account);

  let shiftValue = loanDecimalShiftMap[walletType];

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
            <Text>{customShiftValue(fundedCollateralSum, 8, true) + ' BTC'}</Text>
            <Spacer width={'15px'} />
            <Text
              fontSize='small'
              fontWeight='extrabold'
              color='accent'>
              Borrowed USDC amount:{' '}
            </Text>
            <Text>{customShiftValue(fundedLoanSum, shiftValue, true) + ' USDC'}</Text>
          </HStack>
        </Flex>
      </>
    </>
  );
}
