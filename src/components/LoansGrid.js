/*global chrome*/

import React from 'react';
import { VStack, HStack, Collapse, SimpleGrid, ScaleFade } from '@chakra-ui/react';
import Card from './Cards/Card';
import SetupLoanCard from './Cards/SetupLoanCard';
import { useSelector } from 'react-redux';
import { selectAllLoans } from '../store/loansSlice';
import { motion } from 'framer-motion';

export default function LoansGrid() {
  const loans = useSelector(selectAllLoans);
  const address = useSelector((state) => state.account.address);
  const isLoading = useSelector((state) => state.loans.status === 'loading');

  return (
    <>
      <Collapse in={address}>
        <VStack
          justifyContent='center'
          alignContent='center'>
          <HStack></HStack>
          <ScaleFade in={!isLoading}>
            <SimpleGrid
              columns={[1, 4]}
              spacing={[0, 15]}>
              <SetupLoanCard></SetupLoanCard>
              {loans?.map((loan, i) => (
                <motion.div
                  key={`${loan.uuid ? loan.uuid : i}${loan.status}`}
                  whileHover={{
                    scale: 1.025,
                    transition: { duration: 0.5 },
                  }}
                  initial={{ x: -300, border: '5px dashed rgba(255,255,255, 0.1)', borderRadius: '25px' }}
                  animate={{ x: 0, border: '0px' }}
                  exit={{ x: 300 }}>
                  <Card
                    key={i}
                    loanUUID={loan.uuid}></Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </ScaleFade>
        </VStack>
      </Collapse>
    </>
  );
}
