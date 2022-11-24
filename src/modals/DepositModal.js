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
  Table,
  Tr,
  Td,
  Tbody,
  TableContainer,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { customShiftValue, fixedTwoDecimalUnshift } from "../utils";
import { StacksMocknet } from "@stacks/network";
import { uintCV } from "@stacks/transactions";
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

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice();
    }
    fetchData();
    countUSD();
    countCollateralToDebtRatio();
  }, [collateral, loan]);

  const handleCollateralChange = (collateral) =>
    setCollateral(collateral.target.value);
  const handleLoanChange = (loan) => setLoan(loan.target.value);

  const isCollateralError = collateral < 0 || collateral == undefined;
  const isLoanError = loan < 1 || loan == undefined;
  const isCollateralToDebtRatioError = collateralToDebtRatio < 140;
  const isError =
    isLoanError || isCollateralError || isCollateralToDebtRatioError;

  const createLoanContract = () => {
    let loanContract = {
      vaultLoanAmount: fixedTwoDecimalUnshift(loan),
      BTCDeposit: customShiftValue(collateral, 8, false),
      liquidationRatio: fixedTwoDecimalUnshift(liquidationRatio),
      liquidationFee: fixedTwoDecimalUnshift(liquidationFee),
      emergencyRefundTime: 5,
    };
    return loanContract;
  };

  const sendLoanContract = (loanContract) => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    console.log(network);
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
      contractName: "sample-contract-loan-v0",
      functionName: "setup-loan",
      functionArgs: [
        uintCV(loanContract.vaultLoanAmount),
        uintCV(loanContract.BTCDeposit),
        uintCV(loanContract.liquidationRatio),
        uintCV(loanContract.liquidationFee),
        uintCV(loanContract.emergencyRefundTime),
      ],
      onFinish: (data) => {
        closeModal();
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
    });
  };

  const createAndSendLoanContract = () => {
    sendLoanContract(createLoanContract());
  };

  const countCollateralToDebtRatio = () => {
    const collateralToDebtRatio =
      ((bitcoinInUSDAsNumber * collateral) / loan) * 100;
    setCollateralToDebtRatio(
      Math.round((collateralToDebtRatio + Number.EPSILON) * 100) / 100
    );
  };

  const countUSD = () => {
    setUSD(new Intl.NumberFormat().format(bitcoinInUSDAsNumber * collateral));
  };

  const fetchBitcoinPrice = async () => {
    await fetch("/.netlify/functions/get-bitcoin-price", {
      headers: { accept: "Accept: application/json" },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        const bitcoinValue = Number(msg.bpi.USD.rate.replace(/[^0-9.-]+/g, ""));
        setBitcoinInUSDAsNumber(bitcoinValue);
        setBitcoinInUSDAsString(new Intl.NumberFormat().format(bitcoinValue));
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent borderColor="black" color="white" width={350}>
        <VStack>
          <ModalHeader
            bgGradient="linear(to-r, primary1, primary2)"
            bgClip="text"
          >
            Request Loan
          </ModalHeader>
          <ModalCloseButton
            _focus={{
              boxShadow: "none",
            }}
          />
          <ModalBody>
            <FormControl isInvalid={isCollateralError}>
              <FormLabel
                marginTop={25}
                marginLeft={50}
                marginRight={50}
                bgGradient="linear(to-r, primary1, primary2)"
                bgClip="text"
              >
                Collateral Amount
              </FormLabel>
              {!isCollateralError ? (
                <FormHelperText
                  fontSize="x-small"
                  marginTop={15}
                  marginBottom={15}
                  marginLeft={50}
                >
                  Enter the amount of Bitcoin you would like to deposit.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  fontSize="x-small"
                  marginTop={15}
                  marginBottom={15}
                  marginLeft={50}
                >
                  Enter a valid amount of BTC
                </FormErrorMessage>
              )}
              <HStack marginLeft={50} marginRight={50} spacing={35}>
                <NumberInput>
                  <NumberInputField
                    padding={15}
                    bgGradient="linear(to-r, primary1, primary2)"
                    bgClip="text"
                    value={collateral}
                    width={200}
                    onChange={handleCollateralChange}
                  />
                </NumberInput>
                <Image
                  src="/btc_logo.png"
                  alt="Bitcoin Logo"
                  width={25}
                  height={25}
                ></Image>
              </HStack>
              <Text fontSize="x-small" color="gray" marginLeft={50}>
                ${USD} at 1 BTC = ${bitcoinInUSDAsString}
              </Text>
            </FormControl>
            <FormControl isInvalid={isLoanError}>
              <FormLabel
                marginTop={25}
                marginLeft={50}
                marginRight={50}
                bgGradient="linear(to-r, primary1, primary2)"
                bgClip="text"
              >
                Loan Amount
              </FormLabel>
              {!isLoanError ? (
                <FormHelperText
                  fontSize="x-small"
                  marginTop={15}
                  marginBottom={15}
                  marginLeft={50}
                >
                  Enter the amount of USDC you would like to loan.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  fontSize="x-small"
                  marginTop={15}
                  marginBottom={15}
                  marginLeft={50}
                >
                  Enter a valid amount of USDC
                </FormErrorMessage>
              )}
              <HStack marginLeft={50} marginRight={50} spacing={35}>
                <NumberInput>
                  <NumberInputField
                    padding={15}
                    bgGradient="linear(to-r, primary1, primary2)"
                    bgClip="text"
                    value={loan}
                    width={200}
                    onChange={handleLoanChange}
                  />
                </NumberInput>
                <Image
                  src="/usdc_logo.png"
                  alt="USD Coin Logo"
                  width={25}
                  height={25}
                ></Image>
              </HStack>
            </FormControl>
            <TableContainer margin="15px" width="350px">
              <Table>
                <Tbody>
                  <Tr>
                    <Td fontSize="sm" color="gray">
                      Collateral to debt ratio:
                    </Td>
                    {!isCollateralToDebtRatioError ? (
                      <Td fontSize="sm" color="green">
                        {collateralToDebtRatio}%
                      </Td>
                    ) : (
                      <Td fontSize="sm" color="red">
                        {collateralToDebtRatio}%
                      </Td>
                    )}
                  </Tr>
                  <Tr>
                    <Td fontSize="sm" color="gray">
                      Liquidation ratio:
                    </Td>
                    <Td fontSize="sm" color="gray">
                      {liquidationRatio}%
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontSize="sm" color="gray">
                      Liquidation fee:
                    </Td>
                    <Td fontSize="sm" color="gray">
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
                  bg: "accent",
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
                type="submit"
                onClick={createAndSendLoanContract}
              >
                Request Loan
              </Button>
            </Flex>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
