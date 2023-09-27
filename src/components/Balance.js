import { Divider, HStack, Image, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTotalFundedCollateralAndLoan } from '../store/loansSlice';
import { fetchOutstandingDebt, fetchDlcBtcBalance } from '../store/externalDataSlice';

import { useEffect } from 'react';

export default function Balance() {
  const dispatch = useDispatch();

  const { fundedCollateralSum } = useSelector((state) => selectTotalFundedCollateralAndLoan(state));
  const outstandingDebt = useSelector((state) => state.externalData.outstandingDebt);
  const dlcBtcBalance = useSelector((state) => state.externalData.dlcBtcBalance);

  useEffect(() => {
    dispatch(fetchOutstandingDebt());
    dispatch(fetchDlcBtcBalance());
  }, [outstandingDebt, dlcBtcBalance, dispatch]);

  const BalanceContainer = ({ children }) => {
    return (
      <HStack
        padding={15}
        max-width={700}
        borderRadius={'lg'}
        shadow={'dark-lg'}
        justifyContent={'space-evenly'}>
        {children}
      </HStack>
    );
  };

  const BalanceTextStack = ({ header, data, image }) => {
    return (
      <VStack>
        <Text
          fontSize={'sm'}
          fontWeight={'bold'}
          color={'header'}>
          {header}
        </Text>
        <HStack>
          <Image
            src={image.src}
            alt={image.alt}
            boxSize={15}
          />
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
        data={fundedCollateralSum}
        image={{ src: '/btc_logo.png', alt: 'Bitcoin Logo' }}
      />
      <Divider
        orientation='vertical'
        height='50px'
      />
      <BalanceTextStack
        header={'Available dlcBTC'}
        data={dlcBtcBalance}
        image={{
          src: 'https://cdn.discordapp.com/attachments/994505799902691348/1035507437748367360/DLC.Link_Emoji.png',
          alt: 'dlcBTC Logo',
        }}
      />
      <Divider
        orientation='vertical'
        height='50px'
      />
      <BalanceTextStack
        header={'Total debt'}
        data={parseFloat(outstandingDebt).toFixed(2)}
        image={{ src: '/usdc_logo.png', alt: 'USDC Logo' }}
      />
    </BalanceContainer>
  );
}
