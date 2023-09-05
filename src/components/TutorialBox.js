import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { VStack, Text } from '@chakra-ui/react';
import { keyframes } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { TutorialStep } from '../enums/TutorialSteps';
import { useEffect, useState } from 'react';

export default function TutorialBox() {
  const { tutorialStep } = useSelector((state) => state.tutorial);
  const [arrowDirection, setArrowDirection] = useState(undefined);

  const bounceAnimation = keyframes`
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0);
    }
    }
    `;

  useEffect(() => {
    setArrowDirection(
      [
        TutorialStep.CONNECTWALLET,
        TutorialStep.SETUPLOAN,
        TutorialStep.SETCOLLATERAL,
        TutorialStep.WAITFORSETUP,
        TutorialStep.FUNDLOAN,
        TutorialStep.WAITFORCONFIRMATION,
        TutorialStep.BORROWREPAY,
        TutorialStep.WAITFORCLOSE,
        TutorialStep.ENDFLOW,
      ].includes(tutorialStep)
        ? 'up'
        : 'down'
    );
  }, [tutorialStep]);

  const TutorialTextMap = {
    ConnectWallet:
      "Welcome to DLC.Link's Lending Demo! Please connect your wallet to proceed. Note that a Leather account is required for BTC transactions.",

    SelectNetwork: 'Begin by choosing a wallet and a network for establishing a connection.',

    SetupLoan: "You're now connected! Let's set up a vault on your chosen network.",

    SetCollateral: `Select the amount of BTC to use as collateral. Click the button to send the vault request to the blockchain.`,

    WaitForSetup: 'Your vault setup is in progress. Please wait for confirmation.',

    FundLoan:
      'Your vault is now ready. To proceed, simply click the button to utilize your BTC as collateral for the DLC. Leather will request confirmation.',

    WaitForConfirmation: 'Your vault is being funded. Kindly wait for confirmation.',

    BorrowRepay:
      'Your vault is funded, and you can now borrow or repay your loan. If you repay your loan, you can close the vault. If collateral to debt ratio falls under the liquidation ratio, you can liquidate the vault. ',

    WaitForClose: 'Your vault is being closed. Please wait for confirmation.',

    EndFlow: "Congratulations! You've successfully closed your vault, and your BTC has been returned to your wallet.",
  };

  const TutorialContainer = ({ children }) => {
    return (
      <VStack
        width={225}
        padding={2.5}
        background={'rgba(0, 9, 51, 0.25)'}
        border={'1px solid #07E8D8'}
        borderRadius={'lg'}>
        {children}
      </VStack>
    );
  };

  const TutorialInfo = () => {
    return <Text variant={'tutorial'}>{TutorialTextMap[tutorialStep]}</Text>;
  };

  const TutorialBoxWithArrowUp = () => {
    return (
      <VStack
        animation={`
      ${bounceAnimation} infinite 1s
  `}>
        <ArrowUpIcon color={'secondary1'} />
        <TutorialContainer>
          <TutorialInfo />
        </TutorialContainer>
      </VStack>
    );
  };

  const TutorialBoxWithArrowDown = () => {
    return (
      <VStack
        animation={`
      ${bounceAnimation} infinite 1s
  `}>
        <TutorialContainer>
          <TutorialInfo />
        </TutorialContainer>
        <ArrowDownIcon color={'secondary1'} />
      </VStack>
    );
  };

  switch (arrowDirection) {
    case 'up':
      return <TutorialBoxWithArrowUp />;
    case 'down':
      return <TutorialBoxWithArrowDown />;
    default:
      return <></>;
  }
}
