import { HStack, Switch, Text } from '@chakra-ui/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTotalFundedCollateralAndLoan, toggleShowHiddenLoans } from '../store/loansSlice';
import { fetchOutstandingDebt } from '../store/externalDataSlice';

import { useEffect, useState } from 'react';

export default function Filter() {
  const dispatch = useDispatch();

  const { showHiddenLoans } = useSelector((state) => state.loans);

  return (
    <HStack
        paddingLeft={2.5}
        paddingRight={2.5}
        height={25}
        width={162.5}
        justifyContent={'space-between'}>
        <Switch
          size='sm'
          isChecked={showHiddenLoans}
          onChange={() => dispatch(toggleShowHiddenLoans())}></Switch>
        <Text fontSize={'2xs'}>SHOW HIDDEN VAULTS</Text>
      </HStack>
  );
}
