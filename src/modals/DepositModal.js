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
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  Flex
} from "@chakra-ui/react";
import { useState } from "react";
import eventBus from "../EventBus";

export default function DepositModal({ isOpen, closeModal }) {
  const [deposit, setDeposit] = useState(1);

  const handleDepositChange = (deposit) => setDeposit(deposit.target.value);

  const isError = deposit < 1;

  const depositAmount = () => {
    eventBus.dispatch("change-deposit", { deposit: deposit });
    closeModal();
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent borderColor="black" color="white" width="500px">
        <VStack alignItems="center" justifyContent="center" >
          <ModalHeader
            bgGradient="linear(to-r, primary1, primary2)"
            bgClip="text">Deposit Bitcoin</ModalHeader>
          <ModalCloseButton
            _focus={{
              boxShadow: "none"
            }}
          />
          <ModalBody paddingBottom="1.5rem">
            <FormControl isInvalid={isError}>
              <FormLabel
                px="40px"
                margin="15px"
                bgGradient="linear(to-r, primary1, primary2)"
                bgClip="text">Bitcoin Amount
              </FormLabel>
              <HStack margin="15px" spacing="35px" w="100%" justifyContent="center">
                <NumberInput max="50" min="1">
                  <NumberInputField
                    bgGradient="linear(to-r, primary1, primary2)"
                    bgClip="text"
                    value={deposit}
                    onChange={handleDepositChange} />
                </NumberInput>
                <Button
                  _hover={{
                    color: "white",
                    bg: "accent"
                  }}
                  background="white"
                  bgGradient="linear(to-r, primary1, primary2)"
                  bgClip="text"
                  width="75px"
                  shadow="2xl"
                  variant="outline"
                  fontSize="sm"
                  fontWeight="bold"
                  type="submit" onClick={depositAmount}>Deposit</Button>
              </HStack>
              {!isError ? (
                <FormHelperText
                  px="40px"
                  margin="15px">
                  Enter the amount of Bitcoin you would like to deposit.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  px="40px"
                  margin="15px">Enter the amount of Bitcoin you would like to deposit.
                </FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
