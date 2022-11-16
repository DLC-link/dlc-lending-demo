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
  Flex,
  Text,
  Image,
  Box,
  Table,
  Tr,
  Td,
  Center,
  Tbody,
  TableContainer
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { customShiftValue, fixedTwoDecimalShift, fixedTwoDecimalUnshift } from "../utils";
import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";
import { bufferCVFromString, callReadOnlyFunction,cvToValue, uintCV } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";

export default function DepositModal({ isOpen, closeModal }) {
  const [collateral, setCollateral] = useState();
  const [loan, setLoan] = useState();
  const [collateralToDebtRatio, setCollateralToDebtRatio] = useState();
  const [liquidationRatio, setLiquidationRatio] = useState(140);
  const [liquidationFee, setLiquidationFee] = useState(10);
  const [bitcoinInUSDAsString, setBitcoinInUSDAsString] = useState();
  const [bitcoinInUSDAsNumber, setBitcoinInUSDAsNumber] = useState();
  const [USD, setUSD] = useState(0);

  const network = new StacksMocknet({ url: "http://stx-btc1.dlc.link" });

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice();
    }
    fetchData();
    countUSD();
    countCollateralToDebtRatio();
  }, [collateral, loan])

  const handleCollateralChange = (collateral) => setCollateral(collateral.target.value);
  const handleLoanChange = (loan) => setLoan(loan.target.value);

  const isCollateralError = collateral < 0 || collateral == undefined;
  const isLoanError = loan < 1 || loan == undefined;
  const isCollateralToDebtRatioError = collateralToDebtRatio < 140;
  const isError = isLoanError || isCollateralError || isCollateralToDebtRatioError;

  const createLoanContract = () => {
    let loanContract = {
      vaultLoanAmount: fixedTwoDecimalUnshift(loan),
      BTCDeposit: customShiftValue(collateral, 8, false),
      liquidationRatio: fixedTwoDecimalUnshift(liquidationRatio),
      liquidationFee: fixedTwoDecimalUnshift(liquidationFee),
      emergencyRefundTime: 5
    }
    console.log("Contract:" + loanContract)
    return loanContract;
  };

  const sendLoanContract = async (loanContract, network) => {
    // console.log(network)
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      contractName: "sample-contract-loan-v0",
      functionName: "setup-loan",
      functionArgs: [
        uintCV(loanContract.vaultLoanAmount),
        uintCV(loanContract.BTCDeposit) ,
        uintCV(loanContract.liquidationRatio),
        uintCV(loanContract.liquidationFee),
        uintCV(loanContract.emergencyRefundTime)
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
        window
          .open(
            `http://localhost:8000/txid/${data.txId}?chain=mainnet`,
            "_blank"
          )
          .focus();
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    })
  }

  const createAndSendLoanContract = async () => {
    sendLoanContract(createLoanContract(), network);
  }

  const countCollateralToDebtRatio = () => {
    const collateralToDebtRatio = ((bitcoinInUSDAsNumber* collateral) / loan) * 100;
    setCollateralToDebtRatio(Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100)
  }

  const countUSD = () => {
    setUSD(new Intl.NumberFormat().format(bitcoinInUSDAsNumber * collateral));
  }

  const fetchBitcoinPrice = async () => {
    await fetch(
      "/.netlify/functions/get-bitcoin-price",
      {
        headers: { accept: "Accept: application/json" },
      })
      .then((x) => x.json())
      .then(({ msg }) => {
        const bitcoinValue = Number(msg.bpi.USD.rate.replace(/[^0-9.-]+/g, ""));
        setBitcoinInUSDAsNumber(bitcoinValue);
        setBitcoinInUSDAsString(new Intl.NumberFormat().format(bitcoinValue));
      });
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent borderColor="black" color="white" width="500px">
        <VStack>
          <ModalHeader
            bgGradient="linear(to-r, primary1, primary2)"
            bgClip="text">
            Request Loan
          </ModalHeader>
          <ModalCloseButton
            _focus={{
              boxShadow: "none"
            }}
          />
          <ModalBody paddingBottom="1.5rem">
            <FormControl isInvalid={isCollateralError} margin="15px" >
              <FormLabel
                margin="15px"
                bgGradient="linear(to-r, primary1, primary2)"
                bgClip="text">
                Collateral Amount
              </FormLabel>
              <HStack marginLeft="15px" spacing="15px" w="100%" >
                <NumberInput>
                  <NumberInputField
                    bgGradient="linear(to-r, primary1, primary2)"
                    bgClip="text"
                    value={collateral}
                    width="300px"
                    onChange={handleCollateralChange} />
                </NumberInput>
                <Image
                  src="/btc_logo.png"
                  alt="Bitcoin Logo"
                  width={25}
                  height={25}>
                </Image>
              </HStack>
              <Text
                fontSize="x-small"
                color="gray"
                marginLeft="15px">
                ${USD} at 1 BTC = ${bitcoinInUSDAsString}
              </Text>
              {!isCollateralError ? (
                <FormHelperText
                  fontSize="x-small"
                  marginLeft="15px">
                  Enter the amount of Bitcoin you would like to deposit.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  fontSize="x-small"
                  marginLeft="15px">
                  Enter a valid amount of BTC
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid={isLoanError} margin="15px">
              <FormLabel
                margin="15px"
                bgGradient="linear(to-r, primary1, primary2)"
                bgClip="text">Loan Amount
              </FormLabel>
              <HStack marginLeft="15px" spacing="15px" w="100%" >
                <NumberInput>
                  <NumberInputField
                    bgGradient="linear(to-r, primary1, primary2)"
                    bgClip="text"
                    value={loan}
                    width="300px"
                    onChange={handleLoanChange} />
                </NumberInput>
                <Image
                  src="/usdc_logo.png"
                  alt="USD Coin Logo"
                  width={25}
                  height={25}>
                </Image>
              </HStack>
              {!isLoanError ? (
                <FormHelperText
                  fontSize="x-small"
                  marginLeft="15px">
                  Enter the amount of USDC you would like to loan.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  fontSize="x-small"
                  marginLeft="15px">
                  Enter a valid amount of USDC
                </FormErrorMessage>
              )}
            </FormControl>
            <TableContainer margin="15px" width="350px">
              <Table >
                <Tbody>
                  <Tr>
                    <Td
                      fontSize="sm"
                      color="gray">
                      Collateral to debt ratio:
                    </Td>
                    {!isCollateralToDebtRatioError ? (
                      <Td
                        fontSize="sm"
                        color="green">
                        {collateralToDebtRatio}%
                      </Td>
                    ) : (
                      <Td
                        fontSize="sm"
                        color="red">
                        {collateralToDebtRatio}%
                      </Td>)}
                  </Tr>
                  <Tr>
                    <Td
                      fontSize="sm"
                      color="gray">
                      Liquidation ratio:
                    </Td>
                    <Td
                      fontSize="sm"
                      color="gray">
                      {liquidationRatio}%
                    </Td>
                  </Tr>
                  <Tr>
                    <Td
                      fontSize="sm"
                      color="gray">
                      Liquidation fee:
                    </Td>
                    <Td
                      fontSize="sm"
                      color="gray">
                      {liquidationFee}%
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
            <Flex justifyContent="center">
              <Button
                _hover={{
                  color: "white",
                  bg: "accent"
                }}
                isDisabled={isError}
                background="white"
                bgGradient="linear(to-r, primary1, primary2)"
                bgClip="text"
                width="150px"
                shadow="2xl"
                variant="outline"
                fontSize="sm"
                fontWeight="bold"
                type="submit" onClick={createAndSendLoanContract}>
                Request Loan
              </Button>
            </Flex>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal >
  );
}
