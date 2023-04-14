import React, { useEffect, useState } from 'react';
import { Text, Collapse, VStack, IconButton, HStack } from '@chakra-ui/react';
import LoansGrid from './LoansGrid';
import Balance from '../components/Balance';
import eventBus from '../EventBus';
import { RefreshOutlined } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLoans, selectAllLoans } from '../store/loansSlice';

export default function LoansPage() {
  const dispatch = useDispatch();
  const initialLoans = [];
  const loans = useSelector(selectAllVaults);
  const loansStoreStatus = useSelector((state) => state.vaults.status);
  const isLoading = useSelector((state) => state.vaults.status === 'loading');
  const address = useSelector((state) => state.account.address);

  const handleLoanEvent = (event) => {
    switch (event.status) {
      case 'NotReady':
        initialLoans.shift();
        break;
      case 'Initialized':
        initialLoans.push(event.loanContract);
        break;
      default:
        refreshLoansTable(false);
        break;
    }
  };

  useEffect(() => {
    if (loansStoreStatus === 'idle' && loans.length === 0 && address) {
      refreshLoansTable(false);
    }
  }, [address, loansStoreStatus, loans.length]);

  useEffect(() => {
    eventBus.on('loan-event', handleLoanEvent);
  }, [address]);

  const refreshLoansTable = async (isManual) => {
    dispatch(fetchLoans(address));
  };

  return (
    <>
      <Collapse in={address}>
        <VStack marginBottom='50px'>
          <HStack justifyContent='center'>
            <IconButton
              _hover={{
                borderColor: 'accent',
                color: 'accent',
                transform: 'translateY(-2.5px)',
              }}
              variant='outline'
              isLoading={isLoading}
              marginLeft='0px'
              height='35px'
              width='35px'
              borderRadius='lg'
              borderColor='white'
              color='white'
              icon={<RefreshOutlined color='inherit'></RefreshOutlined>}
              onClick={() => refreshLoansTable(true)}></IconButton>
            <Text
              fontSize='3xl'
              fontWeight='extrabold'>
              BITCOIN VAULTS
            </Text>
          </HStack>
          <Balance></Balance>
        </VStack>
        <LoansGrid
          isLoading={isLoading}
          initialLoans={initialLoans}></LoansGrid>
      </Collapse>
    </>
  );
}
