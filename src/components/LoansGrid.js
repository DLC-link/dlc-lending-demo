/*global chrome*/

import React from 'react';
import { Flex, Collapse, SimpleGrid, ScaleFade } from '@chakra-ui/react';
import Card from './Card';
import { useSelector } from 'react-redux';
import SetupLoanButton from './SetupLoanButton';
import { useDispatch } from 'react-redux';
import { fetchBitcoinValue } from '../store/externalDataSlice';
import { useOnMount } from '../hooks/useOnMount';
import { useLoans } from '../hooks/useLoans';

export default function LoansGrid() {
  const dispatch = useDispatch();
  const loans = useLoans();
  const address = useSelector((state) => state.account.address);
  const isLoading = useSelector((state) => state.loans.status === 'loading');

  useOnMount(() => {
    const updateBitcoinUSDValue = async () => {
      dispatch(fetchBitcoinValue());
    };
    updateBitcoinUSDValue();
  });

  return (
    <>
      <Collapse in={address}>
        <Flex
          justifyContent='center'
          alignContent='center'>
          <ScaleFade in={!isLoading}>
            <SimpleGrid
              columns={[1, 2, 3, 4, 5]}
              spacing={50}
              padding={25}>
              <SetupLoanButton />
              {loans?.map((loan) => (
                <Card
                  key={`${loan.uuid}${loan.status}${loan.vaultLoan}`}
                  loan={loan}
                />
              ))}
            </SimpleGrid>
          </ScaleFade>
        </Flex>
      </Collapse>
    </>
  );
}
