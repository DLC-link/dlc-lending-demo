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
import { useDispatch, useSelector } from 'react-redux';
import { requestAndDispatchMetaMaskAccountInformation } from '../blockchainFunctions/ethereumFunctions';
import { requestAndDispatchStacksAccountInformation } from '../blockchainFunctions/stacksFunctions';
import TutorialBox from '../components/TutorialBox';
import { TutorialStep } from '../enums/TutorialSteps';
import { toggleSelectWalletModalVisibility } from '../store/componentSlice';

export default function SelectWalletModal() {
  const dispatch = useDispatch();

  const isSelectWalletModalOpen = useSelector((state) => state.component.isSelectWalletModalOpen);
  const { tutorialOn, tutorialStep } = useSelector((state) => state.tutorial);

  const [showTutorial, setShowTutorial] = useState(false);

  const stacksBlockchains = [
    { id: 'stacks:2147483648', name: 'Testnet' },
  ];

  const ethereumBlockchains = [
    { id: 'ethereum:11155111', name: 'Sepolia' },
  ];

  const walletItems = [
    {
      id: 'metamask',
      name: 'Metamask',
      logo: '/metamask_logo.svg',
      blockchains: ethereumBlockchains,
    },
    {
      id: 'leather',
      name: 'Leather',
      logo: '/leather_logo.svg',
      blockchains: stacksBlockchains,
    },
    {
      id: 'xverse',
      name: 'Xverse',
      logo: '/xverse_logo.svg',
      blockchains: stacksBlockchains,
    },
  ];

  const WalletMenu = ({ walletItem }) => {
    return (
      <Menu>
        {({ isOpen }) => (
          <>
            <MenuButton
              width={225}
              variant={'outline'}
              disabled={walletItem.id === 'xverse'}
              filter={walletItem.id === 'xverse' ? 'blur(1px)' : ''}
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
              {walletItem.blockchains.map((blockchain, idx) => {
                return (
                  <MenuItem
                    justifyContent={'right'}
                    key={`chain-${idx}`}
                    onClick={() => {
                      switch (walletItem.id) {
                        case 'metamask':
                          requestAndDispatchMetaMaskAccountInformation(blockchain.id);
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
                    <Text variant='network'>{blockchain.name}</Text>
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
        {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
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
