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
  Spacer,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  customShiftValue,
  fixedTwoDecimalShift,
  fixedTwoDecimalUnshift,
  countCollateralToDebtRatio,
  formatCollateralInUSD,
  formatBitcoinInUSDAmount,
} from '../utils';
import { repayStacksLoanContract } from '../blockchainFunctions/stacksFunctions';
import { repayEthereumLoan } from '../blockchainFunctions/ethereumFunctions';

export default function RepayModal({
  isOpen,
  closeModal,
  walletType,
  vaultLoanAmount,
  BTCDeposit,
  uuid,
  creator,
  blockchain,
  id
}) {
  const [additionalRepay, setAdditionalRepay] = useState();
  const [collateralToDebtRatio, setCollateralToDebtRatio] = useState();
  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();
  const [collateralAmount, setCollateralAmount] = useState(customShiftValue(BTCDeposit, 8, true));
  const [USDAmount, setUSDAmount] = useState(0);
  const [isLoanError, setLoanError] = useState(true);
  const [isCollateralToDebtRatioError, setCollateralToDebtRatioError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await fetchBitcoinPrice();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setUSDAmount(formatCollateralInUSD(collateralAmount, bitCoinInUSDAsNumber));
    setCollateralToDebtRatio(
      countCollateralToDebtRatio(collateralAmount, bitCoinInUSDAsNumber, vaultLoanAmount, -additionalRepay)
    );
    setLoanError(additionalRepay < 1 || additionalRepay === undefined);
    setCollateralToDebtRatioError(collateralToDebtRatio < 140);
  }, [additionalRepay, collateralToDebtRatio, isCollateralToDebtRatioError]);

  const handleRepayChange = (additionalRepay) => {
    setAdditionalRepay(additionalRepay.target.value);
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

  const repayLoanContract = async () => {
    switch (walletType) {
      case 'hiro':
      case 'xverse':
        repayStacksLoanContract(creator, uuid, additionalRepay, blockchain);
        break;
      case 'metamask':
        repayEthereumLoan(uuid, additionalRepay, blockchain)
        break;
      default:
        console.error('Unsupported wallet type!');
        break;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isCentered>
      <ModalOverlay />
      <ModalContent
        color='white'
        width={350}>
        <ModalHeader
          bgGradient='linear(to-r, primary1, primary2)'
          bgClip='text'
          textAlign='center'>
          Repay USDC
        </ModalHeader>
        <ModalCloseButton
          _focus={{
            boxShadow: 'none',
          }}
        />
        <ModalBody>
          <Text
            bgGradient='linear(to-r, primary1, primary2)'
            bgClip='text'
            textAlign='center'
            fontSize='md'>
            Collateral Amount
          </Text>
          <Flex
            marginLeft={25}
            marginRight={25}
            alignItems='center'
            paddingBottom={15}>
            <Text
              bgGradient='linear(to-r, primary1, primary2)'
              bgClip='text'
              fontSize='md'>
              {customShiftValue(BTCDeposit, 8, true)}
            </Text>
            <Spacer></Spacer>
            <Image
              src='/btc_logo.png'
              alt='Bitcoin Logo'
              width={25}
              height={25}></Image>
          </Flex>
          <Text
            fontSize='x-small'
            color='gray'
            textAlign='center'>
            ${USDAmount} at 1 BTC = ${bitCoinInUSDAsString}
          </Text>
          <FormControl isInvalid={isLoanError}>
            <FormLabel textAlign='center'>Repay Amount</FormLabel>
            {!isLoanError ? (
              <FormHelperText
                fontSize='x-small'
                paddingBottom={15}
                textAlign='center'>
                Enter the amount of USDC you would like to repay.
              </FormHelperText>
            ) : (
              <FormErrorMessage
                fontSize='x-small'
                paddingBottom={15}
                justifyContent='center'>
                Enter a valid amount of USDC
              </FormErrorMessage>
            )}
            <Flex
              direction='row'
              marginLeft={25}
              marginRight={25}
              alignItems='center'
              paddingBottom={15}>
              <NumberInput>
                <NumberInputField
                  bgGradient='linear(to-r, primary1, primary2)'
                  bgClip='text'
                  value={additionalRepay}
                  width={200}
                  onChange={handleRepayChange}
                />
              </NumberInput>
              <Spacer></Spacer>
              <Image
                src='/usdc_logo.png'
                alt='USD Coin Logo'
                width={25}
                height={25}></Image>
            </Flex>
          </FormControl>
          <Flex
            direction='row'
            marginLeft={25}
            marginRight={25}
            alignItems='center'
            paddingBottom={15}>
            <Text
              fontSize='sm'
              color='gray'>
              Collateral to debt ratio:
            </Text>
            <Spacer></Spacer>
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
          </Flex>
          <Flex
            direction='row'
            marginLeft={25}
            marginRight={25}
            alignItems='center'
            paddingBottom={15}>
            <Text
              fontSize='sm'
              color='gray'>
              Already borrowed:
            </Text>
            <Spacer></Spacer>
            <Text
              fontSize='sm'
              color='gray'>
              {'$ ' + customShiftValue(vaultLoanAmount, 6, true)}
            </Text>
          </Flex>
          <Flex justifyContent='center'>
            <Button
              _hover={{
                color: 'white',
                bg: 'accent',
              }}
              background='white'
              bgGradient='linear(to-r, primary1, primary2)'
              bgClip='text'
              width='150px'
              shadow='2xl'
              variant='outline'
              fontSize='sm'
              fontWeight='bold'
              type='submit'
              onClick={repayLoanContract}>
              Repay USDC
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
