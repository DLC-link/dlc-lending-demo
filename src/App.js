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
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isSelectWalletModalOpen, setSelectWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    eventBus.on('is-account-connected', (data) => setConnected(data.isConnected));
    eventBus.on('loan-event', (data) => {
      if (data.status === 'created') {
        onDepositModalClose();
      }
      handleEvent(data);
    });
    eventBus.on('set-address', (data) => setAddress(data.address));
    eventBus.on('wallet-type', (data) => setWalletType(data.walletType));
    eventBus.on('set-loading-state', (data) => setLoading(data.isLoading));
    eventBus.on('is-select-wallet-modal-open', (data) => setSelectWalletModalOpen(data.isSelectWalletOpen));
    eventBus.on('is-deposit-modal-open', (data) => setDepositModalOpen(data.isDepositOpen));
  }, [walletType]);

  const onSelectWalletModalClose = () => {
    setSelectWalletModalOpen(false);
  };

  const onDepositModalClose = () => {
    setDepositModalOpen(false);
  };

  const handleEvent = (data) => {
    const toastMap = {
      created: 'Loan created!',
      setup: 'Loan established!',
      ready: 'Loan is ready!',
      funded: 'Loan funded!',
      'liquidation-requested': 'Requested liquidation!',
      liquidating: 'Processing liquidation!',
      'borrow-requested': 'Requested borrow!',
      borrowed: 'USDC borrowed!',
      'repay-requested': 'Requested repayment!',
      repaid: 'USDC repaid!',
      'closing-requested': 'Requested closing!',
      closing: 'Processing closing!',
      closed: 'Loan closed!',
      'approve-requested': 'Approve requested!',
      approved: 'Approved!',
      cancelled: 'Transaction cancelled!',
    };

    let success = !(data.status === 'cancelled');
    let message = toastMap[data.status];
    let explorerAddress;

    switch (walletType) {
      case 'hiro':
        explorerAddress = `https:/https://explorer.stacks.co/txid/${data.txId}`;
        break;
      case 'metamask':
        explorerAddress = `https://goerli.etherscan.io/tx/${data.txId}`;
        break;
    }

    if (!toast.isActive(data.status))
      return toast({
        id: data.status,
        position: 'right-top',
        render: () => (
          <CustomToast
            explorerAddress={explorerAddress}
            message={message}
            success={success}></CustomToast>
        ),
      });
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
