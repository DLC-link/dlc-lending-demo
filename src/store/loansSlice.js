import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { forEach } from 'ramda';
import { getAllEthereumLoansForAddress, getEthereumLoanByUUID } from '../blockchainFunctions/ethereumFunctions';
import { getAllStacksLoansForAddress, getStacksLoanByUUID } from '../blockchainFunctions/stacksFunctions';
import { ToastEvent } from '../components/CustomToast';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import {
  formatClarityLoanContract,
  formatSolidityLoanContract,
  updateLoanToFundingInProgress,
} from '../utilities/loanFormatter';
import { customShiftValue } from '../utilities/utils';
import store from './store';

const initialState = {
  loans: [],
  status: 'idle',
  error: null,
  loansWithBTCTransactions: [],
  toastEvent: null,
  showHiddenLoans: false,
  hiddenLoans: [],
};

export const loansSlice = createSlice({
  name: 'loans',
  initialState: initialState,
  reducers: {
    loanSetupRequested: (state, action) => {
      const initialLoan = {
        uuid: '-',
        status: 'None',
        formattedVaultLoan: 0,
        formattedVaultCollateral: customShiftValue(action.payload.BTCDeposit, 8, true) + ' BTC',
      };
      state.loans.unshift(initialLoan);
    },
    loanEventReceived: (state, action) => {
      if (action.payload.status === ToastEvent.ACCEPTSUCCEEDED) {
        state.loansWithBTCTransactions.push([action.payload.uuid, action.payload.txHash]);
        fetchLoans();
      }
      state.toastEvent = {
        txHash: action.payload.txHash,
        status: action.payload.status,
      };
    },
    hideLoan: (state, action) => {
      if (state.hiddenLoans.includes(action.payload)) {
        state.hiddenLoans = state.hiddenLoans.filter((loan) => loan !== action.payload);
      } else {
        state.hiddenLoans.push(action.payload);
      }
    },
    toggleShowHiddenLoans: (state) => {
      state.showHiddenLoans = !state.showHiddenLoans;
    },
    deleteToastEvent: (state) => {
      state.toastEvent = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchLoans.pending, (state) => {
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
        const { formattedLoan, loanTXHash, loanEvent } = action.payload;

        const loanIndex =
          formattedLoan.status === solidityLoanStatuses.READY || formattedLoan.status === clarityLoanStatuses.READY
            ? state.loans.findIndex((loan) => loan.status === 'None')
            : state.loans.findIndex((loan) => loan.uuid === formattedLoan.uuid);

        state.loans[loanIndex] = formattedLoan;

        let toastStatus;

        switch (loanEvent) {
          case 'StatusUpdate':
            switch (formattedLoan.status) {
              case solidityLoanStatuses.READY:
              case clarityLoanStatuses.READY:
                toastStatus = ToastEvent.READY;
                break;
              case solidityLoanStatuses.FUNDED:
              case clarityLoanStatuses.FUNDED:
                toastStatus = ToastEvent.FUNDED;
                break;
              case solidityLoanStatuses.PRECLOSED:
              case clarityLoanStatuses.PRECLOSED:
                toastStatus = ToastEvent.PREREPAID;
                break;
            }
            break;
          case 'BorrowEvent':
            toastStatus = ToastEvent.BORROWED;
            break;
          case 'RepayEvent':
            toastStatus = ToastEvent.REPAID;
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
      });
  },
});

export const { loanSetupRequested, loanEventReceived, hideLoan, toggleShowHiddenLoans, deleteToastEvent } =
  loansSlice.actions;

export default loansSlice.reducer;

export const selectAllLoans = (state) => {
  return state.loans.loans.slice().sort((a, b) => b.id - a.id);
};

export const selectLoanByUUID = (state, uuid) => {
  return state.loans.loans.find((loan) => loan.uuid === uuid);
};

export const selectTotalFundedCollateralAndLoan = createSelector(selectAllLoans, (loans) => {
  const fundedLoans = loans.filter((loan) => {
    return [clarityLoanStatuses.FUNDED, solidityLoanStatuses.FUNDED].includes(loan.status);
  });

  const fundedCollateralSum = fundedLoans.reduce((acc, loan) => {
    return acc + loan.vaultCollateral;
  }, 0);

  const fundedLoanSum = fundedLoans.reduce((acc, loan) => {
    return acc + loan.vaultLoan;
  }, 0);

  return {
    fundedCollateralSum,
    fundedLoanSum,
  };
});

export const fetchLoans = createAsyncThunk('vaults/fetchLoans', async () => {
  const { walletType } = store.getState().account;
  const { loansWithBTCTransactions } = store.getState().loans;

  let loans = [];

  switch (walletType) {
    case 'metamask':
      loans = await getAllEthereumLoansForAddress();
      break;
    case 'xverse':
    case 'leather':
    case 'walletConnect':
      loans = await getAllStacksLoansForAddress();
      break;
    default:
      throw new Error('Unsupported wallet type!');
  }

  forEach((loan) => {
    const matchingLoanWithBTCTransaction = loansWithBTCTransactions.find(
      (loanWithBTCTransaction) => loan.uuid === loanWithBTCTransaction[0]
    );
    if (matchingLoanWithBTCTransaction) {
      updateLoanToFundingInProgress(loan, matchingLoanWithBTCTransaction[1], walletType);
    }
  }, loans);

  return loans;
});

export const fetchLoan = createAsyncThunk('vaults/fetchLoan', async (payload) => {
  const { address } = store.getState().account;
  const { loanUUID, loanStatus, loanTXHash, loanEvent } = payload;
  const { walletType } = store.getState().account;
  
  let getLoanByUUID;
  let formatLoanContract;

  switch (walletType) {
    case 'metamask':
      getLoanByUUID = getEthereumLoanByUUID;
      formatLoanContract = formatSolidityLoanContract;
      break;
    case 'xverse':
    case 'leather':
    case 'walletConnect':
      getLoanByUUID = getStacksLoanByUUID;
      formatLoanContract = formatClarityLoanContract;
      break;
    default:
      throw new Error('Unsupported wallet type!');
  }

  const loan = await getLoanByUUID(loanUUID);

  if (loan.owner.toLowerCase() !== address.toLowerCase()) return;

  const formattedLoan = formatLoanContract(loan);

  return { formattedLoan, loanTXHash, loanEvent };
});
