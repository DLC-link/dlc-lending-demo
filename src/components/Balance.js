import { Divider, Flex, HStack, IconButton, Image, Slide, Switch, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTotalFundedCollateralAndLoan, toggleShowHiddenLoans } from '../store/loansSlice';
import { fetchOutstandingDebt } from '../store/externalDataSlice';

import { useEffect, useState } from 'react';

export default function Balance() {
  const { fundedCollateralSum, fundedLoanSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));
  const outstandingDebt = useSelector((state) => state.externalData.outstandingDebt);

  const { showHiddenLoans } = useSelector((state) => state.loans);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOutstandingDebt());
  }, []);

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

  const FilterContainer = ({ children }) => {
    return (
      <HStack
        paddingLeft={2.5}
        paddingRight={2.5}
        height={25}
        width={162.5}
        justifyContent={'space-between'}>
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
    <VStack
      spacing={5}
      alignItems={'flex-end'}>
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
          data={new Intl.NumberFormat().format(outstandingDebt)}
        />
      </BalanceContainer>
      <FilterContainer>
        <Switch
          size='sm'
          isChecked={showHiddenLoans}
          onChange={() => dispatch(toggleShowHiddenLoans())}></Switch>
        <Text fontSize={'2xs'}>SHOW HIDDEN VAULTS</Text>
      </FilterContainer>
    </VStack>
  );
}
