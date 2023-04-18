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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  customShiftValue,
  fixedTwoDecimalUnshift,
  countCollateralToDebtRatio,
  formatCollateralInUSD,
  formatBitcoinInUSDAmount,
} from '../utils';
import eventBus from '../EventBus';
import { sendLoanContractToStacks } from '../blockchainFunctions/stacksFunctions';
import { sendLoanContractToEthereum } from '../blockchainFunctions/ethereumFunctions';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { closeDepositModal } from '../store/componentSlice';

export default function DepositModal() {
  const dispatch = useDispatch();
  const isDepositModalOpen = useSelector((state) => state.component.isDepositModalOpen);
  const [collateralAmount, setCollateralAmount] = useState(undefined);
  const [vaultLoanAmount, setVaultLoanAmount] = useState(undefined);
  const [collateralToDebtRatio, setCollateralToDebtRatio] = useState();
  const walletType = useSelector((state) => state.account.walletType);
  const [liquidationRatio, setLiquidationRatio] = useState(140);
  const [liquidationFee, setLiquidationFee] = useState(10);
  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();
  const bitcoinPrice = useSelector((state) => state.externalData.bitcoinPrice);
  const [USDAmount, setUSDAmount] = useState(0);
  const [isError, setError] = useState(true);
  const [isCollateralError, setCollateralError] = useState(true);
  const [isLoanError, setLoanError] = useState(true);
  const [isCollateralToDebtRatioError, setCollateralToDebtRatioError] = useState(false);
  const errorArray = [isCollateralError, isLoanError, isCollateralToDebtRatioError];

  useEffect(() => {
    setUSDAmount(formatCollateralInUSD(collateralAmount, bitCoinInUSDAsNumber));
    setCollateralToDebtRatio(countCollateralToDebtRatio(collateralAmount, bitCoinInUSDAsNumber, vaultLoanAmount, 0));
    setCollateralError(collateralAmount < 0.0001 || collateralAmount === undefined);
    setLoanError(vaultLoanAmount < 1 || vaultLoanAmount === undefined);
    setCollateralToDebtRatioError(collateralToDebtRatio < 140);
    setError(errorArray.includes(true));
  }, [collateralAmount, vaultLoanAmount, collateralToDebtRatio, isCollateralToDebtRatioError]);

  const handleCollateralChange = (collateralAmount) => setCollateralAmount(collateralAmount.target.value);

  const createAndSendLoanContract = () => {
    sendLoanContract(createLoanContract());
  };

  const createLoanContract = () => ({
    BTCDeposit: parseInt(customShiftValue(collateralAmount, 8, false)),
    liquidationRatio: fixedTwoDecimalUnshift(liquidationRatio),
    liquidationFee: fixedTwoDecimalUnshift(liquidationFee),
    emergencyRefundTime: 5,
  });

  const sendLoanContract = (loanContract) => {
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        sendLoanContractToStacks(loanContract).then(
          eventBus.dispatch('loan-event', { status: 'initialized', loan: loanContract })
        );
        break;
      case 'metamask':
        sendLoanContractToEthereum(loanContract).then(
          eventBus.dispatch('loan-event', { status: 'initialized', loan: loanContract })
        );
        break;
      default:
        console.log('Unsupported wallet type!');
        break;
    }
  };

  useEffect(() => {
    setBitCoinInUSDAsNumber(bitcoinPrice);
    setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinPrice));
  }, [bitcoinPrice]);

  return (
    <Modal isOpen={isDepositModalOpen} onClose={() => dispatch(closeDepositModal())} isCentered>
            <ModalOverlay />
            <ModalContent
                width="350px"
                border="1px"
                bg="background2"
                color="accent"
            >
                <VStack>
                    <ModalHeader color="white">Request Vault</ModalHeader>
                    <ModalCloseButton
                        _focus={{
                            boxShadow: 'none',
                        }}
                    />
                    <ModalBody>
                        <FormControl isInvalid={isCollateralError}>
                            <FormLabel
                                marginTop="15px"
                                marginBottom="15px"
                                marginLeft="40px"
                                color="white"
                            >
                                Collateral Amount
                            </FormLabel>
                            {!isCollateralError ? (
                                <FormHelperText
                                    marginTop="15px"
                                    marginBottom="15px"
                                    marginLeft="40px"
                                    fontSize="x-small"
                                    color="accent"
                                >
                                    Enter the amount of Bitcoin you would like
                                    to deposit.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage
                                    marginTop="15px"
                                    marginBottom="15px"
                                    marginLeft="40px"
                                    fontSize="x-small"
                                >
                                    Enter a valid amount of BTC
                                </FormErrorMessage>
                            )}
                            <HStack
                                marginLeft="40px"
                                marginRight="50px"
                                spacing={45}
                            >
                                <NumberInput focusBorderColor="accent">
                                    <NumberInputField
                                        padding="15px"
                                        width="200px"
                                        color="white"
                                        value={collateralAmount}
                                        onChange={handleCollateralChange}
                                    />
                                </NumberInput>
                                <Image
                                    src="/btc_logo.png"
                                    alt="Bitcoin Logo"
                                    width="25px"
                                    height="25px"
                                ></Image>
                            </HStack>
                            <Text
                                marginTop="15px"
                                marginLeft="40px"
                                fontSize="x-small"
                                color="white"
                            >
                                ${USDAmount} at 1 BTC = ${bitCoinInUSDAsString}
                            </Text>
                        </FormControl>
                        <Flex justifyContent="center">
                            <Button
                                variant="outline"
                                type="submit"
                                onClick={createAndSendLoanContract}
                            >
                                REQUEST VAULT
                            </Button>
                        </Flex>
                    </ModalBody>
                </VStack>
            </ModalContent>
        </Modal>
  );
}
