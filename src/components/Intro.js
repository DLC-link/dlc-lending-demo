import React from 'react';
import { Text, Collapse, Image, VStack } from '@chakra-ui/react';

export default function Header(props) {
  const isConnected = props.isConnected;

  return (
    <Collapse in={!isConnected}>
      <VStack
        justifyContent='center'
        alignItems='center'
        marginTop={215}>
        <Image
          width={917.4}
          src='/BTC_Graphic_2.png'
          position='absolute'
          blendMode='screen'></Image>
        <Text
          fontSize={[25, 50]}
          fontWeight='semibold'
          color='accent'
          height={50}>
          Use Native Bitcoin
        </Text>
        <Text
          fontWeight='normal'
          fontSize={[25, 50]}
          color='white'>
          without wrapping
        </Text>
      </VStack>
    </Collapse>
  );
}
