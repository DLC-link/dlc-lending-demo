import {
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  MenuButton,
  MenuItem,
  MenuList,
  Menu,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import eventBus from '../EventBus';
import { userSession } from '../hiroWalletUserSession';
import { showConnect } from '@stacks/connect';
import { createAccountInformation} from '../factoryFunctions';

export default function SelectWalletModal({ isOpen, closeModal }) {
  const blockchains = [
    { id: 'stacks:1', name: 'Mainnet' },
    { id: 'stacks:2147483648', name: 'Testnet' },
    { id: 'stacks:42', name: 'Mocknet' },
  ];

  function dispatchAccountInformation(walletType, address, blockchain, walletConnectSession) {
    let accountInformation;
    switch (walletType) {
      case 'hiro':
        accountInformation = createAccountInformation('hiro', blockchain)
        break;
      case 'metamask':
        accountInformation = createAccountInformation('metamask',  blockchain, address)
        break;
      case 'walletconnect':
        accountInformation = createAccountInformation('walletconnect', blockchain, address, walletConnectSession)
        break;
    }
    eventBus.dispatch('account-information', accountInformation);
  }

  async function requestAndDispatchMetaMaskAccountInformation() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Install MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const metaMaskAddress = accounts[0];
      dispatchAccountInformation('metamask', metaMaskAddress);
    } catch (error) {}
  }

  async function requestAndDispatchHiroAccountInformation(blockchain) {
    let isUserSessionStored = true;
    try {
      userSession.loadUserData();
    } catch (error) {
      isUserSessionStored = false;
    }

    if (isUserSessionStored) {
      dispatchAccountInformation('hiro', undefined, blockchain);
    } else {
      showConnect({
        appDetails: {
          name: 'DLC.Link',
          icon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
        },
        onFinish: () => {
          dispatchAccountInformation('hiro', undefined, blockchain);
        },
        userSession,
      });
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isCentered>
      <ModalOverlay />
      <ModalContent w='300px'>
        <ModalHeader
          bgGradient='linear(to-r, primary1, primary2)'
          bgClip='text'>
          Select Wallet
        </ModalHeader>
        <ModalCloseButton
          color='white'
          _focus={{
            boxShadow: 'none',
          }}
          bgGradient='linear(to-r, primary1, primary2)'
        />
        <ModalBody padding='25px'>
          <VStack>
            <Button
              isDisabled
              variant='outline'
              width='100%'
              onClick={() => {
                requestAndDispatchMetaMaskAccountInformation();
                closeModal();
              }}>
              <HStack
                w='100%'
                justifyContent='center'>
                <Image
                  src='/mm_logo.png'
                  alt='Metamask Logo'
                  width={25}
                  height={25}
                />
                <Text variant='selector'>Metamask</Text>
              </HStack>
            </Button>
            <Menu>
              <MenuButton
                width='100%'
                variant='outline'>
                <HStack
                  w='100%'
                  justifyContent='center'>
                  <Image
                    src='/h_logo.png'
                    alt='Hiro Wallet Logo'
                    width={27}
                    height={25}
                  />
                  <Text variant='selector'>Hiro Wallet</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                {blockchains.map((blockchain, idx) => {
                  return (
                    <MenuItem
                      key={`chain-${idx}`}
                      onClick={async () => {
                        await requestAndDispatchHiroAccountInformation(blockchain.id);
                        closeModal();
                      }}>
                      <Text variant='selector'>{blockchain.name}</Text>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
