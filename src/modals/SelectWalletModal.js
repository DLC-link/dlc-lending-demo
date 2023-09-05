import {
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
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
    { id: 'stacks:1', name: 'Mainnet' },
    { id: 'stacks:2147483648', name: 'Testnet' },
    { id: 'stacks:42', name: 'Mocknet' },
  ];

  const ethereumBlockchains = [
    { id: 'ethereum:11155111', name: 'Sepolia Testnet' },
    { id: 'ethereum:5', name: 'Goerli Testnet' },
    { id: 'ethereum:31337', name: 'Localhost' },
  ];

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
        width='300px'
        border='1px'
        bg='background2'
        color='accent'>
        <ModalHeader
          color='white'
          textAlign='center'>
          Select Wallet
        </ModalHeader>
        <ModalCloseButton
          _focus={{
            boxShadow: 'none',
          }}
        />
        <ModalBody padding='25px'>
          <VStack>
            {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    width='100%'
                    variant='outline'
                    animation={
                      showTutorial
                        ? `
                                ${glowAnimation} 5 1s
                            `
                        : ''
                    }>
                    <HStack
                      w='100%'
                      justifyContent='center'>
                      <Image
                        src='/metamask_logo.svg'
                        alt='Metamask Logo'
                        width={25}
                        height={25}
                      />
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Metamask'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {ethereumBlockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={() => {
                            requestAndDispatchMetaMaskAccountInformation(blockchain.id);
                            dispatch(toggleSelectWalletModalVisibility(false));
                          }}>
                          <Text variant='selector'>{blockchain.name}</Text>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </>
              )}
            </Menu>
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    width='100%'
                    variant='outline'
                    animation={
                      showTutorial
                        ? `
                                ${glowAnimation} 5 1s
                            `
                        : ''
                    }>
                    <HStack
                      w='100%'
                      justifyContent='center'>
                      <Image
                        src='/leather_logo.svg'
                        alt='Leather Logo'
                        width={25}
                        height={25}
                      />
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Leather'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {stacksBlockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          filter={blockchain.name === 'Mainnet' ? 'blur(1px)' : ''}
                          isDisabled={blockchain.name === 'Mainnet'}
                          onClick={async () => {
                            await requestAndDispatchStacksAccountInformation('leather', blockchain.id);
                            dispatch(toggleSelectWalletModalVisibility(false));
                          }}>
                          <Text variant='selector'>{blockchain.name}</Text>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </>
              )}
            </Menu>
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    filter={'blur(1px)'}
                    disabled={true}
                    width='100%'
                    variant='outline'
                    animation={
                      showTutorial
                        ? `
                                ${glowAnimation} 5 1s
                            `
                        : ''
                    }>
                    <HStack
                      w='100%'
                      justifyContent='center'>
                      <Image
                        src='/xverse_logo.png'
                        alt='Xverse Wallet Logo'
                        width={25}
                        height={25}
                      />
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Xverse Wallet'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {stacksBlockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={async () => {
                            await requestAndDispatchStacksAccountInformation('xverse', blockchain.id);
                            dispatch(toggleSelectWalletModalVisibility(false));
                          }}>
                          <Text variant='selector'>{blockchain.name}</Text>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </>
              )}
            </Menu>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
