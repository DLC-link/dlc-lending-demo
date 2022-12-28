/*global chrome*/

import React, { useEffect, useState } from 'react';
import eventBus from '../EventBus';
import { RepeatClockIcon } from '@chakra-ui/icons';
import { VStack, Text, HStack, Collapse, IconButton, SimpleGrid, ScaleFade } from '@chakra-ui/react';
import Card from './Card';
import { ethers } from 'ethers';
import { abi as loanManagerABI } from '../loanManagerABI';
import loanFormatter from '../LoanFormatter';
import InitialCard from './InitialCard';

export default function DLCTable(props) {
  const isConnected = props.isConnected;
  const address = props.address;
  const walletType = props.walletType;
  const [bitCoinValue, setBitCoinValue] = useState(0);
  const [loans, setLoans] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isManualLoading, setManualLoading] = useState(undefined);
  const [initialLoans, setInitialLoans] = useState([]);

  useEffect(() => {
    fetchBitcoinValue().then((bitCoinValue) => setBitCoinValue(bitCoinValue));
    refreshLoansTable(false);
    eventBus.on('fetch-loans-bg', (data) => {
      if (data.status === 'setup') {
        initialLoans.shift();
      }
      refreshLoansTable(true);
    });
    eventBus.on('create-loan', (data) => {
      initialLoans.push(data.loan);
    });
  }, []);

  useEffect(() => {
    refreshLoansTable(false);
  }, [initialLoans]);

  const fetchBitcoinValue = async () => {
    let bitCoinValue = undefined;
    await fetch('/.netlify/functions/get-bitcoin-price', {
      headers: { accept: 'Accept: application/json' },
    })
      .then((x) => x.json())
      .then(({ msg }) => (bitCoinValue = Number(msg.bpi.USD.rate.replace(/[^0-9.-]+/g, ''))));
    return bitCoinValue;
  };

  const refreshLoansTable = (isManual) => {
    setManualLoading(isManual);
    setLoading(true);
    eventBus.dispatch('set-loading-state', { isLoading: true });
    fetchAllLoans()
      .then((loans) => {
        setLoans(loans);
        countBalance(loans);
      })
      .then(() => {
        setLoading(false);
        eventBus.dispatch('set-loading-state', { isLoading: false });
      });
  };

  const fetchAllLoans = async () => {
    let loans = undefined;
    switch (walletType) {
      case 'hiro':
        loans = fetchStacksLoans();
        break;
      case 'metamask':
        loans = fetchEthereumLoans();
        break;
      default:
        console.log('Unsupported wallet type!');
        break;
    }
    return loans;
  };

  const fetchStacksLoans = async () => {
    let loans = [];
    await fetch('/.netlify/functions/get-stacks-loans?creator=' + address, {
      headers: { accept: 'Accept: application/json' },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        loans = msg;
      });
    return loans;
  };

  const fetchEthereumLoans = async () => {
    let loans = [];
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const loanManagerETH = new ethers.Contract(
        process.env.REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
        loanManagerABI,
        signer
      );
      loans = loanFormatter.formatAllDLC(await loanManagerETH.getAllLoansForAddress(address), 'solidity');
    } catch (error) {
      console.error(error);
    }
    return loans;
  };

  const countBalance = (loans) => {
    let depositAmount = 0;
    let loanAmount = 0;
    for (const loan of loans) {
      if (loan.raw.status === 'funded') {
        depositAmount += Number(loan.raw.vaultCollateral);
        loanAmount += Number(loan.raw.vaultLoan);
      }
    }
    eventBus.dispatch('change-deposit-amount', {
      depositAmount: depositAmount,
    });
    eventBus.dispatch('change-loan-amount', {
      loanAmount: loanAmount,
    });
  };

  return (
    <>
      <Collapse in={isConnected}>
        <VStack
          margin={25}
          alignContent='center'
          justifyContent='center'>
          <HStack spacing={15}>
            <Text
              fontSize={[25, 50]}
              fontWeight='extrabold'
              color='white'>
              Loans
            </Text>
            <IconButton
              _hover={{
                background: 'secondary1',
              }}
              isLoading={isLoading && isManualLoading}
              variant='outline'
              onClick={() => refreshLoansTable(true)}
              color='white'
              borderRadius='full'
              width={[25, 35]}
              height={[25, 35]}>
              <RepeatClockIcon color='accent'></RepeatClockIcon>
            </IconButton>
          </HStack>
          <ScaleFade in={!isLoading}>
            <SimpleGrid
              columns={[1, 4]}
              spacing={[0, 15]}>
              {loans?.map((loan) => (
                <Card
                  key={loan.raw.dlcUUID}
                  loan={loan}
                  creator={address}
                  walletType={walletType}
                  bitCoinValue={bitCoinValue}></Card>
              ))}
              {initialLoans?.map((loan) => (
                <InitialCard
                  loan={loan}
                  creator={address}
                  walletType={walletType}
                  bitCoinValue={bitCoinValue}></InitialCard>
              ))}
            </SimpleGrid>
          </ScaleFade>
        </VStack>
      </Collapse>
    </>
  );
}
