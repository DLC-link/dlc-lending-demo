import {
  Button,
  FormControl,
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
import { ethers } from 'ethers';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Decimal } from 'decimal.js';

import { formatCollateralInUSD, customShiftValue } from '../utilities/utils';

import { withdrawFromVault } from '../blockchainFunctions/ethereumFunctions';
import { fetchBitcoinValue, fetchVdlcBtcBalance, fetchVaultDepositBalance } from '../store/externalDataSlice';

import { ButtonContainer } from '../components/ActionButtons';
import { useOnMount } from '../hooks/useOnMount';
import { toggleRepayModalVisibility } from '../store/componentSlice';

export default function RepayModal() {
  const dispatch = useDispatch();
  // const vault = useSelector((state) => state.component.vaultForModal);
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const isRepayModalOpen = useSelector((state) => state.component.isRepayModalOpen);
  const walletType = useSelector((state) => state.account.walletType);
  const vDlcBtcBalance = useSelector((state) => state.externalData.vDlcBtcBalance);
  const vaultDepositBalance = useSelector((state) => state.externalData.vaultAssetBalance);

  const [additionalRepayment, setAdditionalRepayment] = useState(0);
  // const [collateralToDebtPercentage, setCollateralToDebtPercentage] = useState();
  const [USDAmount, setUSDAmount] = useState(0);
  const [isOverBalance, setIsOverBalance] = useState(false);
  const [assetsToWithdraw, setAssetsToWithdraw] = useState(0);
  const [isVaultDepositsBalanceHighEnough, setIsVaultDepositsBalanceHighEnough] = useState(true);
  const outstandingDebt = useSelector((state) => state.externalData.outstandingDebt);

  const [isLoanError, setLoanError] = useState(false);
  // const [isCollateralToDebtPercentageError, setCollateralToDebtPercentageError] = useState(false);

  useOnMount(() => {
    dispatch(fetchBitcoinValue());
    dispatch(fetchVdlcBtcBalance());
    dispatch(fetchVaultDepositBalance());
  });

  useEffect(() => {
    setUSDAmount(formatCollateralInUSD(vDlcBtcBalance, bitcoinUSDValue));
    setLoanError(
      additionalRepayment < 1 || additionalRepayment === undefined || isOverBalance || !isVaultDepositsBalanceHighEnough
    );
  }, [additionalRepayment, bitcoinUSDValue, vDlcBtcBalance, isOverBalance, isVaultDepositsBalanceHighEnough]);

  useEffect(() => {
    const _assetsToWithdraw = (Number(additionalRepayment) / Number(bitcoinUSDValue)) * 100000000;
    setAssetsToWithdraw(_assetsToWithdraw.toFixed(0));
    setIsOverBalance(_assetsToWithdraw > customShiftValue(vDlcBtcBalance, 8));
    setIsVaultDepositsBalanceHighEnough(_assetsToWithdraw < customShiftValue(vaultDepositBalance, 8));
  }, [additionalRepayment, bitcoinUSDValue, vDlcBtcBalance, vaultDepositBalance]);

  const handleRepaymentChange = (additionalRepayment) => {
    setAdditionalRepayment(additionalRepayment.target.value);
  };

  const repayLoanContract = async () => {
    store.dispatch(toggleRepayModalVisibility({ isOpen: false }));
    switch (walletType) {
      case 'metamask':
        await withdrawFromVault(assetsToWithdraw);
        break;
      case 'leather':
      case 'xverse':
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
          vDlcBTC Balance in Vault
        </Text>
        <HStack
          paddingBottom={2.5}
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={200}
            fontSize={'md'}
            color='white'>
            {vDlcBtcBalance}
          </Text>
          <Image
            src='https://cdn.discordapp.com/attachments/994505799902691348/1151911557404569711/DLC.Link_logo_icon_color1.png'
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
        {/* <HStack
          justifyContent={'space-between'}
          width={250}>
          <Text
            width={125}
            fontSize={'xs'}
            fontWeight={'extrabold'}
            color={'white'}>
            Collateral to debt ratio percentage:
          </Text>
          <Text
            fontSize={'sm'}
            color={!isCollateralToDebtPercentageError ? 'accent' : 'warning'}>
            {collateralToDebtPercentage}%
          </Text>
        </HStack> */}
        <HStack
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={125}
            fontSize='xs'
            fontWeight={'extrabold'}
            color='white'>
            Total borrowed:
          </Text>
          <Text
            width={150}
            textAlign={'right'}
            fontSize='xs'
            color='white'>
            $ {new Intl.NumberFormat().format(outstandingDebt)}
          </Text>
        </HStack>
        <HStack
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={125}
            fontSize='xs'
            fontWeight={'extrabold'}
            color='white'>
            dlcBTC to be withdrawn:
          </Text>
          <Text
            width={150}
            textAlign={'right'}
            fontSize='xs'
            color='white'>
            {ethers.utils.formatUnits(assetsToWithdraw, 8)}
          </Text>
        </HStack>
        <HStack
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={125}
            fontSize='xs'
            fontWeight={'extrabold'}
            color='white'>
            dlcBTC remaining in vault after withdrawal:
          </Text>
          <Text
            width={150}
            textAlign={'right'}
            fontSize='xs'
            color='white'>
            {(Decimal(Number(vDlcBtcBalance)) - Decimal(Number(ethers.utils.formatUnits(assetsToWithdraw, 8)))).toFixed(
              8
            )}
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
                    <Text
                      marginTop={15}
                      marginBottom={15}
                      width={250}
                      height={25}
                      textAlign={'left'}
                      fontSize={'2xs'}
                      color={'accent'}>
                      Enter the amount of <strong>USDC</strong> you would like to repay.
                    </Text>
                  ) : (
                    <Text
                      marginTop={15}
                      marginBottom={15}
                      width={250}
                      height={25}
                      textAlign={'left'}
                      fontSize={'2xs'}
                      color={'warning'}>
                      Enter a valid amount of &nbsp;
                      <strong>USDC</strong>
                    </Text>
                  )}
                  <HStack
                    paddingBottom={2.5}
                    width={250}
                    justifyContent={'space-between'}>
                    <NumberInput focusBorderColor={'accent'}>
                      <NumberInputField
                        max={Number(12)}
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
                  REPAY & WITHDRAW
                </Button>
              </ButtonContainer>
            </VStack>
          </ModalBody>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
