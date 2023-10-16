import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userSession } from '../hiroWalletUserSession';
import { WalletType } from '../models/types';

export interface AccountState {
  walletType: WalletType | null;
  address: string | null;
  blockchain: string | null;
  blockchainName: string | null;
}

const initialState: AccountState = {
  walletType: null,
  address: null,
  blockchain: null,
  blockchainName: null,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState: initialState,
  reducers: {
    login: (state, action: PayloadAction<AccountState>) => {
      state.walletType = action.payload.walletType;
      state.address = action.payload.address;
      state.blockchain = action.payload.blockchain;
      state.blockchainName = action.payload.blockchainName;
    },
    logout: (state) => {
      if (state.walletType === 'leather' || state.walletType === 'xverse') {
        userSession.signUserOut();
      }
      state.walletType = null;
      state.address = null;
      state.blockchain = null;
      state.blockchainName = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout } = accountSlice.actions;

export default accountSlice.reducer;
