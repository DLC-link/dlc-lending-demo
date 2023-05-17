import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import store from './store';
import { getAllEthereumLoansForAddress, getEthereumLoanByUUID } from '../blockchainFunctions/ethereumFunctions';
import { getAllStacksLoansForAddress } from '../blockchainFunctions/stacksFunctions';
import { customShiftValue } from '../utilities/formatFunctions';
import { formatSolidityLoanContract } from '../utilities/loanFormatter';
import { clarityFunctionNames, clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';

const initialState = {
  loans: [],
  status: 'idle',
  error: null,
  toastEvent: null,
};

export const loansSlice = createSlice({
  name: 'loans',
  initialState: initialState,
  reducers: {
    loanSetupRequested: (state, action) => {
      const initialLoan = {
        uuid: '',
        status: 'Initialized',
        formattedVaultLoan: 0,
        formattedVaultCollateral: customShiftValue(action.payload.BTCDeposit, 8, true) + ' BTC',
      };
      state.loans.unshift(initialLoan);
      state.toastEvent = {
        txHash: '',
        status: 'SetupRequested',
      };
    },
    loanEventReceived: (state, action) => {
      state.toastEvent = {
        txHash: action.payload.txHash,
        status: action.payload.status,
      };
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
      .addCase(fetchLoan.fulfilled, (state, action) => {
        let loanIndex;
        let loanStatuses;

        const { walletType, formattedLoan, loanTXHash, loanEvent } = action.payload;

        switch (walletType) {
          case 'metamask':
            loanStatuses = solidityLoanStatuses;
            break;
          case 'xverse':
          case 'hiro':
          case 'walletconnect':
            loanStatuses = clarityFunctionNames;
            break;
          default:
            console.error('Unsupported wallet type!');
            break;
        }

        if (formattedLoan.status === loanStatuses.NOTREADY) {
          loanIndex = state.loans.findIndex((loan) => loan.status === 'Initialized');
        } else {
          loanIndex = state.loans.findIndex((loan) => loan.uuid === formattedLoan.uuid);
        }

        state.loans[loanIndex] = formattedLoan;

        let toastStatus;

        switch (loanEvent) {
          case 'StatusUpdate':
            toastStatus = formattedLoan.status;
            break;
          case 'BorrowEvent':
            toastStatus = 'Borrowed';
            break;
          case 'RepayEvent':
            toastStatus = 'Repaid';
            break;
          case 'InvalidLiquidationEvent':
            toastStatus = 'InvalidLiquidation';
            break;
        }

        state.toastEvent = {
          txHash: loanTXHash,
          status: toastStatus,
        };

        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchLoan.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase('account/logout', () => initialState);
  },
});

export const { loanSetupRequested, loanEventReceived } = loansSlice.actions;

export default loansSlice.reducer;

export const selectAllLoans = (state) => {
  return state.loans.loans.slice().sort((a, b) => b.id - a.id);
};

export const selectLoanByUUID = (state, uuid) => {
  return state.loans.loans.find((loan) => loan.uuid === uuid);
};

export const selectTotalFundedCollateralAndLoan = createSelector(selectAllLoans, (loans) => {
  const fundedLoans = loans.filter((loan) =>
    [clarityLoanStatuses.FUNDED, solidityLoanStatuses.FUNDED].includes(loan.status)
  );
  const fundedCollateralSum = fundedLoans.reduce((acc, loan) => acc + loan.vaultCollateral, 0);
  const fundedLoanSum = fundedLoans.reduce((acc, loan) => acc + loan.vaultLoan, 0);
  return {
    fundedCollateralSum,
    fundedLoanSum,
  };
});

export const fetchLoans = createAsyncThunk('vaults/fetchLoans', async () => {
  const { walletType } = store.getState().account;

  let loans = [];

  switch (walletType) {
    case 'metamask':
      loans = await getAllEthereumLoansForAddress();
      break;
    case 'xverse':
    case 'hiro':
    case 'walletConnect':
      loans = await getAllStacksLoansForAddress();
      break;
    default:
      throw new Error('Unsupported wallet type!');
  }

  return loans;
});

export const fetchLoan = createAsyncThunk('vaults/fetchLoan', async (payload) => {
  const { loanUUID, loanStatus, loanTXHash, loanEvent, loanOwner } = payload;

  const { walletType } = store.getState().account;

  const loanStatusKey = Object.keys(solidityLoanStatuses)[loanStatus];
  const loanStatusValue = solidityLoanStatuses[loanStatusKey];

  const { loans } = store.getState().loans;

  const storedLoanUUIDs = loans.map((loan) => loan.uuid);

  let fetchedLoanUUIDs = [];

  if (loanStatusValue === solidityLoanStatuses.NOTREADY) {
    const fetchedLoans = await getAllEthereumLoansForAddress();
    fetchedLoanUUIDs = fetchedLoans.map((loan) => loan.uuid);
  }

  let formattedLoan;

  if (!(storedLoanUUIDs.includes(loanUUID) || fetchedLoanUUIDs.includes(loanUUID))) {
    return;
  } else {
    switch (walletType) {
      case 'metamask':
        formattedLoan = formatSolidityLoanContract(await getEthereumLoanByUUID(loanUUID));
        break;
      case 'xverse':
      case 'hiro':
      case 'walletConnect':
        break;
      default:
        throw new Error('Unsupported wallet type!');
    }
  }

  return { formattedLoan, walletType, loanTXHash, loanEvent };
});
