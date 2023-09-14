import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Decimal from 'decimal.js';
import {
  fetchUserTokenBalance,
  fetchOutstandingDebtFromVault,
  fetchVaultReservesFromChain,
} from '../blockchainFunctions/ethereumFunctions';

const initialState = {
  bitcoinUSDValue: undefined,
  dlcBtcBalance: 0,
  outstandingDebt: 0,
  vaultReserves: 0,
  status: 'idle',
  error: null,
};

export const externalDataSlice = createSlice({
  name: 'externalData',
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBitcoinValue.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchBitcoinValue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.bitcoinUSDValue = action.payload;
      })
      .addCase(fetchBitcoinValue.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchDlcBtcBalance.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchDlcBtcBalance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.dlcBtcBalance = action.payload;
      })
      .addCase(fetchDlcBtcBalance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchOutstandingDebt.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchOutstandingDebt.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.outstandingDebt = action.payload;
      })
      .addCase(fetchOutstandingDebt.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchVaultReserves.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchVaultReserves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.vaultReserves = action.payload;
      })
      .addCase(fetchVaultReserves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default externalDataSlice.reducer;

export const fetchBitcoinValue = createAsyncThunk('externalData/fetchBitcoinValue', async () => {
  let bitcoinValue = undefined;
  try {
    await fetch('https://api.coindesk.com/v1/bpi/currentprice.json', {
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.json())
      .then((message) => (bitcoinValue = new Decimal(message.bpi.USD.rate.replace(/[^0-9.-]+/g, ''))));
  } catch (error) {
    console.error(error);
  }
  return bitcoinValue.toNumber().toFixed(2);
});

export const fetchDlcBtcBalance = createAsyncThunk('externalData/fetchDlcBtcBalance', async () => {
  let balance = undefined;
  try {
    balance = await fetchUserTokenBalance('DLCBTC');
  } catch (error) {
    console.error(error);
  }
  return balance.toNumber();
});

export const fetchOutstandingDebt = createAsyncThunk('externalData/fetchOutstandingDebt', async () => {
  let balance = undefined;
  try {
    balance = await fetchOutstandingDebtFromVault();
  } catch (error) {
    console.error(error);
  }
  return balance.toNumber();
});

export const fetchVaultReserves = createAsyncThunk('externalData/fetchVaultReserves', async () => {
  let balance = undefined;
  try {
    balance = await fetchVaultReservesFromChain();
    console.log(balance);
  } catch (error) {
    console.error(error);
  }
  return balance;
});
