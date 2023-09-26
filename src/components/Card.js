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

import { motion } from 'framer-motion';

import { ActionButtons } from './ActionButtons';
import Status from './Status';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import { IconButton, keyframes } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TutorialStep } from '../enums/TutorialSteps';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import { hideLoan } from '../store/loansSlice';
import { calculateCollateralCoveragePercentageForLiquidation, easyTruncateAddress } from '../utilities/utils';
import TutorialBox from './TutorialBox';

const tutorialStepsForCards = [
  TutorialStep.WAITFORSETUP,
  TutorialStep.FUNDLOAN,
  TutorialStep.WAITFORCONFIRMATION,
  TutorialStep.BORROWREPAY,
  TutorialStep.WAITFORCLOSE,
  TutorialStep.ENDFLOW,
];

const OpenExplorerLink = (bitcoinExplorerURL) => {
  window.open(bitcoinExplorerURL, '_blank');
};

const ExternalLinkButton = ({ label, bitcoinExplorerURL, gutter }) => {
  return (
    <Tooltip
      label={label}
      gutter={gutter}
      placement={'top-end'}>
      <IconButton
        padding={0}
        margin={0}
        icon={<ExternalLinkIcon />}
        variant={'ghost'}
        boxSize={5}
        color='#07E8D8'
        _hover={{ background: 'transparent' }}
        onClick={() => OpenExplorerLink(bitcoinExplorerURL)}
      />
    </Tooltip>
  );
};

export default function Card({ loan }) {
  const dispatch = useDispatch();
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const [canBeLiquidated, setCanBeLiquidated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [includeFundingTX, setIncludeFundingTX] = useState(false);
  const [includeClosingTX, setIncludeClosingTX] = useState(false);

  const { tutorialOn, tutorialStep, tutorialLoanUUID } = useSelector((state) => state.tutorial);
  const { hiddenLoans } = useSelector((state) => state.loans);

  const bitcoinFundingTXExplorerURL = `${process.env.REACT_APP_BITCOIN_EXPLORER_API_URL}/tx/${loan.fundingTXHash}`;
  const bitcoinClosingTXExplorerURL = `${process.env.REACT_APP_BITCOIN_EXPLORER_API_URL}/tx/${loan.closingTXHash}`;

  const cardInfo = [
    { label: 'UUID', value: loan.uuid && easyTruncateAddress(loan.uuid) },
    { label: 'Collateral', value: loan.formattedVaultCollateral },
    { label: 'Borrowed', value: loan.formattedVaultLoan },
    {
      label: 'Funding TX',
      value: (
        <ExternalLinkButton
          label={'View funding transaction'}
          bitcoinExplorerURL={bitcoinFundingTXExplorerURL}
          gutter={150}
        />
      ),
    },
    {
      label: 'Closing TX',
      value: (
        <ExternalLinkButton
          label={'View closing transaction'}
          bitcoinExplorerURL={bitcoinClosingTXExplorerURL}
          gutter={186}
        />
      ),
    },
  ];

  useEffect(() => {
    if (
      [
        solidityLoanStatuses.PREFUNDED,
        clarityLoanStatuses.PREFUNDED,
        solidityLoanStatuses.FUNDED,
        clarityLoanStatuses.FUNDED,
        solidityLoanStatuses.PRECLOSED,
        clarityLoanStatuses.PRECLOSED,
        solidityLoanStatuses.CLOSED,
        clarityLoanStatuses.CLOSED,
      ].includes(loan.status)
    ) {
      setIncludeFundingTX(true);
    }
    if ([solidityLoanStatuses.CLOSED, clarityLoanStatuses.CLOSED].includes(loan.status)) {
      setIncludeClosingTX(true);
    }
  }, [loan]);

  useEffect(() => {
    const isTutorialLoanUUIDMatches = tutorialLoanUUID === loan.uuid;
    const isTutorialStepMatches = tutorialStepsForCards.includes(tutorialStep);

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

  const handleHide = () => {
    dispatch(hideLoan(loan.uuid));
  };

  useEffect(() => {
    const collateralCoveragePercentage = calculateCollateralCoveragePercentageForLiquidation(
      loan.vaultCollateral,
      bitcoinUSDValue,
      loan.vaultLoan
    );
    const isLiquidable = collateralCoveragePercentage < 140;
    setCanBeLiquidated(isLiquidable);
  }, [bitcoinUSDValue, loan.vaultCollateral, loan.vaultLoan]);

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
      <>
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
      </>
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
            {cardInfo.map((row, index) => {
              if (row.label === 'Funding TX' && !includeFundingTX) {
                return null;
              }
              if (row.label === 'Closing TX' && !includeClosingTX) {
                return null;
              }
              return (
                <Tr
                  key={index}
                  width={'100%'}
                  height={35}>
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
              );
            })}
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
      <VStack spacing={5}>
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
        </CardContainer>{' '}
      </VStack>
      <Button
        variant={'hide'}
        onClick={() => handleHide()}>
        {hiddenLoans.includes(loan.uuid) ? 'show' : 'hide'}
      </Button>
      {showTutorial && <TutorialBox tutorialStep={tutorialStep} />}
    </CardAnimation>
  );
}
