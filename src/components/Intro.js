import React from 'react';
import { Text, Collapse, Image, VStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

export default function Header() {
  const address = useSelector((state) => state.account.address);

  return (
    <Collapse in={!address}>
      <VStack
        marginTop={215}
        justifyContent='center'>
        <Image
          width={1250}
          src='/BTC_Graphic_2.png'
          position='absolute'
          blendMode='screen'
          zIndex={-1}
        />
        <Text
          fontSize={[25, 50]}
          fontWeight='semibold'
          color='accent'
          height={[25, 50]}>
          Use Native Bitcoin
        </Text>
        <Text
          fontSize={[25, 50]}
          fontWeight='normal'
          color='white'>
          without wrapping
        </Text>
      </VStack>
    </Collapse>
  );
}
