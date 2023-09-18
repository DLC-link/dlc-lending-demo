import { Divider, Flex, HStack, IconButton, Image, Slide, Switch, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTotalFundedCollateralAndLoan, toggleShowHiddenLoans } from '../store/loansSlice';
import { fetchOutstandingDebt } from '../store/externalDataSlice';

import { useEffect } from 'react';

export default function Balance() {
  const dispatch = useDispatch();

  const { fundedCollateralSum, fundedLoanSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));
  const outstandingDebt = useSelector((state) => state.externalData.outstandingDebt);

  useEffect(() => {
    dispatch(fetchOutstandingDebt());
  }, [outstandingDebt, dispatch]);

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
      <VStack width={150}>
        <Text
          fontSize={'sm'}
          fontWeight={'bold'}
          color={'header'}>
          {header}
        </Text>
        <HStack>
          {header === 'BTC Locked In DLCs' ? (
            <Image
              src='/btc_logo.png'
              alt='Bitcoin Logo'
              boxSize={15}
            />
          ) : (
            <Image
              src='https://cdn.discordapp.com/attachments/994505799902691348/1035507437748367360/DLC.Link_Emoji.png'
              alt='dlcBTC Logo'
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
        header={'BTC Locked In DLCs'}
        data={fundedCollateralSum.toFixed(4)}
      />
      <Divider
        orientation='vertical'
        height='50px'
      />
      <BalanceTextStack
        header={'Available dlcBTC'}
        data={new Intl.NumberFormat().format(outstandingDebt)}
      />
    </BalanceContainer>
  );
}
