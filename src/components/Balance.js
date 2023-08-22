import React from 'react';
import { Text, HStack, VStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { selectTotalFundedCollateralAndLoan } from '../store/loansSlice';

export default function Balance() {
  const { fundedCollateralSum, fundedLoanSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));

  const BalanceContainer = ({ children }) => {
    return (
      <HStack
        padding={15}
        width={275}
        border={'1px solid white'}
        borderRadius={'lg'}
        shadow={'dark-lg'}
        justifyContent={'space-between'}>
        {children}
      </HStack>
    );
  };

  const BalanceTextStack = ({ header, data }) => {
    return (
      <VStack width={125}>
        <Text
          fontSize='small'
          fontWeight='extrabold'
          color='accent'>
          {header}
        </Text>
        <Text>{data}</Text>
      </VStack>
    );
  };

  return (
    <BalanceContainer>
      <BalanceTextStack
        header={'BTC Collateral'}
        data={fundedCollateralSum.toFixed(4) + ' BTC'}
      />
      <BalanceTextStack
        header={'USDC Debt'}
        data={fundedLoanSum + ' USDC'}
      />
    </BalanceContainer>
  );
}
