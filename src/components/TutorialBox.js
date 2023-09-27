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
    ConnectWallet: (
      <Text>
        Welcome to
        <br />
        <strong>DLC.Link's Lending Demo!</strong>
        <br />
        Please connect your wallet to proceed.
        <br />
        <br />
        <i>Note that a Leather account is required for BTC transactions.</i>
      </Text>
    ),
    SelectNetwork: (
      <Text>
        Begin by choosing a <strong>wallet</strong> and a <strong>network</strong> for establishing a connection.
      </Text>
    ),

    SetupLoan: (
      <Text>
        You're now <strong>connected</strong>! Let's set up a <strong>vault</strong> on your chosen network.
      </Text>
    ),

    SetCollateral: (
      <Text>
        Select the amount of <strong>BTC</strong> to use as collateral. Click the button to send the{' '}
        <strong>vault</strong> request to the blockchain.
      </Text>
    ),

    WaitForSetup: (
      <Text>
        'Your <strong>vault</strong> setup is in progress. Please wait for confirmation.
      </Text>
    ),

    FundLoan: (
      <Text>
        Your <strong>vault</strong> is now ready. To proceed, simply click the button to utilize your{' '}
        <strong>BTC</strong> as collateral for the <strong>DLC</strong>. <i>Leather</i> will request confirmation.
      </Text>
    ),

    WaitForConfirmation: (
      <Text>
        Your <strong>vault</strong> is being funded. Kindly wait for confirmation.
      </Text>
    ),

    BorrowRepay: (
      <Text>
        Your <strong>vault</strong> is <strong>funded</strong>, and you can now <strong>borrow</strong> or{' '}
        <strong>repay</strong> your loan. If you repay your loan, you can <strong>close</strong> the vault. If{' '}
        <i>collateral to debt ratio</i> falls under the <i>liquidation ratio</i>, you can <strong>liquidate</strong> the{' '}
        <strong>vault</strong>.
      </Text>
    ),

    WaitForClose: (
      <Text>
        Your <strong>vault</strong> is being <strong>closed</strong>. Please wait for confirmation.
      </Text>
    ),

    EndFlow: (
      <Text>
        <strong>Congratulations!</strong> You've successfully <strong>closed</strong> your <strong>vault</strong>, and
        your <strong>BTC</strong> has been <strong>returned</strong> to your wallet.
      </Text>
    ),
  };

  const TutorialContainer = ({ children }) => {
    return (
      <VStack
        width={250}
        padding={2.5}
        background={'rgba(0, 9, 51, 0.25)'}
        border={'1px solid #07E8D8'}
        borderRadius={'lg'}>
        {children}
      </VStack>
    );
  };

  const TutorialInfo = () => {
    return TutorialTextMap[tutorialStep];
  };

  const TutorialBoxWithArrowUp = () => {
    return (
      <VStack
        marginTop={15}
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
        marginBottom={15}
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
