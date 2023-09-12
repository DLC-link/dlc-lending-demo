import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
  keyframes,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendLoanContractToEthereum } from '../blockchainFunctions/ethereumFunctions';
import { sendLoanContractToStacks } from '../blockchainFunctions/stacksFunctions';
import TutorialBox from '../components/TutorialBox';
import { TutorialStep } from '../enums/TutorialSteps';
import { useOnMount } from '../hooks/useOnMount';
import { toggleDepositModalVisibility } from '../store/componentSlice';
import { fetchBitcoinValue } from '../store/externalDataSlice';
import { customShiftValue, formatCollateralInUSD } from '../utilities/utils';

export default function DepositModal() {
  const [collateralAmount, setCollateralAmount] = useState(undefined);
  const [isCollateralError, setCollateralError] = useState(true);
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const [bitCoinInUSDAsString, setBitCoinInUSDAsString] = useState();
  const [USDAmount, setUSDAmount] = useState('-');
  const [showTutorial, setShowTutorial] = useState(false);

  const walletType = useSelector((state) => state.account.walletType);
  const isDepositModalOpen = useSelector((state) => state.component.isDepositModalOpen);
  const dispatch = useDispatch();
  const { tutorialStep } = useSelector((state) => state.tutorial);

  useOnMount(() => {
    const updateBitcoinUSDValue = async () => {
      dispatch(fetchBitcoinValue());
    };
    updateBitcoinUSDValue();
    setBitCoinInUSDAsString(new Intl.NumberFormat().format(bitcoinUSDValue));
  });

  useEffect(() => {
    setShowTutorial(tutorialStep === TutorialStep.SETCOLLATERAL);
  }, [tutorialStep]);

  useEffect(() => {
    const collateralInUSD = formatCollateralInUSD(collateralAmount, bitcoinUSDValue);
    setUSDAmount(collateralInUSD == 0 ? '-' : collateralInUSD);
    setCollateralError(collateralAmount < 0.0001 || collateralAmount === undefined);
  }, [collateralAmount, bitcoinUSDValue]);

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
                  <Text
                    fontSize={'2xs'}
                    textAlign={'left'}
                    width={250}
                    height={25}
                    color='accent'>
                    Enter the amount of <strong>BTC</strong> you would like to deposit.
                  </Text>
                ) : (
                  <Text
                    fontSize={'2xs'}
                    textAlign={'left'}
                    width={250}
                    height={25}
                    color={'warning'}>
                    Enter a valid amount of&nbsp;
                    <strong>BTC</strong>
                  </Text>
                )}
                <HStack
                  width={250}
                  justifyContent={'space-between'}
                  paddingBottom={2.5}>
                  <NumberInput focusBorderColor='accent'>
                    <NumberInputField
                      width={200}
                      color={'white'}
                      value={collateralAmount}
                      onChange={handleCollateralChange}
                    />
                  </NumberInput>
                  <Image
                    src='/btc_logo.png'
                    alt='Bitcoin Logo'
                    boxSize={25}
                  />
                </HStack>
                <HStack
                  justifyContent={'space-between'}
                  width={250}>
                  <Text
                    fontSize={'xs'}
                    color={'white'}
                    fontWeight={'extrabold'}
                    width={125}>
                    ${USDAmount}
                  </Text>
                  <Text
                    textAlign={'right'}
                    fontSize={'xs'}
                    color={'white'}
                    width={150}>
                    at 1 <strong>BTC</strong> $&nbsp;
                    {bitCoinInUSDAsString}
                  </Text>
                </HStack>
              </VStack>
            </FormControl>
            <VStack justifyContent='center'>
              <Button
                animation={
                  showTutorial
                    ? `
                                            ${glowAnimation} 5 1s
                                        `
                    : ''
                }
                width={250}
                variant={'outline'}
                type={'submit'}
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
