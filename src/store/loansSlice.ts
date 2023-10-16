import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { getAllEthereumLoansForAddress, getEthereumLoanByUUID } from '../blockchainFunctions/ethereumFunctions';
import { getAllStacksLoansForAddress, getStacksLoanByUUID } from '../blockchainFunctions/stacksFunctions';
import { ToastEvent } from '../components/CustomToast';
import { clarityLoanStatuses, solidityLoanStatuses } from '../enums/loanStatuses';
import {
  formatClarityLoanContract,
  formatSolidityLoanContract,
  updateLoanToFundingInProgress,
  setStateIfFunded,
} from '../utilities/loanFormatter';
import { customShiftValue } from '../utilities/utils';
import store, { RootState } from './store';
import { FormattedLoan, FormattedLoanStacks } from '../models/types';

export interface LoansState {
  loans: FormattedLoan[];
  status: string;
  error: string | undefined;
  loansWithBTCTransactions: Array<Array<string>>;
  toastEvent: { txHash: string; status?: string; successful?: boolean } | null;
  showHiddenLoans: boolean;
  hiddenLoans: Array<string>;
}

const initialState: LoansState = {
  loans: [],
  status: 'idle',
  error: undefined,
  loansWithBTCTransactions: [],
  toastEvent: null,
  showHiddenLoans: false,
  hiddenLoans: [],
};

export const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    loanSetupRequested: (state, action) => {
      const initialLoan: FormattedLoan = {
        uuid: '-',
        status: 'None',
        owner: '-',
        vaultCollateral: 0,
        vaultLoan: '0',
        liquidationFee: 0,
        liquidationRatio: 0,
        formattedLiquidationFee: '0',
        formattedLiquidationRatio: '0',
        closingTXHash: '-',
        fundingTXHash: '-',
        attestorList: [],
        formattedVaultLoan: '0',
        formattedVaultCollateral: `${customShiftValue(parseInt(action.payload.BTCDeposit), 8, true)} BTC`,
      };
      state.loans.unshift(initialLoan);
    },
    loanEventReceived: (state, action) => {
      if (action.payload.status === ToastEvent.ACCEPTSUCCEEDED) {
        state.loansWithBTCTransactions.push([action.payload.uuid, action.payload.txHash]);
        fetchLoans();
      } else if (action.payload.status === ToastEvent.CLOSEREQUESTED) {
        console.log('action.payload', action.payload);
        const loanIndex = state.loans.findIndex((loan) => loan.uuid === action.payload.uuid);
        state.loans[loanIndex].status =
          action.payload.walletType === 'metamask'
            ? solidityLoanStatuses.CLOSEREQUESTED
            : clarityLoanStatuses.CLOSEREQUESTED;
      }
      state.toastEvent = {
        txHash: action.payload.txHash,
        status: action.payload.status,
        successful: action.payload.successful,
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
        state.error = undefined;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(
        fetchLoan.fulfilled,
        // : PayloadAction<{ formattedLoan: FormattedLoan; loanTXHash: string; loanEvent: any }>
        (state, action) => {
          if (!action.payload) return;
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
                case clarityLoanStatuses.PREREPAID:
                  toastStatus = ToastEvent.PREREPAID;
                  break;
                default:
                  break;
              }
              break;
            case 'BorrowEvent':
              toastStatus = ToastEvent.BORROWED;
              break;
            case 'RepayEvent':
              toastStatus = ToastEvent.REPAID;
              break;
            default:
              break;
          }

          state.toastEvent = {
            txHash: loanTXHash,
            status: toastStatus,
          };

          state.status = 'succeeded';
          state.error = undefined;
        }
      )
      .addCase(fetchLoan.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { loanSetupRequested, loanEventReceived, hideLoan, toggleShowHiddenLoans, deleteToastEvent } =
  loansSlice.actions;

export default loansSlice.reducer;

export const selectAllLoans = (state: RootState) => {
  // return state.loans.loans.slice().sort((a, b) => b.id - a.id);
  return state.loans.loans;
};

export const selectLoanByUUID = (state: RootState, uuid: string) => {
  return state.loans.loans.find((loan) => loan.uuid === uuid);
};

export const selectTotalFundedCollateralAndLoan = createSelector(selectAllLoans, (loans) => {
  const fundedLoans = loans.filter((loan) => {
    return [clarityLoanStatuses.FUNDED, solidityLoanStatuses.FUNDED].includes(loan.status);
  });

  const fundedCollateralSum = fundedLoans.reduce((acc, loan) => {
    return acc + loan.vaultCollateral;
  }, 0);

  // const fundedLoanSum = fundedLoans.reduce((acc, loan) => {
  //   return acc + loan.vaultLoan;
  // }, 0);

  return {
    fundedCollateralSum,
    fundedLoanSum: 0,
  };
});

export const fetchLoans = createAsyncThunk('vaults/fetchLoans', async () => {
  const { walletType } = store.getState().account;
  const { loansWithBTCTransactions } = store.getState().loans;

  let loans: FormattedLoan[] = [];

  switch (walletType) {
    case 'metamask':
      loans = await getAllEthereumLoansForAddress();
      break;
    case 'xverse':
    case 'leather':
    case 'walletConnect':
      loans = (await getAllStacksLoansForAddress()) as FormattedLoanStacks[];
      break;
    default:
      throw new Error('Unsupported wallet type!');
  }

  return loans.map((loan) => {
    setStateIfFunded(loansWithBTCTransactions, loan, walletType);
    return loan;
  });
});

export const fetchLoan = createAsyncThunk(
  'vaults/fetchLoan',
  async (payload: { loanUUID: string; loanTXHash: string; loanEvent: string; loanStatus: string }) => {
    const { loanUUID, loanStatus, loanTXHash, loanEvent } = payload;
    const { walletType } = store.getState().account;
    const { loans, loansWithBTCTransactions } = store.getState().loans;
    const storedLoanUUIDs = loans.map((loan) => loan.uuid);
    let fetchedLoanUUIDs: string[] = [];

    const getAllLoansForAddress = getAllEthereumLoansForAddress;
    const getLoanByUUID = getEthereumLoanByUUID;
    const formatLoanContract = formatSolidityLoanContract;

    switch (walletType) {
      case 'metamask':
        // getAllLoansForAddress = getAllEthereumLoansForAddress;
        // getLoanByUUID = getEthereumLoanByUUID;
        // formatLoanContract = formatSolidityLoanContract;
        break;
      case 'xverse':
      case 'leather':
        // getAllLoansForAddress = getAllStacksLoansForAddress;
        // getLoanByUUID = getStacksLoanByUUID;
        // formatLoanContract = formatClarityLoanContract;
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
    let formattedLoan = formatLoanContract(loan);

    formattedLoan = setStateIfFunded(loansWithBTCTransactions, formattedLoan, walletType);

    return { formattedLoan, loanTXHash, loanEvent };
  }
);
