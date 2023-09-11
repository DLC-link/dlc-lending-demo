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
  Spacer,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { customShiftValue, formatCollateralInUSD } from '../utilities/utils';
import { sendLoanContractToEthereum } from '../blockchainFunctions/ethereumFunctions';
import { sendLoanContractToStacks } from '../blockchainFunctions/stacksFunctions';
import { fetchBitcoinPrice } from '../blockchainFunctions/bitcoinFunctions';
import { useSelector } from 'react-redux';
import { toggleDepositModalVisibility } from '../store/componentSlice';
import { useDispatch } from 'react-redux';
import { TutorialStep } from '../enums/TutorialSteps';
import TutorialBox from '../components/TutorialBox';
import { keyframes } from '@chakra-ui/react';
export default function DepositModal() {
  const [collateralAmount, setCollateralAmount] = useState(undefined);
  const [isCollateralError, setCollateralError] = useState(true);
  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [bitCoinInUSDAsNumber, setBitCoinInUSDAsNumber] = useState();
  const [USDAmount, setUSDAmount] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const walletType = useSelector((state) => state.account.walletType);
  const isDepositModalOpen = useSelector((state) => state.component.isDepositModalOpen);
  const dispatch = useDispatch();
  const { tutorialStep } = useSelector((state) => state.tutorial);

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
    setShowTutorial(tutorialStep === TutorialStep.SETCOLLATERAL);
  }, [tutorialStep]);

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
    attestorCount: 3,
  });

  const sendLoanContract = (loanContract) => {
    switch (walletType) {
      case 'leather':
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

  const glowAnimation = keyframes`
  0% {
      box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  }
  50% {
      box-shadow: 0px 0px 100px rgba(7, 232, 216, 0.5);
  }
  100% {
      box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
}
  }
  `;

  return (
    <Modal
      isOpen={isDepositModalOpen}
      onClose={() => dispatch(toggleDepositModalVisibility(false))}
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
            <Text variant={'header'}>Request Loan</Text>
            <FormControl isInvalid={isCollateralError}>
              <VStack width={350}>
                <FormLabel
                  color={'white'}
                  textAlign={'left'}
                  width={250}
                  fontWeight={'bold'}
                  margin={0}>
                  Collateral Amount
                </FormLabel>
                {!isCollateralError ? (
                  <FormHelperText
                    fontSize={'2xs'}
                    textAlign={'left'}
                    width={250}
                    height={25}
                    color='accent'>
                    Enter the amount of <strong>BTC</strong> you would like to deposit.
                  </FormHelperText>
                ) : (
                  <FormErrorMessage
                    fontSize={'2xs'}
                    textAlign={'left'}
                    width={250}
                    height={25}>
                    Enter a valid amount of&nbsp;
                    <strong>BTC</strong>
                  </FormErrorMessage>
                )}
                <HStack
                  width={250}
                  justifyContent={'space-between'}
                  paddingBottom={2.5}>
                  <NumberInput focusBorderColor='accent'>
                    <NumberInputField
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
                <HStack
                  justifyContent={'space-between'}
                  width={250}>
                  <Text
                    fontSize='xs'
                    color='white'
                    fontWeight={'extrabold'}
                    width={125}>
                    ${USDAmount}
                  </Text>
                  <Text
                    textAlign={'right'}
                    fontSize='xs'
                    color='white'
                    width={150}>
                    at 1 <strong>BTC</strong> $&nbsp;
                    {bitCoinInUSDAsString}
                  </Text>
                </HStack>
              </VStack>
            </FormControl>
            <VStack justifyContent='center'>
              <Text
                width={250}
                textAlign={'justify'}
                paddingTop={5}
                color={'#FF4500'}>
                You have 3 minutes to lock in your BTC after setting up the loan, or the offer will expire.
              </Text>
              <Button
                animation={
                  showTutorial
                    ? `
                                            ${glowAnimation} 5 1s
                                        `
                    : ''
                }
                width={250}
                variant='outline'
                type='submit'
                onClick={() => createAndSendLoanContract()}>
                REQUEST VAULT
              </Button>
            </VStack>
          </VStack>
        </VStack>
        {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
      </ModalContent>
    </Modal>
  );
}
