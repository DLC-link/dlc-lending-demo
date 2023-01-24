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
import { blockchains } from '../blockchainFunctions/walletConnectFunctions';
import { requestWalletConnectSessionAndAddress } from '../blockchainFunctions/walletConnectFunctions';
import { hiroAccountInformation, metamaskAccountInformation, walletConnectAccountInformation } from '../dtos';

export default function SelectWalletModal({ isOpen, closeModal, walletConnectClient }) {
  function dispatchAccountInformation(walletType, address, blockchain, walletConnectSession) {
    let accountInformation;
    switch (walletType) {
      case 'hiro':
        accountInformation = new hiroAccountInformation();
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

  async function requestAndDispatchHiroAccountInformation() {
    let isUserSessionStored = true;
    try {
      userSession.loadUserData();
    } catch (error) {
      isUserSessionStored = false;
    }

    if (isUserSessionStored) {
      dispatchAccountInformation('hiro');
    } else {
      showConnect({
        appDetails: {
          name: 'DLC.Link',
          icon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
        },
        onFinish: () => {
          dispatchAccountInformation('hiro');
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
            <Button
              width='100%'
              variant='outline'
              onClick={() => {
                requestAndDispatchHiroAccountInformation();
                closeModal();
              }}>
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
            </Button>
            <Menu>
              <MenuButton>
                <HStack
                  w='100%'
                  justifyContent='center'>
                  <Image
                    src='/xverse_logo.png'
                    alt='Xverse Wallet Logo'
                    width={85}
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
