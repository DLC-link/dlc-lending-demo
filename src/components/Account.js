import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Text, HStack, Image, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { easyTruncateAddress } from '../utilities/utils';
import { useDispatch } from 'react-redux';
import { logout } from '../store/accountSlice';
import { useSelector } from 'react-redux';
import { toggleSelectWalletModalVisibility } from '../store/componentSlice';

export default function Account() {
  const [walletLogo, setWalletLogo] = useState(undefined);
  const address = useSelector((state) => state.account.address);
  const walletType = useSelector((state) => state.account.walletType);
  const dispatch = useDispatch();

  const walletLogos = {
    hiro: { src: '/h_logo.png', alt: 'Hiro Wallet Logo', boxSize: '15px' },
    xverse: { src: '/xverse_logo.png', alt: 'Xverse Wallet Logo', boxSize: '15px' },
    walletconnect: { src: '/wc_logo.png', alt: 'Wallet Connect Logo', boxSize: '15px' },
    metamask: { src: '/mm_logo.png', alt: 'Metamask Logo', boxSize: '15px' },
  };

  useEffect(() => {
    const currentWalletLogo = walletLogos[walletType];
    setWalletLogo(currentWalletLogo);
  }, [walletType]);

  return (
    <Menu>
      {address ? (
        <>
          <MenuButton
            margin='0px'
            height='50px'
            width='250px'
            borderRadius='lg'
            shadow='dark-lg'>
            <HStack>
              {walletLogo && (
                <Image
                  src={walletLogo.src}
                  alt={walletLogo.alt}
                  boxSize={walletLogo.boxSize}
                />
              )}
              <CheckCircleIcon
                boxSize='15px'
                color='secondary1'
              />
              <Text fontSize='15px'>Account:{easyTruncateAddress(address)}</Text>
            </HStack>
          </MenuButton>
          <MenuList
            width='250px'
            margin='0px'>
            <MenuItem onClick={() => dispatch(logout())}>Disconnect Wallet</MenuItem>
          </MenuList>
        </>
      ) : (
        <MenuButton
          height='50px'
          width='250px'
          borderRadius='lg'
          shadow='dark-lg'
          onClick={() => dispatch(toggleSelectWalletModalVisibility(true))}>
          <HStack>
            <WarningIcon
              boxSize='15px'
              color='secondary2'
            />
            <Text
              fontSize='15px'
              fontWeight='bold'>
              Connect Wallet
            </Text>
          </HStack>
        </MenuButton>
      )}
    </Menu>
  );
}
