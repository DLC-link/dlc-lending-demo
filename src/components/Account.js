import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Text, HStack, Image } from '@chakra-ui/react';
import { easyTruncateAddress } from '../utils';

export default function Account({ address, isConnected, walletType }) {
  const [walletLogo, setWalletLogo] = useState({ src: undefined, alt: undefined, boxSize: undefined });

  useEffect(() => {
    switch (walletType) {
      case 'hiro':
        setWalletLogo({ src: '/h_logo.png', alt: 'Hiro Wallet Logo', boxSize: [2, 4] });
        break;
      case 'walletconnect':
        setWalletLogo({ src: '/wc_logo.png', alt: 'Wallet Connect Logo', boxSize: [2, 4] });
        break;
      case 'metamask':
        setWalletLogo({ src: '/mm_logo.png', alt: 'Metamask Logo', boxSize: [3, 6] });
        break;
    }
  }, [walletType]);
  
  switch (isConnected) {
    case true:
      return (
        <HStack
          height={[25, 50]}
          width={[150, 350]}
          borderRadius='lg'
          shadow='dark-lg'
          alignItems='center'
          justifyContent='center'>
          <Image
            src={walletLogo.src}
            alt={walletLogo.alt}
            boxSize={walletLogo.boxSize}
          />
          <CheckCircleIcon
            boxSize={[2, 4]}
            color='secondary1'
          />
          <Text fontSize={[5, 15]}>Account:{easyTruncateAddress(address)}</Text>
        </HStack>
      );
    case false:
      return (
        <HStack
          height={[25, 50]}
          width={[150, 350]}
          borderRadius='lg'
          shadow='dark-lg'
          alignItems='center'
          justifyContent='center'>
          <WarningIcon
            boxSize={[1, 3]}
            color='primary2'
          />
          <Text fontSize={[5, 15]}>Account: Not connected</Text>
        </HStack>
      );
  }
}
