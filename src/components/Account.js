import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Text, HStack, Image } from '@chakra-ui/react';
import { easyTruncateAddress } from '../utils';

export default function Account({ address, isConnected, walletType }) {
  const [walletLogo, setWalletLogo] = useState(undefined);

  const walletLogos = {
    hiro: { src: '/h_logo.png', alt: 'Hiro Wallet Logo', boxSize: [2, 4] },
    xverse: { src: '/xverse_logo.png', alt: 'Xverse Wallet Logo', boxSize: [2, 4] },
    walletconnect: { src: '/wc_logo.png', alt: 'Wallet Connect Logo', boxSize: [2, 4] },
    metamask: { src: '/mm_logo.png', alt: 'Metamask Logo', boxSize: [3, 6] },
  };

  useEffect(() => {
    const currentWalletLogo = walletLogos[walletType];
    setWalletLogo(currentWalletLogo);
  }, [walletType]);

  return (
    <HStack
      height={[25, 50]}
      width={[150, 350]}
      borderRadius='lg'
      shadow='dark-lg'
      alignItems='center'
      justifyContent='center'>
      {walletLogo ? (
        <>
          <Image
            src={walletLogo.src}
            alt={walletLogo.alt}
            boxSize={walletLogo.boxSize}
          />
          <CheckCircleIcon
            boxSize={[2, 4]}
            color='secondary1'
          />
        </>
      ) : (
        <WarningIcon
          boxSize={[1, 3]}
          color='primary2'
        />
      )}
      {isConnected ? (
        <Text fontSize={[5, 15]}>Account:{easyTruncateAddress(address)}</Text>
      ) : (
        <Text fontSize={[5, 15]}>Account: Not connected</Text>
      )}
    </HStack>
  );
}
