import React from 'react';
import { Text, Collapse, VStack, IconButton, HStack } from '@chakra-ui/react';
import LoansGrid from './LoansGrid';
import Balance from '../components/Balance';
import { RefreshOutlined } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLoans } from '../store/loansSlice';
import { fetchBitcoinValue } from '../store/externalDataSlice';
import { useOnMount } from '../hooks/useOnMount';

export default function LoansScreen() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loans.status === 'loading');
  const address = useSelector((state) => state.account.address);

  useOnMount(() => {
    refreshLoansTable();
  });

  const refreshLoansTable = () => {
    console.log('refreshing loans table');
    dispatch(fetchLoans(address));
    dispatch(fetchBitcoinValue());
  };

  return (
    <>
      <Collapse in={address}>
        <VStack marginBottom='50px'>
          <HStack>
            <IconButton
              variant='outline'
              isLoading={isLoading}
              height='35px'
              width='35px'
              borderRadius='lg'
              borderColor='white'
              color='white'
              icon={<RefreshOutlined color='inherit' />}
              onClick={() => refreshLoansTable()}
              _hover={{
                borderColor: 'accent',
                color: 'accent',
                transform: 'translateY(-2.5px)',
              }}
            />
            <Text
              fontSize='3xl'
              fontWeight='extrabold'>
              BITCOIN LOANS
            </Text>
          </HStack>
          <Balance />
        </VStack>
        <LoansGrid isLoading={isLoading} />
      </Collapse>
    </>
  );
}
