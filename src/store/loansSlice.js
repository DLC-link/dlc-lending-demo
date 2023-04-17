import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import store from './store';
import { getAllEthereumLoansForAddress } from '../blockchainFunctions/ethereumFunctions';
import { getAllStacksLoansForAddress } from '../blockchainFunctions/stacksFunctions';
import { formatAllLoans } from '../utilities/loanFormatter';
import { customShiftValue } from '../utilities/formatFunctions';

const initialState = {
  loans: [],
  status: 'idle',
  error: null,
};

export const loansSlice = createSlice({
  name: 'loans',
  initialState: initialState,
  reducers: {
    loanSetupRequested: (state, action) => {
      const temporaryLoan = {
        uuid: '',
        status: 'Initialized',
        loanCollateral: action.payload.BTCDeposit,
        formattedCollateral: customShiftValue(action.payload.BTCDeposit, 8, true) + ' BTC',
      };
      state.loans.unshift(temporaryLoan);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchLoans.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase('account/logout', () => initialState);
  },
});

export const { loanSetupRequested } = loansSlice.actions;

export default loansSlice.reducer;

export const selectAllLoans = (state) => {
  return state.loans.loans.slice().sort((a, b) => b.id - a.id);
};

export const selectLoanByUUID = (state, uuid) => {
  return state.loans.loans.find((loan) => loan.uuid === uuid);
};

export const fetchLoans = createAsyncThunk('vaults/fetchLoans', async () => {
  const { address, walletType, blockchain } = store.getState().account;

  let loans = [];
  let responseType = '';

  switch (walletType) {
    case 'metamask':
      loans = await getAllEthereumLoansForAddress(address);
      responseType = 'solidity';
      break;
    case 'xverse':
    case 'hiro':
    case 'walletConnect':
      loans = await getAllStacksLoansForAddress(address, blockchain);
      responseType = 'clarity';
      break;
    default:
      throw new Error('Unsupported wallet type!');
  }

  console.log('Inside fetchLoans, loans: ', loans);
  return loans;
});
