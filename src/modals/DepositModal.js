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
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { customShiftValue, fixedTwoDecimalUnshift } from "../utils";
import { StacksMocknet } from "@stacks/network";
import { uintCV } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { ethers } from "ethers";
import { abi as loanManagerABI } from "../loanManagerABI";
import eventBus from "../EventBus";

export default function DepositModal({ isOpen, closeModal, walletType }) {
  const [collateral, setCollateral] = useState(undefined);
  const [loan, setLoan] = useState(undefined);
  const [collateralToDebtRatio, setCollateralToDebtRatio] = useState();
  //setLiquidation, setLiquidationFee will be used in the future
  const [liquidationRatio, setLiquidationRatio] = useState(140);
  const [liquidationFee, setLiquidationFee] = useState(10);
  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();
  const [USDAmount, setUSDAmount] = useState(0);
  const [isError, setError] = useState(true);
  const [isCollateralError, setCollateralError] = useState(true);
  const [isLoanError, setLoanError] = useState(true);
  const [isCollateralToDebtRatioError, setCollateralToDebtRatioError] =
    useState(false);
  const errorArray = [
    isCollateralError,
    isLoanError,
    isCollateralToDebtRatioError,
  ];
  const toast = useToast();

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice();
    }
    fetchData();
  }, []);

  useEffect(() => {
    countUSDAmount();
    countCollateralToDebtRatio();

    setCollateralError(collateral < 0.0001 || collateral === undefined);
    setLoanError(loan < 1 || loan === undefined);
    setCollateralToDebtRatioError(collateralToDebtRatio < 140);
    setError(errorArray.includes(true));
  }, [collateral, loan, collateralToDebtRatio, isCollateralToDebtRatioError]);

  const handleCollateralChange = (collateral) =>
    setCollateral(collateral.target.value);

  const handleLoanChange = (loan) => setLoan(loan.target.value);

  const createAndSendLoanContract = () => {
    sendLoanContract(createLoanContract());
  };

  const createLoanContract = () => ({
    vaultLoanAmount: fixedTwoDecimalUnshift(loan),
    BTCDeposit: customShiftValue(collateral, 8, false),
    liquidationRatio: fixedTwoDecimalUnshift(liquidationRatio),
    liquidationFee: fixedTwoDecimalUnshift(liquidationFee),
    emergencyRefundTime: 5,
  });

  const sendLoanContract = (loanContract) => {
    switch (walletType) {
      case "hiro":
        sendLoanContractToStacks(loanContract);
        break;
      case "metamask":
        sendLoanContractToEthereum(loanContract);
        break;
      default:
        console.log("Unsupported wallet type!");
        break;
    }
  };

  const sendLoanContractToStacks = (loanContract) => {
    const network = new StacksMocknet({ url: "http://localhost:3999" });
    openContractCall({
      network: network,
      anchorMode: 1,
      contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
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
        eventBus.dispatch("loan-event", { status: "created", txId: data.txId });
      },
      onCancel: () => {
        eventBus.dispatch("loan-event", { status: "cancelled" });
      },
    });
  };

  const sendLoanContractToEthereum = async (loanContract) => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const loanManagerETH = new ethers.Contract(
      process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
      loanManagerABI,
      signer
    );
    loanManagerETH
      .setupLoan(
        loanContract.vaultLoanAmount,
        loanContract.BTCDeposit,
        loanContract.liquidationRatio,
        loanContract.liquidationFee,
        loanContract.emergencyRefundTime
      )
      .then((response) =>
        eventBus.dispatch("loan-event", {
          status: "created",
          txId: response.hash,
        })
      )
      .then(() => closeModal());
  };

  const fetchBitcoinPrice = async () => {
    await fetch("/.netlify/functions/get-bitcoin-price", {
      headers: { accept: "Accept: application/json" },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        const bitcoinValue = Number(msg.bpi.USD.rate.replace(/[^0-9.-]+/g, ""));
        setBitCoinInUSDAsNumber(bitcoinValue);
        setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinValue));
      });
  };

  const countCollateralToDebtRatio = () => {
    const collateralInUSD = collateral * bitCoinInUSDAsNumber;
    const collateralToDebtRatio = collateralInUSD / loan;
    setCollateralToDebtRatio(Math.round(collateralToDebtRatio * 100));
  };

  const countUSDAmount = () => {
    setUSDAmount(
      new Intl.NumberFormat().format(bitCoinInUSDAsNumber * collateral)
    );
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
              <FormLabel>
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
                ${USDAmount} at 1 BTC = ${bitCoinInUSDAsString}
              </Text>
            </FormControl>
            <FormControl isInvalid={isLoanError}>
              <FormLabel>
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
