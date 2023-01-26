import SelectWalletModal from './modals/SelectWalletModal';
import eventBus from './EventBus';
import DepositWithdraw from './components/DepositWithdraw';
import Header from './components/Header';
import Intro from './components/Intro';
import React, { useEffect } from 'react';
import DepositModal from './modals/DepositModal';
import DLCTable from './components/DLCTable';
import { Box, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import CustomToast from './components/CustomToast';

export default function App() {
  const [isConnected, setConnected] = useState(false);
  const [address, setAddress] = useState(undefined);
  const [walletType, setWalletType] = useState(undefined);
  const [isLoading, setLoading] = useState(true);
  const [isSelectWalletModalOpen, setSelectWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const toast = useToast();

  const handleEvent = (data) => {
    if (data.status === 'created') {
      onDepositModalClose();
    }
    if (!toast.isActive(data.status)) {
      return toast({
        id: data.status,
        position: 'right-top',
        render: () => <CustomToast data={data} walletType={walletType}></CustomToast>,
      });
    }
  };

  useEffect(() => {
    eventBus.on('is-account-connected', (data) => setConnected(data.isConnected));
    eventBus.on('wallet-type', (data) => setWalletType(data.walletType));
    eventBus.on('loan-event', (data) => handleEvent(data));
    eventBus.on('set-address', (data) => setAddress(data.address));
    eventBus.on('set-loading-state', (data) => setLoading(data.isLoading));
    eventBus.on('is-select-wallet-modal-open', (data) => setSelectWalletModalOpen(data.isSelectWalletOpen));
    eventBus.on('is-deposit-modal-open', (data) => setDepositModalOpen(data.isDepositOpen));
  }, []);

  const onSelectWalletModalClose = () => {
    setSelectWalletModalOpen(false);
  };

  const onDepositModalClose = () => {
    setDepositModalOpen(false);
  };

  return (
    <>
      <Box
        height='auto'
        padding={0}>
        <Header
          isConnected={isConnected}
          walletType={walletType}
          address={address}></Header>
        <DepositModal
          walletType={walletType}
          address={address}
          isOpen={isDepositModalOpen}
          closeModal={onDepositModalClose}
        />
        <SelectWalletModal
          isOpen={isSelectWalletModalOpen}
          closeModal={onSelectWalletModalClose}
        />
        <Intro isConnected={isConnected}></Intro>
        {isConnected && (
          <>
            <DepositWithdraw
              isConnected={isConnected}
              isLoading={isLoading}></DepositWithdraw>
            <DLCTable
              isConnected={isConnected}
              walletType={walletType}
              address={address}
              isLoading={isLoading}></DLCTable>
          </>
        )}
      </Box>
    </>
  );
}
