import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Text,
  VStack,
} from '@chakra-ui/react';

import store from '../store/store';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { calculateCollateralCoveragePercentageForRepay, formatCollateralInUSD } from '../utilities/utils';

import { repayEthereumLoan } from '../blockchainFunctions/ethereumFunctions';
import { repayStacksLoan } from '../blockchainFunctions/stacksFunctions';
import { fetchBitcoinValue } from '../store/externalDataSlice';

import { ButtonContainer } from '../components/ActionButtons';
import { useOnMount } from '../hooks/useOnMount';
import { toggleRepayModalVisibility } from '../store/componentSlice';

export default function RepayModal() {
  const dispatch = useDispatch();
  const loan = useSelector((state) => state.component.loanForModal);
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const isRepayModalOpen = useSelector((state) => state.component.isRepayModalOpen);
  const walletType = useSelector((state) => state.account.walletType);

  const [additionalRepayment, setAdditionalRepayment] = useState(0);
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

  const CollateralAmountInfo = () => {
    return (
      <>
        <Text
          margin={0}
          width={250}
          textAlign={'left'}
          fontSize={'md'}
          fontWeight={'bold'}
          color={'header'}>
          Collateral Amount
        </Text>
        <HStack
          paddingBottom={2.5}
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={200}
            fontSize={'md'}
            color='white'>
            {loan.vaultCollateral}
          </Text>
          <Image
            src='/btc_logo.png'
            alt='Bitcoin Logo'
            boxSize={25}
          />
        </HStack>
        <HStack
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={125}
            fontSize={'xs'}
            fontWeight={'extrabold'}>
            ${USDAmount}
          </Text>
          <Text
            width={150}
            textAlign={'right'}
            fontSize={'xs'}
            color={'white'}>
            at 1 <strong>BTC</strong> $&nbsp;
            {new Intl.NumberFormat().format(bitcoinUSDValue)}
          </Text>
        </HStack>
      </>
    );
  };

  const LoanInfo = () => {
    return (
      <>
        <HStack
          justifyContent={'space-between'}
          width={250}>
          <Text
            width={125}
            fontSize={'xs'}
            fontWeight={'extrabold'}
            color={'white'}>
            Collateral to debt ratio percentage:
          </Text>

          {!isCollateralToDebtPercentageError ? (
            <Text
              fontSize={'sm'}
              color={'accent'}>
              {collateralToDebtPercentage}%
            </Text>
          ) : (
            <Text
              fontSize={'sm'}
              color={'warning'}>
              {collateralToDebtPercentage}%
            </Text>
          )}
        </HStack>
        <HStack
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={125}
            fontSize='xs'
            fontWeight={'extrabold'}
            color='white'>
            Already borrowed:
          </Text>
          <Text
            width={150}
            textAlign={'right'}
            fontSize='xs'
            color='white'>
            {loan.formattedVaultLoan}
          </Text>
        </HStack>
      </>
    );
  };

  return (
    <Modal
      isOpen={isRepayModalOpen}
      onClose={() => dispatch(toggleRepayModalVisibility({ isOpen: false }))}
      isCentered>
      <ModalOverlay />
      <ModalContent
        width={350}
        bg={'background2'}
        border={'1px'}
        borderColor={'accent'}>
        <VStack>
          <ModalHeader color={'white'}>Repay USDC</ModalHeader>
          <ModalBody>
            <VStack
              width={350}
              spacing={25}>
              <CollateralAmountInfo />
              <VStack>
                <FormControl isInvalid={isLoanError}>
                  <FormLabel
                    margin={0}
                    width={250}
                    color={'header'}
                    textAlign={'left'}
                    fontWeight={'bold'}>
                    Repay Amount
                  </FormLabel>
                  {!isLoanError ? (
                    <FormHelperText
                      marginBottom={15}
                      width={250}
                      height={25}
                      textAlign={'left'}
                      fontSize={'2xs'}
                      color={'accent'}>
                      Enter the amount of <strong>USDC</strong> you would like to repay.
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage
                      marginBottom={15}
                      width={250}
                      height={25}
                      textAlign={'left'}
                      fontSize={'2xs'}
                      color={'warning'}>
                      Enter a valid amount of &nbsp;
                      <strong>USDC</strong>
                    </FormErrorMessage>
                  )}
                  <HStack
                    paddingBottom={2.5}
                    width={250}
                    justifyContent={'space-between'}>
                    <NumberInput focusBorderColor={'accent'}>
                      <NumberInputField
                        max={loan.vaultLoan}
                        width={200}
                        color={'white'}
                        value={additionalRepayment}
                        onChange={handleRepaymentChange}
                      />
                    </NumberInput>
                    <Image
                      src='/usdc_logo.png'
                      alt='USD Coin Logo'
                      boxSize={25}
                    />
                  </HStack>
                </FormControl>
              </VStack>
              <LoanInfo />
              <ButtonContainer>
                <Button
                  disabled={isLoanError}
                  variant='outline'
                  type='submit'
                  onClick={() => repayLoanContract()}>
                  REPAY USDC
                </Button>
              </ButtonContainer>
            </VStack>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
