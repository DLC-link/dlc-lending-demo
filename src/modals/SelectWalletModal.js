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
import { requestWalletConnectSessionAndAddress } from '../blockchainFunctions/walletConnectFunctions';
import { stacksAccountInformation, metamaskAccountInformation, walletConnectAccountInformation } from '../dtos';

export default function SelectWalletModal({ isOpen, closeModal, walletConnectClient }) {
  const blockchains = [
    { id: 'stacks:1', name: 'Mainnet' },
    { id: 'stacks:2147483648', name: 'Testnet' },
    { id: 'stacks:42', name: 'Mocknet' },
  ];

  function dispatchAccountInformation(walletType, address, blockchain, walletConnectSession) {
    let accountInformation;
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        accountInformation = new stacksAccountInformation(walletType, blockchain);
        break;
      case 'metamask':
        accountInformation = new metamaskAccountInformation(address);
        break;
      case 'walletconnect':
        accountInformation = new walletConnectAccountInformation(address, blockchain, walletConnectSession);
    }
    eventBus.dispatch('account-information', accountInformation);
  }

  async function requestAndDispatchWalletConnectAccountInformation(blockchain) {
    const { walletConnectSession, walletConnectAddress } = await requestWalletConnectSessionAndAddress(
      walletConnectClient,
      blockchain
    );
    dispatchAccountInformation('walletconnect', walletConnectAddress, blockchain, walletConnectSession);
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

  async function requestAndDispatchStacksAccountInformation(blockchain, walletType) {
    console.log(walletType);
    let isUserSessionStored = true;

    try {
      userSession.loadUserData();
    } catch (error) {
      isUserSessionStored = false;
    }

    if (isUserSessionStored) {
      dispatchAccountInformation(walletType, undefined, blockchain);
    } else {
      showConnect({
        appDetails: {
          name: 'DLC.Link',
          icon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
        },
        onFinish: () => {
          dispatchAccountInformation(walletType, undefined, blockchain);
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
                        await requestAndDispatchStacksAccountInformation(blockchain.id, 'hiro');
                        closeModal();
                      }}>
                      <Text variant='selector'>{blockchain.name}</Text>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                width='100%'
                variant='outline'>
                <HStack
                  w='100%'
                  justifyContent='center'>
                  <Image
                    src='/xverse_logo.png'
                    alt='Xverse Wallet Logo'
                    width={25}
                    height={25}
                  />
                  <Text variant='selector'>Xverse Wallet</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                {blockchains.map((blockchain, idx) => {
                  return (
                    <MenuItem
                      key={`chain-${idx}`}
                      onClick={async () => {
                        await requestAndDispatchStacksAccountInformation(blockchain.id, 'xverse');
                        closeModal();
                      }}>
                      <Text variant='selector'>{blockchain.name}</Text>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton>
                <HStack
                  w='100%'
                  justifyContent='center'>
                  <Image
                    src='/wc_logo.png'
                    alt='Wallet Connect Logo'
                    width={25}
                    height={25}
                  />
                  <Text variant='selector'>Wallet Connect</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                {blockchains.map((blockchain, idx) => {
                  return (
                    <MenuItem
                      key={`chain-${idx}`}
                      disabled={!walletConnectClient}
                      onClick={async () => {
                        await requestAndDispatchWalletConnectAccountInformation(blockchain.id);
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
