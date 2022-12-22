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
  Tabs,
  TabPanel,
  TabPanels,
  Spacer,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { customShiftValue, fixedTwoDecimalShift, fixedTwoDecimalUnshift } from '../utils';
import { StacksMocknet } from '@stacks/network';
import { uintCV } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { ethers } from 'ethers';
import { abi as loanManagerABI } from '../loanManagerABI';
import eventBus from '../EventBus';
import { Spa } from '@mui/icons-material';
import {
  broadcastTransaction,
  createAssetInfo,
  FungibleConditionCode,
  makeContractCall,
  makeContractFungiblePostCondition,
  makeStandardFungiblePostCondition,
  SignedContractCallOptions,
} from '@stacks/transactions';

export default function BorrowRepayModal({
  isOpen,
  closeModal,
  walletType,
  vaultLoanAmount,
  BTCDeposit,
  uuid,
  creator,
}) {
  const [loan, setLoan] = useState(vaultLoanAmount);
  const [additionalLoan, setAdditionalLoan] = useState();
  const [loanSum, setLoanSum] = useState();
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
    countUSDAmount();
    countCollateralToDebtRatio();
    setLoanError(additionalLoan < 1 || additionalLoan === undefined);
    setCollateralToDebtRatioError(collateralToDebtRatio < 140);
  }, [additionalLoan, collateralToDebtRatio, isCollateralToDebtRatioError]);

  const handleLoanChange = (additionalLoan) => {
    setAdditionalLoan(additionalLoan.target.value);
  };

  const fetchBitcoinPrice = async () => {
    await fetch('/.netlify/functions/get-bitcoin-price', {
      headers: { accept: 'Accept: application/json' },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        const bitcoinValue = Number(msg.bpi.USD.rate.replace(/[^0-9.-]+/g, ''));
        setBitCoinInUSDAsNumber(bitcoinValue);
        setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinValue));
      });
  };

  const countCollateralToDebtRatio = () => {
    const collateralInUSD = collateralAmount * bitCoinInUSDAsNumber;
    const collateralToDebtRatio = collateralInUSD / (loan + additionalLoan);
    setCollateralToDebtRatio(Math.round(collateralToDebtRatio * 100));
  };

  const countUSDAmount = () => {
    setUSDAmount(new Intl.NumberFormat().format(bitCoinInUSDAsNumber * collateralAmount));
  };

  const getStacksLoanIDByUUID = async () => {
    let loanContractID = undefined;
    await fetch('/.netlify/functions/get-stacks-loan-id-by-uuid?uuid=' + uuid + '&creator=' + creator, {
      headers: { accept: 'Accept: application/json' },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        loanContractID = msg;
      });
    return loanContractID;
  };

  const borrowLoanContract = async () => {
    switch (walletType) {
      case 'hiro':
        borrowStacksLoanContract();
        break;
      case 'metamask':
        break;
      default:
        console.log('Unsupported wallet type!');
        break;
    }
  };

  const contractAddress = creator;
  const postConditionCode = FungibleConditionCode.GreaterEqual;
  const postConditionAmount = 1;
  const assetAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const assetContractName = 'dlc-stablecoin';
  const assetName = 'dlc-stablecoin';
  const fungibleAssetInfo = createAssetInfo(assetAddress, assetContractName, assetName);

  const contractFungiblePostCondition = makeContractFungiblePostCondition(
    contractAddress,
    process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
    postConditionCode,
    postConditionAmount,
    fungibleAssetInfo
  );

  function populateTxOptions(loanID, additionalLoan) {
    const network = new StacksMocknet({ url: 'http://localhost:3999' });
    return {
      contractAddress: process.env.REACT_APP_STACKS_CONTRACT_ADDRESS,
      contractName: process.env.REACT_APP_STACKS_SAMPLE_CONTRACT_NAME,
      functionName: 'borrow',
      functionArgs: [uintCV(loanID || 0), uintCV(fixedTwoDecimalUnshift(additionalLoan))],
      postConditions: [contractFungiblePostCondition],
      validateWithAbi: true,
      network,
      fee: 100000,
      anchorMode: 1,
    };
  }

  const borrowStacksLoanContract = async () => {
    const loanContractID = await getStacksLoanIDByUUID(uuid);
    openContractCall(populateTxOptions(loanContractID, additionalLoan)
      // onFinish: (data) => {
      //   console.log('onFinish:', data);
      //   eventBus.dispatch('loan-event', {
      //     status: 'borrow-requested',
      //     txId: data.txId,
      //   });
      //   closeModal();
      // },
      // onCancel: () => {
      //   console.log('onCancel:', 'Transaction was canceled');
      // },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isCentered>
      <ModalOverlay />
      <Tabs>
        <TabPanels>
          <TabPanel>
            <ModalContent
              color='white'
              width={350}>
              <ModalHeader
                bgGradient='linear(to-r, primary1, primary2)'
                bgClip='text'
                textAlign='center'>
                Borrow USDC
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
                  <FormLabel textAlign='center'>Borrow Amount</FormLabel>
                  {!isLoanError ? (
                    <FormHelperText
                      fontSize='x-small'
                      paddingBottom={15}
                      textAlign='center'>
                      Enter the amount of USDC you would like to loan.
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
                        value={additionalLoan}
                        width={200}
                        onChange={handleLoanChange}
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
                    {'$ ' + fixedTwoDecimalShift(loan)}
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
                    onClick={borrowLoanContract}>
                    Borrow USDC
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Modal>
  );
}