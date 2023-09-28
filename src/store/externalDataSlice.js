import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Decimal from 'decimal.js';
import {
  fetchUserTokenBalance,
  fetchOutstandingDebtFromVault,
  fetchVaultReservesFromChain,
  fetchVaultDepositBalanceFromChain,
} from '../blockchainFunctions/ethereumFunctions';

const initialState = {
  bitcoinUSDValue: undefined,
  dlcBtcBalance: 0,
  outstandingDebt: 0,
  vaultReserves: 0,
  vaultAssetBalance: 0,
  vDlcBtcBalance: 0,
  status: 'idle',
  error: null,
};

export const externalDataSlice = createSlice({
  name: 'externalData',
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBitcoinValue.pending, (state) => {
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
      .addCase(fetchDlcBtcBalance.pending, (state) => {
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
      .addCase(fetchOutstandingDebt.pending, (state) => {
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
      .addCase(fetchVaultReserves.pending, (state) => {
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
      })
      .addCase(fetchVaultDepositBalance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVaultDepositBalance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.vaultAssetBalance = action.payload;
      })
      .addCase(fetchVaultDepositBalance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchVdlcBtcBalance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVdlcBtcBalance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.vDlcBtcBalance = action.payload;
      })
      .addCase(fetchVdlcBtcBalance.rejected, (state, action) => {
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
  return balance;
});

// NOTE: this is only one vaults debt, not the total debt of the user across all vaults
export const fetchOutstandingDebt = createAsyncThunk('externalData/fetchOutstandingDebt', async () => {
  let balance = undefined;
  try {
    balance = await fetchOutstandingDebtFromVault();
  } catch (error) {
    console.error(error);
  }
  return balance;
});

export const fetchVaultReserves = createAsyncThunk('externalData/fetchVaultReserves', async () => {
  let balance = undefined;
  try {
    balance = await fetchVaultReservesFromChain();
  } catch (error) {
    console.error(error);
  }
  return balance;
});

export const fetchVaultDepositBalance = createAsyncThunk('externalData/fetchVaultDepositBalance', async () => {
  let balance = undefined;
  try {
    balance = await fetchVaultDepositBalanceFromChain();
  } catch (error) {
    console.error(error);
  }
  return balance;
});

export const fetchVdlcBtcBalance = createAsyncThunk('externalData/fetchVdlcBtcBalance', async () => {
  let balance = undefined;
  try {
    balance = await fetchUserTokenBalance('vDLCBTC');
  } catch (error) {
    console.error(error);
  }
  return balance;
});
