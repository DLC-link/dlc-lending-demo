import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Text,
  VStack,
} from '@chakra-ui/react';

import store from '../store/store';
import { ethers } from 'ethers';

import { useEffect, useState } from 'react';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '../hooks/hooks';

import { formatCollateralInUSD, customShiftValue } from '../utilities/utils';

import { depositToVault } from '../blockchainFunctions/ethereumFunctions';
import { borrowStacksLoan } from '../blockchainFunctions/stacksFunctions';
import {
  fetchBitcoinValue,
  fetchDlcBtcBalance,
  fetchOutstandingDebt,
  fetchVaultReserves,
} from '../store/externalDataSlice';

import { ButtonContainer } from '../components/ActionButtons';
import { useOnMount } from '../hooks/useOnMount';
import { toggleBorrowModalVisibility } from '../store/componentSlice';

export default function BorrowModal() {
  const dispatch = useDispatch();
  const loan = useSelector((state) => state.component.loanForModal);
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const isBorrowModalOpen = useSelector((state) => state.component.isBorrowModalOpen);
  const walletType = useSelector((state) => state.account.walletType);
  const dlcBtcBalance = useSelector((state) => state.externalData.dlcBtcBalance);
  const outstandingDebt = useSelector((state) => state.externalData.outstandingDebt);
  const vaultReserves = useSelector((state) => state.externalData.vaultReserves);

  const [additionalLoan, setAdditionalLoan] = useState(0);
  // const [collateralToDebtPercentage, setCollateralToDebtPercentage] = useState();
  const [USDAmount, setUSDAmount] = useState(0);

  const [isLoanError, setLoanError] = useState(false);
  const [isOverBalance, setIsOverBalance] = useState(false);
  const [assetsToDeposit, setAssetsToDeposit] = useState(0);
  const [isVaultBalanceHighEnough, setIsVaultBalanceHighEnough] = useState(false);

  useOnMount(() => {
    dispatch(fetchBitcoinValue());
    dispatch(fetchDlcBtcBalance());
    dispatch(fetchOutstandingDebt());
    dispatch(fetchVaultReserves());
  });

  useEffect(() => {
    setUSDAmount(formatCollateralInUSD(dlcBtcBalance, bitcoinUSDValue));
    setLoanError(additionalLoan < 1 || additionalLoan === undefined || isOverBalance || !isVaultBalanceHighEnough);
  }, [additionalLoan, dlcBtcBalance, bitcoinUSDValue, isOverBalance, isVaultBalanceHighEnough]);

  useEffect(() => {
    const _assetsToDeposit = (Number(additionalLoan) / Number(bitcoinUSDValue)) * 100000000;
    // console.log(
    //   Number(additionalLoan),
    //   Number(bitcoinUSDValue),
    //   _assetsToDeposit,
    //   _assetsToDeposit.toFixed(0),
    //   dlcBtcBalance
    // );
    setAssetsToDeposit(_assetsToDeposit.toFixed(0));
    setIsOverBalance(_assetsToDeposit > customShiftValue(dlcBtcBalance, 8));
    setIsVaultBalanceHighEnough(additionalLoan < parseInt(vaultReserves));
  }, [additionalLoan, bitcoinUSDValue, dlcBtcBalance, vaultReserves]);

  const handleLoanChange = (additionalLoan) => {
    setAdditionalLoan(additionalLoan.target.value);
  };

  const borrowLoanContract = async () => {
    store.dispatch(toggleBorrowModalVisibility({ isOpen: false }));
    switch (walletType) {
      case 'leather':
      case 'xverse':
        await borrowStacksLoan(loan.uuid, additionalLoan);
        break;
      case 'metamask':
        await depositToVault(assetsToDeposit);
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
          Available dlcBTC for Deposit
        </Text>
        <HStack
          paddingBottom={2.5}
          width={250}
          justifyContent={'space-between'}>
          <Text
            width={200}
            fontSize={'md'}
            color='white'>
            {dlcBtcBalance}
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
            dlcBTC to Deposit:
          </Text>
          <Text
            fontSize={'sm'}
            color={!isOverBalance ? 'accent' : 'warning'}>
            {ethers.utils.formatUnits(assetsToDeposit, 8)}
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
            Already borrowed (user):
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
            Vault USDC Reserves:
          </Text>
          <Text
            width={150}
            textAlign={'right'}
            fontSize='xs'
            color={isVaultBalanceHighEnough ? 'white' : 'warning'}>
            $ {new Intl.NumberFormat().format(parseInt(vaultReserves))}
          </Text>
        </HStack>
      </>
    );
  };

  return (
    <Modal
      isOpen={isBorrowModalOpen}
      onClose={() => dispatch(toggleBorrowModalVisibility({ isOpen: false }))}
      isCentered>
      <ModalOverlay />
      <ModalContent
        width={350}
        background={'transparent'}>
        <VStack
          padding={25}
          spacing={5}
          background={'background2'}
          justifyContent={'space-evenly'}
          color={'accent'}
          border={'1px'}
          borderRadius={'lg'}>
          <VStack>
            <Text variant={'header'}>Borrow USDC</Text>
            <CollateralAmountInfo />
            <VStack>
              <FormControl isInvalid={isLoanError}>
                <FormLabel
                  margin={0}
                  width={250}
                  color={'header'}
                  textAlign={'left'}
                  fontWeight={'bold'}>
                  Borrow Amount
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
                    Enter the amount of <strong>USDC</strong> you would like to borrow.
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
                      width={200}
                      color={'white'}
                      value={additionalLoan}
                      onChange={handleLoanChange}
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
                onClick={() => borrowLoanContract()}>
                Deposit & Borrow
              </Button>
            </ButtonContainer>
          </VStack>
        </VStack>
      </ModalContent>
    </Modal>
  );
}
