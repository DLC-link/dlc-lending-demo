import { Text, VStack, keyframes } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TutorialStep } from '../enums/TutorialSteps';
import { toggleDepositModalVisibility } from '../store/componentSlice';
import TutorialBox from './TutorialBox';

export default function SetupLoanButton() {
  const dispatch = useDispatch();
  const { tutorialOn, tutorialStep } = useSelector((state) => state.tutorial);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const isTutorialStepMatches = tutorialStep === TutorialStep.SETUPLOAN;
    setShowTutorial(tutorialOn && isTutorialStepMatches);
  }, [tutorialOn, tutorialStep]);

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

  const SetupLoanButtonContainer = ({ children }) => (
    <VStack
      height={350}
      width={250}
      borderRadius='lg'
      shadow='dark-lg'
      padding={15}
      bgGradient='linear(to-br, background1, transparent)'
      backgroundPosition='right'
      backgroundSize='200%'
      justifyContent='center'
      color='white'
      transition='all .25s ease'
      animation={
        showTutorial
          ? `
                  ${glowAnimation} 5 1s
              `
          : ''
      }
      _hover={{
        bg: 'accent',
        color: 'white',
        cursor: 'pointer',
        transition: '0.5s',
        transform: 'translateY(-35px)',
      }}
      onClick={() => dispatch(toggleDepositModalVisibility(true))}>
      {children}
    </VStack>
  );

  return (
    <VStack>
      <SetupLoanButtonContainer>
        <Text fontSize='9xl'>+</Text>
        <Text
          fontSize='3xl'
          fontWeight='bold'
          color='inherit'
          textAlign='center'>
          SETUP LOAN
        </Text>
      </SetupLoanButtonContainer>
      {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
    </VStack>
  );
}
