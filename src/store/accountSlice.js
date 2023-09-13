import { createSlice } from '@reduxjs/toolkit';
import { userSession } from '../hiroWalletUserSession';

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    walletType: null,
    address: null,
    blockchain: null,
  },
  reducers: {
    login: (state, action) => {
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