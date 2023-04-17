import SelectWalletModal from './modals/SelectWalletModal';
import eventBus from './EventBus';
import DepositWithdraw from './components/DepositWithdraw';
import Header from './components/Header';
import Intro from './components/Intro';
import React, { useEffect } from 'react';
import DepositModal from './modals/DepositModal';
import { Box, useToast } from '@chakra-ui/react';
import CustomToast from './components/CustomToast';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { closeDepositModal } from './store/componentSlice';
import LoansScreen from './components/LoansScreen';

/* global BigInt */

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function App() {
  const toast = useToast();
  const dispatch = useDispatch();
  const address = useSelector((state) => state.account.address);

  const handleEvent = (data) => {
    if (data.status === 'created') {
      dispatch(closeDepositModal());
    }
    if (!toast.isActive(data.status)) {
      return toast({
        id: data.status,
        position: 'right-top',
        render: () => <CustomToast data={data}></CustomToast>,
      });
    }
  };

  useEffect(() => {
    eventBus.on('loan-event', (data) => handleEvent(data));
  }, []);

  return (
    <>
      <Box
        height='auto'
        padding={0}>
        <Header isConnected={address}></Header>
        <DepositModal />
        <SelectWalletModal />
        <Intro isConnected={address}></Intro>
        {address && (
          <>
            <DepositWithdraw isConnected={address}></DepositWithdraw>
            <LoansScreen isConnected={address}></LoansScreen>
          </>
        )}
      </Box>
    </>
  );
}
