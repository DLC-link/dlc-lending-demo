import {
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
  keyframes,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '../hooks/hooks';
import { requestAndDispatchMetaMaskAccountInformation } from '../blockchainFunctions/ethereumFunctions';
import { requestAndDispatchStacksAccountInformation } from '../blockchainFunctions/stacksFunctions';
import TutorialBox from '../components/TutorialBox';
import { TutorialStep } from '../enums/TutorialSteps';
import { toggleSelectWalletModalVisibility } from '../store/componentSlice';
import React from 'react';

export default function SelectWalletModal() {
  const dispatch = useDispatch();

  const isSelectWalletModalOpen = useSelector((state) => state.component.isSelectWalletModalOpen);
  const { tutorialOn, tutorialStep } = useSelector((state) => state.tutorial);

  const [showTutorial, setShowTutorial] = useState(false);

  type blockchainConfig = {
    id: string;
    name: string;
  };

  type chainConfig = {
    [key: string]: blockchainConfig;
  };

  type walletItem = { id: string; name: string; logo: string; blockchains: blockchainConfig[]; disabled: boolean };
  // Stacks
  const enabledStacksChains = process.env.REACT_APP_ENABLED_STACKS_CHAINS as string;
  const enabledStacksChainsList = enabledStacksChains.split(',');

  const stacksChainConfigs: chainConfig = {
    testnet: {
      id: 'stacks:2147483648',
      name: 'Testnet',
    },
    mocknet: {
      id: 'stacks:42',
      name: 'Mocknet',
    },
  };

  const stacksBlockchains = [...enabledStacksChainsList.map((chain) => stacksChainConfigs[chain])];

  const enabledEthChains = process.env.REACT_APP_ENABLED_ETHEREUM_CHAINS as string;
  const enabledEthChainsList = enabledEthChains.split(',');

  const ethereumChainConfigs: chainConfig = {
    sepolia: {
      id: 'ethereum:11155111',
      name: 'Sepolia',
    },
    goerli: {
      id: 'ethereum:5',
      name: 'Goerli',
    },
  };

  const ethereumBlockchains: blockchainConfig[] = [
    ...enabledEthChainsList.map((chain) => ethereumChainConfigs[chain]),
    { id: 'ethereum:31337', name: 'Hardhat' },
  ];

  const walletItems: walletItem[] = [
    {
      id: 'metamask',
      name: 'Metamask',
      logo: '/metamask_logo.svg',
      blockchains: ethereumBlockchains,
      disabled: enabledEthChains.length === 0,
    },
    {
      id: 'leather',
      name: 'Leather',
      logo: '/leather_logo.svg',
      blockchains: stacksBlockchains,
      disabled: enabledStacksChains.length === 0,
    },
    {
      id: 'xverse',
      name: 'Xverse',
      logo: '/xverse_logo.svg',
      blockchains: stacksBlockchains,
      disabled: enabledStacksChains.length === 0 || true, // NOTE: Xverse is disabled for now
    },
  ];

  const WalletMenu = ({ walletItem }: { key: string; walletItem: walletItem }) => {
    return (
      <Menu>
        {({ isOpen }) => (
          <>
            <MenuButton
              width={225}
              // variant={'outline'}
              disabled={walletItem.disabled}
              filter={walletItem.disabled ? 'blur(1px)' : ''}
              animation={
                showTutorial
                  ? `
                      ${glowAnimation} 5 1s
                  `
                  : ''
              }>
              <HStack>
                <Image
                  src={walletItem.logo}
                  alt={walletItem.name}
                  width={25}
                  height={25}
                />
                <Spacer />
                <Text variant='wallet'>{isOpen ? 'Choose Network' : walletItem.name}</Text>
              </HStack>
            </MenuButton>
            <MenuList width={225}>
              {!walletItem.disabled &&
                walletItem.blockchains.map((blockchain, idx) => {
                  return (
                    <MenuItem
                      justifyContent={'right'}
                      key={`chain-${idx}`}
                      onClick={() => {
                        switch (walletItem.id) {
                          case 'metamask':
                            requestAndDispatchMetaMaskAccountInformation(blockchain);
                            break;
                          case 'leather':
                            requestAndDispatchStacksAccountInformation(blockchain.id);
                            break;
                          case 'xverse':
                            break;
                          default:
                            break;
                        }
                        dispatch(toggleSelectWalletModalVisibility(false));
                      }}>
                      <Text variant='network'>{blockchain?.name}</Text>
                    </MenuItem>
                  );
                })}
            </MenuList>
          </>
        )}
      </Menu>
    );
  };

  useEffect(() => {
    const isTutorialStepMatches = tutorialStep === TutorialStep.SELECTNETWORK;
    setShowTutorial(tutorialOn && isTutorialStepMatches);
  }, [tutorialOn, tutorialStep]);

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

  return (
    <Modal
      isOpen={isSelectWalletModalOpen}
      onClose={() => dispatch(toggleSelectWalletModalVisibility(false))}
      isCentered>
      <ModalOverlay />
      <ModalContent
        width={250}
        background={'transparent'}>
        {showTutorial && <TutorialBox />}
        <VStack
          padding={25}
          spacing={5}
          background={'background2'}
          color={'accent'}
          border={'1px'}
          borderRadius={'lg'}>
          <Text variant={'header'}>Select Wallet</Text>
          {walletItems.map((walletItem, idx) => {
            return (
              <WalletMenu
                key={`wallet-${idx}`}
                walletItem={walletItem}
              />
            );
          })}
        </VStack>
      </ModalContent>
    </Modal>
  );
}
