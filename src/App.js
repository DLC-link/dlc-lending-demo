import SelectWalletModal from './modals/SelectWalletModal';
import Header from './components/Header';
import Intro from './components/Intro';
import React, { useEffect } from 'react';
import DepositModal from './modals/DepositModal';
import { Box, Collapse, useToast } from '@chakra-ui/react';
import CustomToast from './components/CustomToast';
import { useSelector } from 'react-redux';
import LoansScreen from './components/LoansScreen';
import BorrowModal from './modals/BorrowModal';
import RepayModal from './modals/RepayModal';

/* global BigInt */

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function App() {
  const toast = useToast();

  const address = useSelector((state) => state.account.address);
  const blockchain = useSelector((state) => state.account.blockchain);
  const toastEvent = useSelector((state) => state.loans.toastEvent);

  const handleToast = (toastEvent) => {
    if (!toast.isActive(toastEvent.status)) {
      return toast({
        id: toastEvent.status,
        render: () => (
          <CustomToast
            txHash={toastEvent.txHash}
            blockchain={blockchain}
            status={toastEvent.status}
          />
        ),
      });
    }
  };

  useEffect(() => {
    if (toastEvent !== null) {
      handleToast(toastEvent);
    }
  }, [toastEvent, handleToast]);

  return (
    <>
      <Box>
        <Header isConnected={address} />
        <DepositModal />
        <RepayModal />
        <BorrowModal />
        {/* <RepayModal/> */}
        <SelectWalletModal />
        <Intro />
        {address && <LoansScreen isConnected={address} />}
      </Box>
    </>
  );
}
