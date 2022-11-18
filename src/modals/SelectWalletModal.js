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
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import eventBus from "../EventBus"
import { userSession } from "../hiroWalletUserSession";
import { showConnect } from "@stacks/connect";

export default function SelectWalletModal({ isOpen, closeModal }) {

  async function requestMetaMaskAccount() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Install MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })
      console.log("Connected", accounts[0]);
      eventBus.dispatch("change-address", { address: accounts[0] })
      eventBus.dispatch("account-connected", { isConnected: true })
      eventBus.dispatch("wallet-type", { walletType: "metamask" })
    } catch (error) {
      console.log(error);
    }
  }

  async function requestHiroAccount() {
    showConnect({
      appDetails: {
        name: "DLC.Link",
        icon: window.location.origin + "/dlc.link_logo.png",
      },
      onFinish: () => {
        eventBus.dispatch("change-address", { address: userSession.loadUserData().profile.stxAddress.testnet })
        console.log("am i here?")
        eventBus.dispatch("account-connected", { isConnected: true })
        eventBus.dispatch("wallet-type", { walletType: "hiro" })
        eventBus.remove("change-address");
        eventBus.remove("account-connected");
      },
      userSession,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent borderColor="black" color="white" w="300px">
        <ModalHeader
          bgGradient="linear(to-r, primary1, primary2)"
          bgClip="text">Select Wallet</ModalHeader>
        <ModalCloseButton
          _focus={{
            boxShadow: "none"
          }}
          bgGradient="linear(to-r, primary1, primary2)"
          borderRadius="md"
        />
        <ModalBody paddingBottom="1.5rem">
          <VStack >
            <Button
              _hover={{
                color: "white",
                bg: "accent"
              }}
              background="white"
              bgGradient="linear(to-r, primary1, primary2)"
              bgClip="text"
              width="100%"
              shadow="2xl"
              variant="outline"
              fontSize="sm"
              fontWeight="bold"
              onClick={() => {
                requestMetaMaskAccount();
                closeModal();
              }}
            >
              <HStack w="100%" justifyContent="center">
                <Image
                  src="/mm_logo.png"
                  alt="Metamask Logo"
                  width={25}
                  height={25}
                  borderRadius="3px"
                />
                <Text>Metamask</Text>
              </HStack>
            </Button>
            <Button
              _hover={{
                color: "white",
                bg: "accent"
              }}
              background="white"
              bgGradient="linear(to-r, primary1, primary2)"
              bgClip="text"
              width="100%"
              shadow="2xl"
              variant="outline"
              fontSize="sm"
              fontWeight="bold"
              onClick={() => {
                requestHiroAccount();
                closeModal();
              }}
            >
              <HStack w="100%" justifyContent="center">
                <Image
                  src="/h_logo.png"
                  alt="Hiro Wallet Logo"
                  width={27}
                  height={25}
                  borderRadius="3px"
                />
                <Text>Hiro Wallet</Text>
              </HStack>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal >
  );
}
