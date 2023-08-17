import React from 'react';
import { Text, Collapse, Image, VStack } from '@chakra-ui/react';

export default function Header() {
  return (
    <VStack
      marginTop={215}
      justifyContent='center'>
      <Image
        width={1250}
        src='/BTC_Graphic_2.png'
        position='absolute'
        blendMode='screen'
      />
      <Text
        fontSize={[25, 50]}
        fontWeight='semibold'
        color='accent'
        height={[25, 50]}>
        Use Native Bitcoin
      </Text>
      <Text
        fontWeight='normal'
        fontSize={[25, 50]}
        color='white'>
        without wrapping
      </Text>
    </VStack>
  );
}
