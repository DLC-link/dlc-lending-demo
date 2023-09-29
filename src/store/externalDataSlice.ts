import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Decimal from 'decimal.js';
import {
  fetchUserTokenBalance,
  fetchOutstandingDebtFromVault,
  fetchVaultReservesFromChain,
  fetchVaultDepositBalanceFromChain,
} from '../blockchainFunctions/ethereumFunctions';

export interface ExternalDataState {
  bitcoinUSDValue: string | undefined;
  dlcBtcBalance: string | undefined;
  outstandingDebt: string | undefined;
  vaultReserves: string | undefined;
  vaultAssetBalance: string | undefined;
  vDlcBtcBalance: string | undefined;
  status: string;
  error: string | undefined;
}

const initialState: ExternalDataState = {
  bitcoinUSDValue: undefined,
  dlcBtcBalance: '0',
  outstandingDebt: '0',
  vaultReserves: '0',
  vaultAssetBalance: '0',
  vDlcBtcBalance: '0',
  status: 'idle',
  error: undefined,
};

export const externalDataSlice = createSlice({
  name: 'externalData',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBitcoinValue.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBitcoinValue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = undefined;
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
        state.error = undefined;
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
        state.error = undefined;
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
        state.error = undefined;
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
        state.error = undefined;
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
        state.error = undefined;
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
  try {
    const resp = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json', {
      headers: { Accept: 'application/json' },
    });
    const json = await resp.json();
    const bitcoinValue = new Decimal(json.bpi.USD.rate.replace(/[^0-9.-]+/g, ''));
    return bitcoinValue?.toNumber().toFixed(2);
  } catch (error) {
    console.error(error);
  }
});

export const fetchDlcBtcBalance = createAsyncThunk('externalData/fetchDlcBtcBalance', async () => {
  try {
    return await fetchUserTokenBalance('DLCBTC');
  } catch (error) {
    console.error(error);
  }
});

// NOTE: this is only one vaults debt, not the total debt of the user across all vaults
export const fetchOutstandingDebt = createAsyncThunk('externalData/fetchOutstandingDebt', async () => {
  try {
    return await fetchOutstandingDebtFromVault();
  } catch (error) {
    console.error(error);
  }
});

export const fetchVaultReserves = createAsyncThunk('externalData/fetchVaultReserves', async () => {
  try {
    return await fetchVaultReservesFromChain();
  } catch (error) {
    console.error(error);
  }
});

export const fetchVaultDepositBalance = createAsyncThunk('externalData/fetchVaultDepositBalance', async () => {
  try {
    return await fetchVaultDepositBalanceFromChain();
  } catch (error) {
    console.error(error);
  }
});

export const fetchVdlcBtcBalance = createAsyncThunk('externalData/fetchVdlcBtcBalance', async () => {
  try {
    return await fetchUserTokenBalance('vDLCBTC');
  } catch (error) {
    console.error(error);
  }
});
