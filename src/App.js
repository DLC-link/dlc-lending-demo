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

/* global BigInt */

BigInt.prototype.toJSON = function() { return this.toString() }

export default function App() {
  const [isConnected, setConnected] = useState(false);
  const [address, setAddress] = useState(undefined);
  const [walletType, setWalletType] = useState(undefined);
  const [isLoading, setLoading] = useState(true);
  const [isSelectWalletModalOpen, setSelectWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [stacksChain, setStacksChain] = useState(undefined);
  const [xverseSession, setXverseSession] = useState(undefined);
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
    const initiateWalletConnectClient = async () => {
      const walletConnectClient = await Client.init({
        logger: 'debug',
        relayUrl: 'wss://relay.walletconnect.com',
        projectId: '15e1912940165aa0fc41fb062d117593',
        metadata: {
          name: 'DLC.Link',
          description: 'Use Native Bitcoin Without Bridging',
          url: 'https://www.dlc.link/',
          icons: ['https://dlc-public-assets.s3.amazonaws.com/DLC.Link_logo_icon_color.svg'],
        },
      });
      setWalletConnectClient(walletConnectClient);
    };

    if (walletConnectClient === undefined) {
      initiateWalletConnectClient();
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
    eventBus.on('stacks-chain', (data) => setStacksChain(data.stacksChain));
    eventBus.on('xverse-session', (data) => {
      setXverseSession(data.xverseSession);
      setAddress(data.xverseSession.namespaces.stacks.accounts[0].split(':')[2]);
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
          address={address}></Header>
        <DepositModal
          walletType={walletType}
          address={address}
          isOpen={isDepositModalOpen}
          closeModal={onDepositModalClose}
          xverseSession={xverseSession}
          stacksChain={stacksChain}
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
              address={address}
              isLoading={isLoading}
              walletConnectClient={walletConnectClient}
              stacksChain={stacksChain}
              xverseSession={xverseSession}></DLCTable>
          </>
        )}
      </Box>
    </>
  );
}
