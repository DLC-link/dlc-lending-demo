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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { customShiftValue, fixedTwoDecimalUnshift, formatCollateralInUSD } from '../utilities/utils';
import { sendLoanContractToStacks } from '../blockchainFunctions/stacksFunctions';
import { sendLoanContractToEthereum } from '../blockchainFunctions/ethereumFunctions';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { toggleDepositModalVisibility } from '../store/componentSlice';
import { fetchBitcoinPrice } from '../blockchainFunctions/bitcoinFunctions';

export default function DepositModal() {
  const [collateralAmount, setCollateralAmount] = useState(undefined);
  const [isCollateralError, setCollateralError] = useState(true);
  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();
  const [USDAmount, setUSDAmount] = useState(0);
  const walletType = useSelector((state) => state.account.walletType);
  const isDepositModalOpen = useSelector((state) => state.component.isDepositModalOpen);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice().then((bitcoinPrice) => {
        setBitCoinInUSDAsNumber(bitcoinPrice);
        setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinPrice));
      });
    }
    fetchData();
  }, [isDepositModalOpen === true]);

  useEffect(() => {
    setUSDAmount(formatCollateralInUSD(collateralAmount, bitCoinInUSDAsNumber));
    setCollateralError(collateralAmount < 0.0001 || collateralAmount === undefined);
  }, [collateralAmount, bitCoinInUSDAsNumber]);

  const handleCollateralChange = (collateralAmount) => setCollateralAmount(collateralAmount.target.value);

  const createAndSendLoanContract = () => {
    const loanContract = createLoanContract();
    sendLoanContract(loanContract);
  };

  const createLoanContract = () => ({
    BTCDeposit: parseInt(customShiftValue(collateralAmount, 8, false)),
    liquidationRatio: parseInt(fixedTwoDecimalUnshift(140)),
    liquidationFee: parseInt(fixedTwoDecimalUnshift(10)),
    attestorCount: 3,
  });

  const sendLoanContract = (loanContract) => {
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        sendLoanContractToStacks(loanContract).then(() => dispatch(toggleDepositModalVisibility(false)));
        break;
      case 'metamask':
        sendLoanContractToEthereum(loanContract).then(() => dispatch(toggleDepositModalVisibility(false)));
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
  };

  return (
    <Modal
      isOpen={isDepositModalOpen}
      onClose={() => dispatch(toggleDepositModalVisibility(false))}
      isCentered>
      <ModalOverlay />
      <ModalContent
        width='350px'
        border='1px'
        bg='background2'
        color='accent'>
        <VStack>
          <ModalHeader color='white'>Request Loan</ModalHeader>
          <ModalCloseButton
            _focus={{
              boxShadow: 'none',
            }}
          />
          <ModalBody>
            <FormControl isInvalid={isCollateralError}>
              <FormLabel
                marginTop='15px'
                marginBottom='15px'
                marginLeft='40px'
                color='white'>
                Collateral Amount
              </FormLabel>
              {!isCollateralError ? (
                <FormHelperText
                  marginTop='15px'
                  marginBottom='15px'
                  marginLeft='40px'
                  fontSize='x-small'
                  color='accent'>
                  Enter the amount of Bitcoin you would like to deposit.
                </FormHelperText>
              ) : (
                <FormErrorMessage
                  marginTop='15px'
                  marginBottom='15px'
                  marginLeft='40px'
                  fontSize='x-small'>
                  Enter a valid amount of BTC
                </FormErrorMessage>
              )}
              <HStack
                marginLeft='40px'
                marginRight='50px'
                spacing={45}>
                <NumberInput focusBorderColor='accent'>
                  <NumberInputField
                    padding='15px'
                    width='200px'
                    color='white'
                    value={collateralAmount}
                    onChange={handleCollateralChange}
                  />
                </NumberInput>
                <Image
                  src='/btc_logo.png'
                  alt='Bitcoin Logo'
                  width='25px'
                  height='25px'></Image>
              </HStack>
              <Text
                marginTop='15px'
                marginLeft='40px'
                fontSize='x-small'
                color='white'>
                ${USDAmount} at 1 BTC = ${bitCoinInUSDAsString}
              </Text>
            </FormControl>
            <Flex justifyContent='center'>
              <Button
                sx={{
                  margin: '15px',
                }}
                variant='outline'
                type='submit'
                onClick={createAndSendLoanContract}>
                REQUEST LOAN
              </Button>
            </Flex>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
