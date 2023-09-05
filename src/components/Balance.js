import React from 'react';
import { Text, HStack, VStack, Divider, Image } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { selectTotalFundedCollateralAndLoan } from '../store/loansSlice';

export default function Balance() {
  const { fundedCollateralSum, fundedLoanSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));

  const BalanceContainer = ({ children }) => {
    return (
      <HStack
        padding={15}
        width={325}
        borderRadius={'lg'}
        shadow={'dark-lg'}
        justifyContent={'space-evenly'}>
        {children}
      </HStack>
    );
  };

  const BalanceTextStack = ({ header, data }) => {
    return (
      <VStack width={125}>
        <Text
          fontSize={'sm'}
          fontWeight={'bold'}
          color={'header'}>
          {header}
        </Text>
        <HStack>
          {header === 'BTC Collateral' ? (
            <Image
              src='/btc_logo.png'
              alt='Bitcoin Logo'
              boxSize={15}
            />
          ) : (
            <Image
              src='/usdc_logo.png'
              alt='USDC Logo'
              boxSize={15}
            />
          )}
          <Text
            fontSize={'md'}
            fontWeight={'extrabold'}
            color={'white'}>
            {data}
          </Text>
        </HStack>
      </VStack>
    );
  };

  return (
    <BalanceContainer>
      <BalanceTextStack
        header={'BTC Collateral'}
        data={fundedCollateralSum.toFixed(4)}
      />
      <Divider
        orientation='vertical'
        height='50px'
      />
      <BalanceTextStack
        header={'USDC Debt'}
        data={fundedLoanSum}
      />
    </BalanceContainer>
  );
}
