import React, { useEffect } from 'react';
import { Text, Collapse, VStack, IconButton, HStack } from '@chakra-ui/react';
import LoansGrid from './LoansGrid';
import Balance from '../components/Balance';
import { RefreshOutlined } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLoans, selectAllLoans } from '../store/loansSlice';
import { fetchBitcoinValue } from '../store/externalDataSlice';

export default function LoansScreen() {
  const dispatch = useDispatch();
  const loans = useSelector(selectAllLoans);
  const loansStoreStatus = useSelector((state) => state.loans.status);
  const isLoading = useSelector((state) => state.loans.status === 'loading');
  const address = useSelector((state) => state.account.address);

  useEffect(() => {
    if (loansStoreStatus === 'idle' && loans.length === 0 && address) {
      refreshLoansTable(false);
    }
  }, [address, loansStoreStatus, loans.length]);

  const refreshLoansTable = async (isManual) => {
    dispatch(fetchLoans(address));
    dispatch(fetchBitcoinValue());
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
              BITCOIN LOANS
            </Text>
          </HStack>
          <Balance></Balance>
        </VStack>
        <LoansGrid isLoading={isLoading}></LoansGrid>
      </Collapse>
    </>
  );
}
