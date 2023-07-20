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

import store from '../store/store';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  customShiftValue,
  formatCollateralInUSD,
  calculateCollateralCoveragePercentageForBorrow,
  chooseShiftValue,
} from '../utils';
import { fetchBitcoinPrice } from '../blockchainFunctions/bitcoinFunctions';

import { borrowStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { borrowEthereumLoan } from '../blockchainFunctions/ethereumFunctions';
import { toggleBorrowModalVisibility } from '../store/componentSlice';

export default function BorrowModal() {
  const dispatch = useDispatch();

  const isBorrowModalOpen = useSelector((state) => state.component.isBorrowModalOpen);
  const loan = useSelector((state) => state.component.loanForModal);

  const walletType = useSelector((state) => state.account.walletType);

  const [additionalLoan, setAdditionalLoan] = useState();

  const [collateralToDebtPercentage, setCollateralToDebtPercentage] = useState();

  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();

  const [shiftValue, setShiftValue] = useState();

  const [USDAmount, setUSDAmount] = useState(0);

  const [isLoanError, setLoanError] = useState(false);
  const [isCollateralToDebtPercentageError, setCollateralToDebtPercentageError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice().then((bitcoinPrice) => {
        setBitCoinInUSDAsNumber(bitcoinPrice);
        setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinPrice));
      });
    }
    if (loan) {
      fetchData();
      const chosenShiftValue = chooseShiftValue(walletType);
      setShiftValue(chosenShiftValue);
    }
  }, [loan]);

  useEffect(() => {
    if (loan) {
      setUSDAmount(formatCollateralInUSD(customShiftValue(loan.vaultCollateral, 8, true), bitCoinInUSDAsNumber));
      updateCollateralToDebtPercentage();
      updateLoanError();
    }
  }, [additionalLoan, collateralToDebtPercentage, isCollateralToDebtPercentageError]);

  const handleLoanChange = (additionalLoan) => {
    setAdditionalLoan(additionalLoan.target.value);
  };

  const updateCollateralToDebtPercentage = () => {
    const collateralCoveragePercentage = calculateCollateralCoveragePercentageForBorrow(
      Number(customShiftValue(loan.vaultCollateral, 8, true)),
      Number(bitCoinInUSDAsNumber),
      Number(customShiftValue(loan.vaultLoan, shiftValue, true)),
      Number(additionalLoan)
    );
    if (isNaN(collateralCoveragePercentage)) {
      setCollateralToDebtPercentage('-');
    } else {
      setCollateralToDebtPercentage(collateralCoveragePercentage);
    }

    const isBelowMinimumRatio = collateralCoveragePercentage < 140;

    if (isBelowMinimumRatio) {
      setCollateralToDebtPercentageError(true);
    } else {
      setCollateralToDebtPercentageError(false);
    }
  };

  const updateLoanError = () => {
    const shouldDisplayLoanError = additionalLoan < 1 || additionalLoan === undefined;
    setLoanError(shouldDisplayLoanError);
  };

  const borrowLoanContract = async () => {
    store.dispatch(toggleBorrowModalVisibility({ isOpen: false }));
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        borrowStacksLoan(loan.uuid, additionalLoan);
        break;
      case 'metamask':
        borrowEthereumLoan(loan.uuid, additionalLoan);
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
          isOpen={isBorrowModalOpen}
          onClose={() => dispatch(toggleBorrowModalVisibility({ isOpen: false }))}
          isCentered>
          <ModalOverlay />
          <ModalContent
            width='350px'
            border='1px'
            bg='background2'
            color='accent'>
            <VStack>
              <ModalHeader color='white'>Borrow USDC</ModalHeader>
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
                    Borrow Amount
                  </FormLabel>
                  {!isLoanError ? (
                    <FormHelperText
                      marginTop='15px'
                      marginBottom='15px'
                      marginLeft='40px'
                      fontSize='x-small'
                      color='accent'>
                      Enter the amount of USDC you would like to borrow.
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
                        value={additionalLoan}
                        onChange={handleLoanChange}
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
                    Collateral to debt ratio percentage:
                  </Text>
                  {!isCollateralToDebtPercentageError ? (
                    <Text
                      fontSize='sm'
                      color='green'>
                      {collateralToDebtPercentage}%
                    </Text>
                  ) : (
                    <Text
                      fontSize='sm'
                      color='red'>
                      {collateralToDebtPercentage}%
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
                    {loan.formattedVaultLoan}
                  </Text>
                </HStack>
                <Flex justifyContent='center'>
                  <Button
                    disabled={isLoanError}
                    variant='outline'
                    type='submit'
                    onClick={() => borrowLoanContract()}>
                    BORROW USDC
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
