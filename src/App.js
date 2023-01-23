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
import Client from '@walletconnect/sign-client';
import { initiateWalletConnectClient } from './blockchainFunctions/walletConnectFunctions';

/* global BigInt */

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function App() {
  const [isConnected, setConnected] = useState(false);
  const [address, setAddress] = useState(undefined);
  const [walletType, setWalletType] = useState(undefined);
  const [isLoading, setLoading] = useState(true);
  const [isSelectWalletModalOpen, setSelectWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [blockchain, setBlockchain] = useState(undefined);
  const [walletConnectSession, setWalletConnectSession] = useState(undefined);
  const [walletConnectClient, setWalletConnectClient] = useState(undefined);
  const toast = useToast();

  const handleEvent = (data) => {
    if (data.status === 'created') {
      onDepositModalClose();
    }
    if (!toast.isActive(data.status)) {
      return toast({
        id: data.status,
        position: 'right-top',
        render: () => (
          <CustomToast
            data={data}
            walletType={walletType}></CustomToast>
        ),
      });
    }
  };

  useEffect(() => {
    const getWalletConnectClient = async () => {
      const walletConnectClient = await initiateWalletConnectClient();
      setWalletConnectClient(walletConnectClient);
    };
    if (walletConnectClient === undefined) {
      getWalletConnectClient();
    }
  }, [walletConnectClient]);

  useEffect(() => {
    eventBus.on('is-account-connected', (data) => setConnected(data.isConnected));
    eventBus.on('wallet-type', (data) => setWalletType(data.walletType));
    eventBus.on('loan-event', (data) => handleEvent(data));
    eventBus.on('set-address', (data) => setAddress(data.address));
    eventBus.on('set-loading-state', (data) => setLoading(data.isLoading));
    eventBus.on('is-select-wallet-modal-open', (data) => setSelectWalletModalOpen(data.isSelectWalletOpen));
    eventBus.on('is-deposit-modal-open', (data) => setDepositModalOpen(data.isDepositOpen));
    eventBus.on('blockchain', (data) => setBlockchain(data.blockchain));
    eventBus.on('walletconnect-session', (data) => {
      setWalletConnectSession(data.walletConnectSession);
      setAddress(data.walletConnectSession.namespaces.stacks.accounts[0].split(':')[2]);
    });
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
          address={address}
          walletConnectClient={walletConnectClient}
          walletConnectSession={walletConnectSession}></Header>
        <DepositModal
          walletType={walletType}
          address={address}
          isOpen={isDepositModalOpen}
          closeModal={onDepositModalClose}
          walletConnectSession={walletConnectSession}
          blockchain={blockchain}
          walletConnectClient={walletConnectClient}
        />
        <SelectWalletModal
          walletConnectClient={walletConnectClient}
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
              creator={address}
              walletConnectClient={walletConnectClient}
              blockchain={blockchain}
              walletConnectSession={walletConnectSession}></DLCTable>
          </>
        )}
      </Box>
    </>
  );
}
