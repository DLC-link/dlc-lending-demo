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
import { requestAndDispatchWalletConnectAccountInformation } from '../blockchainFunctions/walletConnectFunctions';
import { requestAndDispatchHiroOrXverseAccountInformation } from '../blockchainFunctions/stacksFunctions';
import { requestAndDispatchMetaMaskAccountInformation } from '../blockchainFunctions/ethereumFunctions';

export default function SelectWalletModal({ isOpen, closeModal, walletConnectClient }) {
  const blockchains = [
    { id: 'stacks:1', name: 'Mainnet' },
    { id: 'stacks:2147483648', name: 'Testnet' },
    { id: 'stacks:42', name: 'Mocknet' },
  ];

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
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    width='100%'
                    variant='outline'>
                    <HStack
                      w='100%'
                      justifyContent='center'>
                      <Image
                        src='/mm_logo.png'
                        alt='Metamask Logo'
                        width={25}
                        height={25}
                      />
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Metamask'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {blockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={() => {
                            requestAndDispatchMetaMaskAccountInformation();
                            closeModal();
                          }}>
                          <Text variant='selector'>{blockchain.name}</Text>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </>
              )}
            </Menu>
            <Menu></Menu>
            <Menu>
              {({ isOpen }) => (
                <>
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
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Hiro Wallet'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {blockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={async () => {
                            await requestAndDispatchHiroOrXverseAccountInformation(blockchain.id, 'hiro');
                            closeModal();
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
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Xverse Wallet'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {blockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={async () => {
                            await requestAndDispatchHiroOrXverseAccountInformation(blockchain.id, 'xverse');
                            closeModal();
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
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Wallet Connect'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {blockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          disabled={!walletConnectClient}
                          onClick={async () => {
                            await requestAndDispatchWalletConnectAccountInformation(walletConnectClient, blockchain.id);
                            closeModal();
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
