import Header from './components/Header';
import Intro from './components/Intro';
import React from 'react';
import { Box } from '@chakra-ui/react';
import { useAppSelector as useSelector } from './hooks/hooks';
import LoansScreen from './components/LoansScreen';
import ModalContainer from './modals/ModalContainer';
import CustomToastContainer from './components/CustomToastHandler';
// import useTutorialStep from './hooks/useTutorialUpdater';

/* global BigInt */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider;
  }
}

export default function App() {
  const address = useSelector((state) => state.account.address);

  // useTutorialStep();

  return (
    <>
      <Box>
        <Header />
        <ModalContainer />
        <Intro />
        {address && <LoansScreen />}
      </Box>
      <CustomToastContainer />
    </>
  );
}
