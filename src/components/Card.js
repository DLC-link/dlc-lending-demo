/*global chrome*/

import {
  Button,
  Flex,
  Spacer,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tooltip,
  Tr,
  VStack,
} from '@chakra-ui/react';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useOnMount } from '../hooks/useOnMount';

import { motion } from 'framer-motion';

import { ActionButtons } from './ActionButtons';
import Status from './Status';

import { keyframes } from '@chakra-ui/react';
import { useEffect } from 'react';
import { TutorialStep } from '../enums/TutorialSteps';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import { calculateCollateralCoveragePercentageForLiquidation, easyTruncateAddress } from '../utilities/utils';
import TutorialBox from './TutorialBox';

export default function Card({ loan }) {
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const [canBeLiquidated, setCanBeLiquidated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { tutorialOn, tutorialStep, tutorialLoanUUID } = useSelector((state) => state.tutorial);

  const cardInfo = [
    { label: 'UUID', value: loan.uuid && easyTruncateAddress(loan.uuid) },
    { label: 'Collateral', value: loan.formattedVaultCollateral },
    { label: 'Borrowed', value: loan.formattedVaultLoan },
  ];

  useEffect(() => {
    const isTutorialLoanUUIDMatches = tutorialLoanUUID === loan.uuid;

    const isTutorialStepMatches = [
      TutorialStep.WAITFORSETUP,
      TutorialStep.FUNDLOAN,
      TutorialStep.WAITFORCONFIRMATION,
      TutorialStep.BORROWREPAY,
      TutorialStep.WAITFORCLOSE,
      TutorialStep.ENDFLOW,
    ].includes(tutorialStep);

    const shouldShowTutorial = tutorialOn && isTutorialLoanUUIDMatches && isTutorialStepMatches;

    setShowTutorial(shouldShowTutorial);
  }, [tutorialOn, tutorialStep, tutorialLoanUUID, loan.uuid, loan.status]);

  const cardAnimationInitialState = {
    x: -300,
    border: '5px dashed rgba(255,255,255, 0.1)',
    borderRadius: '25px',
  };

  const cardAnimationMotionState = {
    x: 0,
    border: '0px',
  };

  const cardAnimationExitState = {
    x: 300,
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

  useOnMount(() => {
    const collateralCoveragePercentage = calculateCollateralCoveragePercentageForLiquidation(
      loan.vaultCollateral,
      bitcoinUSDValue,
      loan.vaultLoan
    );
    const isLiquidable = collateralCoveragePercentage < 140;
    setCanBeLiquidated(isLiquidable);
  });

  const CardAnimation = ({ children }) => {
    return (
      <motion.div
        whileHover={{
          scale: 1.025,
          transition: { duration: 0.5 },
        }}
        initial={cardAnimationInitialState}
        animate={cardAnimationMotionState}
        exit={cardAnimationExitState}>
        {children}
      </motion.div>
    );
  };

  const CardContainer = ({ children }) => {
    return (
      <VStack
        height={350}
        width={250}
        borderRadius='lg'
        shadow='dark-lg'
        padding={2.5}
        bgGradient='linear(to-br, background1, transparent)'
        backgroundPosition='right'
        backgroundSize='200%'
        transition='background-position 500ms ease'
        animation={
          showTutorial
            ? `
            ${glowAnimation} infinite 1s
        `
            : ''
        }
        justifyContent='center'
        _hover={{
          backgroundPosition: 'left',
        }}>
        {children}
      </VStack>
    );
  };

  const CardTable = () => {
    return (
      <TableContainer>
        <Table
          variant='unstyled'
          size={'sm'}
          maxWidth={'100%'}>
          <Tbody>
            {cardInfo.map((row, index) => (
              <Tr
                key={index}
                width={'100%'}>
                <Td width={45}>
                  <Text>{row.label}</Text>
                </Td>
                <Td width={170}>
                  {row.label === 'UUID' ? (
                    <Button
                      variant={'uuid'}
                      onClick={() => navigator.clipboard.writeText(loan.uuid)}>
                      <Tooltip
                        label={'Click to copy UUID'}
                        placement={'top'}>
                        <Text variant='value'>{row.value}</Text>
                      </Tooltip>
                    </Button>
                  ) : (
                    <Text variant={'value'}>{row.value}</Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    );
  };

  const CardSpinner = () => {
    return (
      <Flex padding={50}>
        <Spinner
          thickness={5}
          speed='1s'
          emptyColor='transparent'
          color='accent'
          size='xl'
        />
      </Flex>
    );
  };

  return (
    <CardAnimation>
      <CardContainer>
        <Status
          status={loan.status}
          canBeLiquidated={canBeLiquidated}
          txHash={loan.txHash}
        />
        <CardTable />
        <Spacer />
        {[solidityLoanStatuses.NONE, clarityLoanStatuses.NONE].includes(loan.status) && <CardSpinner />}
        <ActionButtons
          loan={loan}
          canBeLiquidated={canBeLiquidated}
        />
      </CardContainer>
      {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
    </CardAnimation>
  );
}
