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

import { formatCollateralInUSD, calculateCollateralCoveragePercentageForRepay } from '../utilities/utils';

import { repayStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { repayEthereumLoan } from '../blockchainFunctions/ethereumFunctions';
import { fetchBitcoinValue } from '../store/externalDataSlice';

import { toggleRepayModalVisibility } from '../store/componentSlice';
import { useOnMount } from '../hooks/useOnMount';

export default function RepayModal() {
  const dispatch = useDispatch();
  const loan = useSelector((state) => state.component.loanForModal);
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const isRepayModalOpen = useSelector((state) => state.component.isRepayModalOpen);
  const walletType = useSelector((state) => state.account.walletType);

  const [additionalRepayment, setAdditionalRepayment] = useState();
  const [collateralToDebtPercentage, setCollateralToDebtPercentage] = useState();
  const [USDAmount, setUSDAmount] = useState(0);

  const [isLoanError, setLoanError] = useState(false);
  const [isCollateralToDebtPercentageError, setCollateralToDebtPercentageError] = useState(false);

  useOnMount(() => {
    const updateBitcoinUSDValue = async () => {
      dispatch(fetchBitcoinValue());
    };
    updateBitcoinUSDValue();
  });

  useEffect(() => {
    setUSDAmount(formatCollateralInUSD(loan.vaultCollateral, bitcoinUSDValue));
    updateCollateralToDebtPercentage();
    updateLoanError();
  }, [additionalRepayment, collateralToDebtPercentage, isCollateralToDebtPercentageError]);

  const handleRepaymentChange = (additionalRepayment) => {
    setAdditionalRepayment(additionalRepayment.target.value);
  };

  const updateCollateralToDebtPercentage = () => {
    const collateralCoveragePercentage = calculateCollateralCoveragePercentageForRepay(
      Number(loan.vaultCollateral),
      Number(bitcoinUSDValue),
      Number(loan.vaultLoan),
      Number(additionalRepayment)
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
    const shouldDisplayLoanError =
      additionalRepayment < 1 || additionalRepayment === undefined || additionalRepayment > loan.vaultLoan;
    setLoanError(shouldDisplayLoanError);
  };

  const repayLoanContract = async () => {
    store.dispatch(toggleRepayModalVisibility({ isOpen: false }));
    switch (walletType) {
      case 'leather':
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
                {loan.vaultCollateral}
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
              ${USDAmount} at 1 BTC = ${new Intl.NumberFormat().format(bitcoinUSDValue)}
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
                    max={loan.vaultLoan}
                    padding='15px'
                    width='200px'
                    color='white'
                    value={additionalRepayment}
                    onChange={handleRepaymentChange}
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
                onClick={() => repayLoanContract()}>
                REPAY USDC
              </Button>
            </Flex>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
