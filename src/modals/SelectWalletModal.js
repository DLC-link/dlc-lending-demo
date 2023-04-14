import {
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  MenuButton,
  MenuItem,
  MenuList,
  Menu,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import { requestAndDispatchMetaMaskAccountInformation } from '../blockchainFunctions/ethereumFunctions';
import { requestAndDispatchStacksAccountInformation } from '../blockchainFunctions/stacksFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { closeSelectWalletModal } from '../store/componentSlice';

export default function SelectWalletModal() {
  const isSelectWalletModalOpen = useSelector((state) => state.component.isSelectWalletModalOpen);
  const dispatch = useDispatch();

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

  return (
    <Modal
      isOpen={isSelectWalletModalOpen}
      onClose={() => dispatch(closeSelectWalletModal())}
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
                    {ethereumBlockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={() => {
                            requestAndDispatchMetaMaskAccountInformation(blockchain.id);
                            dispatch(closeSelectWalletModal());
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
                        src='/h_logo.png'
                        alt='Hiro Wallet Logo'
                        width={27}
                        height={25}
                      />
                      <Text variant='selector'>{isOpen ? 'Choose Network' : 'Hiro Wallet'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    {stacksBlockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={async () => {
                            await requestAndDispatchStacksAccountInformation('hiro', blockchain.id);
                            dispatch(closeSelectWalletModal());
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
                    {stacksBlockchains.map((blockchain, idx) => {
                      return (
                        <MenuItem
                          key={`chain-${idx}`}
                          onClick={async () => {
                            await requestAndDispatchStacksAccountInformation('xverse', blockchain.id);
                            dispatch(closeSelectWalletModal());
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
