import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import store from './store';
import { getAllEthereumLoansForAddress, getEthereumLoanByUUID } from '../blockchainFunctions/ethereumFunctions';
import { getAllStacksLoansForAddress, getStacksLoanByUUID } from '../blockchainFunctions/stacksFunctions';
import { customShiftValue } from '../utilities/utils';
import { formatClarityLoanContract, formatSolidityLoanContract } from '../utilities/loanFormatter';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import { ToastEvent } from '../components/CustomToast';

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
        status: ToastEvent.SETUPREQUESTED,
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
            ? state.loans.findIndex((loan) => loan.status === 'Initialized')
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
              case solidityLoanStatuses.LIQUIDATED:
              case clarityLoanStatuses.LIQUIDATED:
                toastStatus = ToastEvent.LIQUIDATED;
                break;
              case solidityLoanStatuses.PRELIQUIDATED:
              case clarityLoanStatuses.PRELIQUIDATED:
                toastStatus = ToastEvent.PRELIQUIDATED;
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
          case 'DoesNotNeedLiquidation':
            toastStatus = ToastEvent.INVALIDLIQUIDATION;
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
  const { loanUUID, loanStatus, loanTXHash, loanEvent } = payload;
  const { walletType } = store.getState().account;
  const { loans } = store.getState().loans;
  const storedLoanUUIDs = loans.map((loan) => loan.uuid);
  let fetchedLoanUUIDs = [];

  let getAllLoansForAddress;
  let getLoanByUUID;
  let formatLoanContract;

  switch (walletType) {
    case 'metamask':
      getAllLoansForAddress = getAllEthereumLoansForAddress;
      getLoanByUUID = getEthereumLoanByUUID;
      formatLoanContract = formatSolidityLoanContract;
      break;
    case 'xverse':
    case 'hiro':
      getAllLoansForAddress = getAllStacksLoansForAddress;
      getLoanByUUID = getStacksLoanByUUID;
      formatLoanContract = formatClarityLoanContract;
      break;
    case 'walletConnect':
      break;
    default:
      throw new Error('Unsupported wallet type!');
  }

  if (loanStatus === solidityLoanStatuses.READY || loanStatus === clarityLoanStatuses.READY) {
    const fetchedLoans = await getAllLoansForAddress();
    fetchedLoanUUIDs = fetchedLoans.map((loan) => loan.uuid);
  }

  if (!(storedLoanUUIDs.includes(loanUUID) || fetchedLoanUUIDs.includes(loanUUID))) return;

  const loan = await getLoanByUUID(loanUUID);
  const formattedLoan = formatLoanContract(loan);

  return { formattedLoan, loanTXHash, loanEvent };
});
