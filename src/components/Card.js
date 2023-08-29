/*global chrome*/

import {
  Text,
  VStack,
  TableContainer,
  Tbody,
  Table,
  Flex,
  Tr,
  Td,
  Spacer,
  Spinner,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useOnMount } from '../hooks/useOnMount';

import { motion } from 'framer-motion';

import Status from './Status';
import { ActionButtons } from './ActionButtons';

import { calculateCollateralCoveragePercentageForLiquidation } from '../utilities/utils';
import { easyTruncateAddress } from '../utilities/utils';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';

export default function Card({ loan }) {
  const bitcoinUSDValue = useSelector((state) => state.externalData.bitcoinUSDValue);
  const { onCopy, hasCopied } = useClipboard(loan.uuid || '');
  const [canBeLiquidated, setCanBeLiquidated] = useState(false);

  console.log('loanUUID', loan.uuid);

  const cardInfo = [
    { label: 'UUID', value: loan.uuid && easyTruncateAddress(loan.uuid) },
    { label: 'Total Collateral', value: loan.formattedVaultCollateral },
    { label: 'Borrowed Amount', value: loan.formattedVaultLoan },
  ];

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

  const handleCopyClick = () => {
    onCopy();
  };

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
          size='sm'>
          <Tbody>
            {cardInfo.map((row, index) => (
              <Tr key={index}>
                <Td padding={(0, 1.5)}>
                  <Text variant='property'>{row.label}</Text>
                </Td>
                <Td width={5}>
                  {row.label === 'UUID' ? (
                    <Tooltip label={hasCopied ? 'UUID copied to clipboard!' : 'Click to copy the UUID!'}>
                      <Text
                        as={'a'}
                        variant='property'
                        onClick={() => handleCopyClick()}>
                        {row.value}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text>{row.value}</Text>
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
        />
        <CardTable />
        <Spacer />
        {[solidityLoanStatuses.NONE, clarityLoanStatuses.NONE].includes(loan.status) && <CardSpinner />}
        <ActionButtons
          loan={loan}
          canBeLiquidated={canBeLiquidated}
        />
      </CardContainer>
    </CardAnimation>
  );
}
