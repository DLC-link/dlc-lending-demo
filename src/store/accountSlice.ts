import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userSession } from '../hiroWalletUserSession';

export type walletType = 'metamask' | 'xverse' | 'leather' | 'walletConnect';

export interface AccountState {
  walletType: walletType | null;
  address: string | null;
  blockchain: string | null;
}

const initialState: AccountState = {
  walletType: null,
  address: null,
  blockchain: null,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState: initialState,
  reducers: {
    login: (state, action: PayloadAction<AccountState>) => {
      state.walletType = action.payload.walletType;
      state.address = action.payload.address;
      state.blockchain = action.payload.blockchain;
    },
    logout: (state) => {
      if (state.walletType === 'leather' || state.walletType === 'xverse') {
        userSession.signUserOut();
      }
      state.walletType = null;
      state.address = null;
      state.blockchain = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout } = accountSlice.actions;

export default accountSlice.reducer;
