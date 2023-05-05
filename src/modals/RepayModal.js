import {
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
  HStack,
  VStack,
} from '@chakra-ui/react';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { customShiftValue, countCollateralToDebtRatio, formatCollateralInUSD } from '../utils';

import { repayStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { repayEthereumLoan } from '../blockchainFunctions/ethereumFunctions';
import { fetchBitcoinPrice } from '../blockchainFunctions/bitcoinFunctions';

import { toggleRepayModalVisibility } from '../store/componentSlice';

export default function RepayModal() {
  const dispatch = useDispatch();

  const isRepayModalOpen = useSelector((state) => state.component.isRepayModalOpen);
  const loan = useSelector((state) => state.component.loanForModal);

  const walletType = useSelector((state) => state.account.walletType);

  const [additionalRepayment, setAdditionalRepayment] = useState();

  const [collateralToDebtRatio, setCollateralToDebtRatio] = useState();

  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();

  const [USDAmount, setUSDAmount] = useState(0);

  const [isLoanError, setLoanError] = useState(true);
  const [isCollateralToDebtRatioError, setCollateralToDebtRatioError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice().then((bitcoinPrice) => {
        setBitCoinInUSDAsNumber(bitcoinPrice);
        setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinPrice));
      });
    }
    fetchData();
  }, [isRepayModalOpen === true]);

  useEffect(() => {
    if (loan) {
      const collateralAmount = customShiftValue(loan.vaultCollateral, 8, true);
      setUSDAmount(formatCollateralInUSD(collateralAmount, bitCoinInUSDAsNumber));
      setCollateralToDebtRatio(
        countCollateralToDebtRatio(collateralAmount, bitCoinInUSDAsNumber, loan.vaultLoan, -additionalRepayment)
      );
      setLoanError(additionalRepayment < 1 || additionalRepayment === undefined);
      setCollateralToDebtRatioError(collateralToDebtRatio < 140);
    }
  }, [additionalRepayment, collateralToDebtRatio, isCollateralToDebtRatioError]);

  const handleRepayChange = (additionalRepayment) => {
    setAdditionalRepayment(additionalRepayment.target.value);
  };

  const repayLoanContract = async () => {
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        repayStacksLoan(loan.uuid, additionalRepayment);
        break;
      case 'metamask':
        repayEthereumLoan(loan.uuid, additionalRepayment);
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
  };

  return (
    <>
      {loan && (
        <Modal
          isOpen={isRepayModalOpen}
          onClose={() => dispatch(toggleRepayModalVisibility({ isOpen: false }))}
          isCentered>
          <ModalOverlay />
          <ModalContent
            width='350px'
            border='1px'
            bg='background2'
            color='accent'>
            <VStack>
              <ModalHeader color='white'>Repay USDC</ModalHeader>
              <ModalCloseButton
                _focus={{
                  boxShadow: 'none',
                }}
              />
              <ModalBody>
                <Text
                  marginTop='15px'
                  marginBottom='15px'
                  marginLeft='40px'
                  color='white'
                  fontSize='md'>
                  Collateral Amount
                </Text>
                <HStack
                  marginLeft='40px'
                  spacing={45}>
                  <Text
                    width='200px'
                    color='white'
                    fontSize='md'>
                    {customShiftValue(loan.vaultCollateral, 8, true)}
                  </Text>
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
                <FormControl isInvalid={isLoanError}>
                  <FormLabel
                    marginTop='15px'
                    marginBottom='15px'
                    marginLeft='40px'
                    color='white'>
                    Repay Amount
                  </FormLabel>
                  {!isLoanError ? (
                    <FormHelperText
                      marginTop='15px'
                      marginBottom='15px'
                      marginLeft='40px'
                      fontSize='x-small'
                      color='accent'>
                      Enter the amount of USDC you would like to repay.
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage
                      marginTop='15px'
                      marginBottom='15px'
                      marginLeft='40px'
                      fontSize='x-small'>
                      Enter a valid amount of USDC.
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
                        value={additionalRepayment}
                        onChange={handleRepayChange}
                      />
                    </NumberInput>
                    <Image
                      src='/usdc_logo.png'
                      alt='USD Coin Logo'
                      width='25px'
                      height='25px'></Image>
                  </HStack>
                </FormControl>
                <HStack
                  marginTop='15px'
                  marginBottom='15px'
                  marginLeft='40px'
                  spacing={45}>
                  <Text
                    width='185px'
                    fontSize='sm'
                    color='gray'>
                    Collateral to debt ratio:
                  </Text>
                  {!isCollateralToDebtRatioError ? (
                    <Text
                      fontSize='sm'
                      color='green'>
                      {collateralToDebtRatio}%
                    </Text>
                  ) : (
                    <Text
                      fontSize='sm'
                      color='red'>
                      {collateralToDebtRatio}%
                    </Text>
                  )}
                </HStack>
                <HStack
                  marginTop='15px'
                  marginBottom='15px'
                  marginLeft='40px'
                  spacing={45}>
                  <Text
                    width='185px'
                    fontSize='sm'
                    color='gray'>
                    Already borrowed:
                  </Text>
                  <Text
                    fontSize='sm'
                    color='gray'>
                    {'$ ' + customShiftValue(loan.vaultLoan, 6, true)}
                  </Text>
                </HStack>
                <Flex justifyContent='center'>
                  <Button
                    variant='outline'
                    type='submit'
                    onClick={() => repayLoanContract()}>
                    REPAY USDC
                  </Button>
                </Flex>
              </ModalBody>
            </VStack>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
