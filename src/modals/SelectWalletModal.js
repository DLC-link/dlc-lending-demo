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
import QRCodeModal from '@walletconnect/qrcode-modal';
import { stacksChains } from '../blockchainFunctions/xverseFunctions';

export default function SelectWalletModal({ isOpen, closeModal, walletConnectClient }) {

  async function requestXverseAccount(stacksChain) {
    const { uri, approval } = await walletConnectClient.connect({
      pairingTopic: undefined,
      requiredNamespaces: {
        stacks: {
          methods: ['stacks_callReadOnlyFunction', 'stacks_openContractCall'],
          chains: [stacksChain],
          events: [],
        },
      },
    });

    if (uri) {
      QRCodeModal.open(uri, () => {
        console.log('QR Code Modal closed');
      });
    }

    const xverseSession = await approval();

    QRCodeModal.close();

    eventBus.dispatch('is-account-connected', { isConnected: true });
    eventBus.dispatch('wallet-type', { walletType: 'xverse' });
    eventBus.dispatch('stacks-chain', { stacksChain: stacksChain });
    eventBus.dispatch('xverse-session', { xverseSession: xverseSession });
  }

  async function requestMetaMaskAccount() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Install MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      eventBus.dispatch('set-address', { address: accounts[0] });
      eventBus.dispatch('is-account-connected', { isConnected: true });
      eventBus.dispatch('wallet-type', { walletType: 'metamask' });
    } catch (error) {}
  }

  const sendHiroAccountEvents = () => {
    eventBus.dispatch('set-address', {
      address: userSession.loadUserData().profile.stxAddress.testnet,
    });
    eventBus.dispatch('is-account-connected', { isConnected: true });
    eventBus.dispatch('wallet-type', { walletType: 'hiro' });
  };

  async function requestHiroAccount() {
    let isUserSessionStored = true;
    try {
      userSession.loadUserData();
    } catch (error) {
      isUserSessionStored = false;
    }

    if (isUserSessionStored) {
      sendHiroAccountEvents();
    } else {
      showConnect({
        appDetails: {
          name: 'DLC.Link',
          icon: 'https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg',
        },
        onFinish: () => {
          sendHiroAccountEvents();
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
                requestMetaMaskAccount();
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
                requestHiroAccount();
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
                {stacksChains.map((stacksChain, idx) => {
                  return (
                    <MenuItem
                      key={`chain-${idx}`}
                      disabled={!walletConnectClient}
                      onClick={async () => {
                        await requestXverseAccount(stacksChain.id);
                        closeModal();
                      }}>
                      <Text variant='selector'>{stacksChain.name}</Text>
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
