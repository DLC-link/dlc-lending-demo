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

export default function DepositModal({ isOpen, closeModal, walletType, blockchain }) {
  const [collateralAmount, setCollateralAmount] = useState(undefined);
  const [vaultLoanAmount, setVaultLoanAmount] = useState(undefined);
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
  const [isCollateralToDebtRatioError, setCollateralToDebtRatioError] = useState(false);
  const errorArray = [isCollateralError, isLoanError, isCollateralToDebtRatioError];

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice();
    }
    fetchData();
  }, []);

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
        sendLoanContractToStacks(loanContract, blockchain).then(
          eventBus.dispatch('loan-event', { status: 'initialized', loan: loanContract })
        );
        break;
      case 'metamask':
        sendLoanContractToEthereum(loanContract, blockchain).then(
          eventBus.dispatch('loan-event', { status: 'initialized', loan: loanContract })
        );
        break;
      default:
        console.log('Unsupported wallet type!');
        break;
    }
  };

  const fetchBitcoinPrice = async () => {
    await fetch('/.netlify/functions/get-bitcoin-price', {
      headers: { accept: 'Accept: application/json' },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        const bitcoinValue = formatBitcoinInUSDAmount(msg);
        setBitCoinInUSDAsNumber(bitcoinValue);
        setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinValue));
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isCentered>
      <ModalOverlay />
      <ModalContent
        borderColor='black'
        color='white'
        width={350}>
        <VStack>
          <ModalHeader
            bgGradient='linear(to-r, primary1, primary2)'
            bgClip='text'>
            Request Vault
          </ModalHeader>
          <ModalCloseButton
            _focus={{
              boxShadow: 'none',
            }}
          />
          <ModalBody>
            <FormControl isInvalid={isCollateralError}>
              <FormLabel>Collateral Amount</FormLabel>
              {!isCollateralError ? (
                <FormHelperText
                  fontSize='x-small'
                  marginTop={15}
                  marginBottom={15}
                  marginLeft={50}>
                  Enter the amount of Bitcoin you would like to deposit.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  fontSize='x-small'
                  marginTop={15}
                  marginBottom={15}
                  marginLeft={50}>
                  Enter a valid amount of BTC
                </FormErrorMessage>
              )}
              <HStack
                marginLeft={50}
                marginRight={50}
                spacing={35}>
                <NumberInput>
                  <NumberInputField
                    padding={15}
                    bgGradient='linear(to-r, primary1, primary2)'
                    bgClip='text'
                    value={collateralAmount}
                    width={200}
                    onChange={handleCollateralChange}
                  />
                </NumberInput>
                <Image
                  src='/btc_logo.png'
                  alt='Bitcoin Logo'
                  width={25}
                  height={25}></Image>
              </HStack>
              <Text
                fontSize='x-small'
                color='gray'
                marginLeft={50}>
                ${USDAmount} at 1 BTC = ${bitCoinInUSDAsString}
              </Text>
            </FormControl>
            <TableContainer
              margin='15px'
              width='350px'>
              <Table>
                <Tbody>
                  <Tr>
                    <Td
                      fontSize='sm'
                      color='gray'>
                      Liquidation ratio:
                    </Td>
                    <Td
                      fontSize='sm'
                      color='gray'>
                      {liquidationRatio}%
                    </Td>
                  </Tr>
                  <Tr>
                    <Td
                      fontSize='sm'
                      color='gray'>
                      Liquidation fee:
                    </Td>
                    <Td
                      fontSize='sm'
                      color='gray'>
                      {liquidationFee}%
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
            <Flex justifyContent='center'>
              <Button
                _hover={{
                  color: 'white',
                  bg: 'accent',
                }}
                // isDisabled={isError}
                background='white'
                bgGradient='linear(to-r, primary1, primary2)'
                bgClip='text'
                width='150px'
                shadow='2xl'
                variant='outline'
                fontSize='sm'
                fontWeight='bold'
                type='submit'
                onClick={createAndSendLoanContract}>
                Request Vault
              </Button>
            </Flex>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
