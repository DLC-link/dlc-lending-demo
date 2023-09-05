import Header from './components/Header';
import Intro from './components/Intro';
import React from 'react';
import { Box } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import LoansScreen from './components/LoansScreen';
import ModalContainer from './modals/ModalContainer';
import CustomToastContainer from './components/CustomToastHandler';
import useTutorialStep from './hooks/useTutorialUpdater';

/* global BigInt */

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function App() {
  const address = useSelector((state) => state.account.address);

  useTutorialStep();

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
