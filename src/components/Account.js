import { ChevronDownIcon, WarningIcon } from '@chakra-ui/icons';
import { HStack, Image, Menu, MenuButton, MenuItem, MenuList, Text, VStack, keyframes } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TutorialStep } from '../enums/TutorialSteps';
import { logout } from '../store/accountSlice';
import { toggleSelectWalletModalVisibility } from '../store/componentSlice';
import { easyTruncateAddress } from '../utilities/utils';
import TutorialBox from './TutorialBox';
import TutorialSwitch from './TutorialSwitch';
import { addAllTokensToMetamask } from '../blockchainFunctions/ethereumFunctions';

export default function Account() {
  const dispatch = useDispatch();

  const { walletType, address } = useSelector((state) => state.account);
  const { tutorialOn, tutorialStep } = useSelector((state) => state.tutorial);

  const [showTutorial, setShowTutorial] = useState(false);
  const [walletLogo, setWalletLogo] = useState(undefined);

  const walletLogos = {
    leather: { src: '/leather_logo.svg', alt: 'Leather Logo', boxSize: [5, 25] },
    xverse: { src: '/xverse_logo.png', alt: 'Xverse Logo', boxSize: [5, 15] },
    walletconnect: { src: '/wc_logo.png', alt: 'Wallet Connect Logo', boxSize: [5, 15] },
    metamask: { src: '/metamask_logo.svg', alt: 'Metamask Logo', boxSize: [5, 25] },
  };

  const glowAnimation = keyframes`
0% {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
}
50% {
    box-shadow: 0px 0px 100px rgba(7, 232, 216, 0.5);
}
100% {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
}
}
`;

  useEffect(() => {
    const isTutorialStepMatches = tutorialStep === TutorialStep.CONNECTWALLET;
    setShowTutorial(tutorialOn && isTutorialStepMatches);
  }, [tutorialOn, tutorialStep]);

  useEffect(() => {
    const currentWalletLogo = walletLogos[walletType];
    setWalletLogo(currentWalletLogo);
  }, [walletType, tutorialStep]);

  const handleClick = () => {
    dispatch(toggleSelectWalletModalVisibility(true));
  };

  const DisconnectMenu = () => {
    return (
      <Menu>
        <MenuButton
          height={50}
          width={150}
          padding={2.5}
          borderRadius={'lg'}
          shadow={'dark-lg'}
          animation={
            showTutorial
              ? `
                              ${glowAnimation} 5 1s
                          `
              : ''
          }>
          <HStack justifyContent={'space-between'}>
            {walletLogo && (
              <Image
                src={walletLogo.src}
                alt={walletLogo.alt}
                boxSize={walletLogo.boxSize}
              />
            )}
            <Text fontSize={14}>{easyTruncateAddress(address)}</Text>
            <ChevronDownIcon color={'white'} />
          </HStack>
        </MenuButton>
        <MenuList width={250}>
          <MenuItem onClick={() => addAllTokensToMetamask()}>Add tokens to MetaMask</MenuItem>
          <MenuItem onClick={() => dispatch(logout())}>Disconnect Wallet</MenuItem>
        </MenuList>
      </Menu>
    );
  };

  const ConnectMenu = () => {
    return (
      <Menu>
        <MenuButton
          height={50}
          width={150}
          padding={2.5}
          borderRadius={'lg'}
          shadow={'dark-lg'}
          onClick={() => handleClick()}
          animation={
            showTutorial
              ? `
                              ${glowAnimation} 5 1s
                          `
              : ''
          }>
          <HStack justifyContent={'space-between'}>
            <WarningIcon
              boxSize={15}
              color={'#FF4500'}
            />
            <Text
              fontSize={12}
              fontWeight={'extrabold'}>
              Connect Wallet
            </Text>
          </HStack>
        </MenuButton>
      </Menu>
    );
  };

  return (
    <VStack
      paddingTop={[1.5, 25]}
      paddingBottom={25}
      spacing={5}>
      <HStack>
        <TutorialSwitch tutorialStep={tutorialStep} />
        {address ? <DisconnectMenu /> : <ConnectMenu />}
      </HStack>
      {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
    </VStack>
  );
}
